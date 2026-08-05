/**
 * Common-Curriculum course doc sync.
 *
 * Receives one course's context payload from GitHub Actions and rebuilds that
 * course's Google Doc from scratch. One doc per course; the doc is downstream
 * of the repo and any edit made in it is lost on the next push.
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
  if (!Array.isArray(payload.pages)) {
    return jsonResponse({ ok: false, error: "invalid_payload", message: "Payload must include a pages array." });
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
    rebuildDocument(docId, payload);
    return jsonResponse({
      ok: true,
      course: payload.course,
      document_id: docId,
      page_count: payload.pages.length,
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

function rebuildDocument(docId, payload) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  body.clear();

  body.appendParagraph(payload.title || payload.course)
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  if (payload.intro) {
    body.appendParagraph(payload.intro).editAsText().setItalic(true);
  }

  body.appendParagraph("Last updated " + (payload.generated_at_pacific || "unknown") + " Pacific.")
    .editAsText().setItalic(true).setFontSize(9);
  body.appendParagraph("");

  payload.pages.forEach(function (page) {
    body.appendParagraph(page.title || page.path)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    renderContent(body, page.content || "");
    body.appendParagraph("");
  });

  if (Array.isArray(payload.glossary) && payload.glossary.length > 0) {
    body.appendParagraph("Glossary")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    payload.glossary.forEach(function (entry) {
      body.appendParagraph(entry.term)
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph(entry.definition || "");
    });
  }

  doc.saveAndClose();
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
