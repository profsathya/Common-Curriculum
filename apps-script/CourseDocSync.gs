/**
 * Common-Curriculum course doc sync.
 *
 * Receives one course's context payload from GitHub Actions and rewrites the
 * named tabs of that course's Google Doc. Each doc has a Course tab and a Dojo
 * tab; a payload carries one or both, and any tab it does not name is left
 * completely alone. That is what lets a dojo edit refresh the Dojo tab in every
 * course doc without rebuilding any course content.
 *
 * Tabs cannot be created by script — add them by hand once per doc, then keep
 * their titles matching config/course-docs.json.
 *
 * The doc is downstream of the repo. Any edit made in a synced tab is lost the
 * next time that tab syncs.
 *
 * Script properties this expects:
 *   COURSE_DOC_SYNC_TOKEN  shared secret, must match the GitHub secret
 *   COURSE_DOC_IDS         JSON map, e.g. {"cst499":"1AbC...","cst286":"1XyZ..."}
 */

var TOKEN_PROPERTY = "COURSE_DOC_SYNC_TOKEN";
var DOC_MAP_PROPERTY = "COURSE_DOC_IDS";

function doPost(e) {
  var parsed = parsePayload(e);
  if (!parsed.ok) {
    return jsonResponse({ ok: false, error: parsed.error, message: parsed.message });
  }

  var payload = parsed.payload;
  var props = PropertiesService.getScriptProperties();
  var expectedToken = props.getProperty(TOKEN_PROPERTY);

  if (!expectedToken) {
    return jsonResponse({
      ok: false,
      error: "missing_token_property",
      message: "Script property " + TOKEN_PROPERTY + " is not set."
    });
  }
  if (!payload.token || payload.token !== expectedToken) {
    return jsonResponse({ ok: false, error: "invalid_token", message: "Missing or invalid sync token." });
  }
  if (!payload.course) {
    return jsonResponse({ ok: false, error: "missing_course", message: "Payload must name a course." });
  }
  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    return jsonResponse({
      ok: false,
      error: "invalid_payload",
      message: "Payload must include a non-empty sections array."
    });
  }

  var docId = lookupDocId(props, payload.course);
  if (!docId) {
    return jsonResponse({
      ok: false,
      error: "unknown_course",
      message: "No document ID for course '" + payload.course + "' in " + DOC_MAP_PROPERTY + "."
    });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return jsonResponse({ ok: false, error: "lock_timeout", message: "Could not acquire the sync lock." });
  }

  try {
    var written = rebuildDocument(docId, payload);
    return jsonResponse({
      ok: true,
      course: payload.course,
      document_id: docId,
      tabs_written: written.tabs,
      page_count: written.pages,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: "document_update_failed", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function lookupDocId(props, course) {
  var raw = props.getProperty(DOC_MAP_PROPERTY);
  if (!raw) {
    return null;
  }
  try {
    var map = JSON.parse(raw);
    return map[course] || null;
  } catch (err) {
    return null;
  }
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return { ok: false, error: "missing_body", message: "Request must include a JSON body." };
  }
  try {
    return { ok: true, payload: JSON.parse(e.postData.contents) };
  } catch (err) {
    return { ok: false, error: "invalid_json", message: String(err) };
  }
}

/**
 * Collect the document's tabs by title, including nested ones, so a tab that
 * gets dragged under another still resolves.
 */
function collectTabs(tabs, found) {
  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];
    found[tab.getTitle()] = tab;
    var children = tab.getChildTabs();
    if (children && children.length) {
      collectTabs(children, found);
    }
  }
  return found;
}

function rebuildDocument(docId, payload) {
  var doc = DocumentApp.openById(docId);
  var tabsByTitle = collectTabs(doc.getTabs(), {});

  // Resolve every tab before writing anything, so one bad title can't leave
  // the document half-updated.
  var targets = [];
  for (var i = 0; i < payload.sections.length; i++) {
    var section = payload.sections[i];
    var tab = tabsByTitle[section.tab];
    if (!tab) {
      var available = Object.keys(tabsByTitle).join(", ") || "none";
      throw new Error(
        "This document has no tab titled '" + section.tab + "'. Tabs found: " + available +
        ". Add the tab in Google Docs, or fix the title in config/course-docs.json."
      );
    }
    targets.push({ section: section, tab: tab });
  }

  var titles = [];
  var pages = 0;
  for (var j = 0; j < targets.length; j++) {
    writeSection(targets[j].tab.asDocumentTab().getBody(), targets[j].section, payload);
    titles.push(targets[j].section.tab);
    pages += (targets[j].section.pages || []).length;
  }

  doc.saveAndClose();
  return { tabs: titles, pages: pages };
}

function writeSection(body, section, payload) {
  body.clear();

  body.appendParagraph(section.heading || payload.title || payload.course)
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  if (section.intro) {
    body.appendParagraph(section.intro).editAsText().setItalic(true);
  }

  body.appendParagraph("Last updated " + (payload.generated_at_pacific || "unknown") + " Pacific.")
    .editAsText().setItalic(true).setFontSize(9);
  body.appendParagraph("");

  (section.pages || []).forEach(function (page) {
    body.appendParagraph(page.title || page.path)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    renderContent(body, page.content || "");
    body.appendParagraph("");
  });

  if (Array.isArray(section.glossary) && section.glossary.length > 0) {
    body.appendParagraph("Glossary")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section.glossary.forEach(function (entry) {
      body.appendParagraph(entry.term)
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph(entry.definition || "");
    });
  }
}

function renderContent(body, content) {
  String(content).split(/\r?\n/).forEach(function (line) {
    if (line.trim() === "") {
      return;
    }

    var heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      body.appendParagraph(heading[2].trim()).setHeading(headingFor(heading[1].length));
      return;
    }

    if (line.indexOf("- ") === 0) {
      body.appendListItem(line.substring(2)).setGlyphType(DocumentApp.GlyphType.BULLET);
      return;
    }

    var bold = line.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      body.appendParagraph(bold[1]).editAsText().setBold(true);
      return;
    }

    body.appendParagraph(line);
  });
}

function headingFor(level) {
  if (level <= 1) {
    return DocumentApp.ParagraphHeading.HEADING2;
  }
  if (level === 2) {
    return DocumentApp.ParagraphHeading.HEADING2;
  }
  if (level === 3) {
    return DocumentApp.ParagraphHeading.HEADING3;
  }
  return DocumentApp.ParagraphHeading.HEADING4;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
