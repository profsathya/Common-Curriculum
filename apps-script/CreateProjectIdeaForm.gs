/**
 * CST499 Capstone — Project Ideas form generator (Fall 2026).
 *
 * Run createProjectIdeaForm() once. It builds the whole form from the question
 * set in cowork/fall-2026-courses/cst499-project-idea-form-2026-08-18.md and
 * logs the live URL and the edit URL.
 *
 * How to run it:
 *   1. script.google.com > New project
 *   2. Paste this file in, save
 *   3. Run > createProjectIdeaForm, and approve the permission prompt
 *   4. Open View > Logs (or the execution log) for the two URLs
 *
 * Running it a second time creates a second form. It does not update the first.
 * To change wording, edit the form in the Forms UI, or delete it and re-run.
 *
 * The form lands in the root of your Drive. Set DEST_FOLDER_ID below to move it
 * somewhere else; leave it empty to skip the move.
 */

var FORM_TITLE = "CST499 Capstone — Project Ideas, Fall 2026";
var DEST_FOLDER_ID = "";

var FORM_DESCRIPTION = [
  "Share a project idea for our computer science capstone students.",
  "",
  "What we are looking for is a problem space rather than a specification — a live effort with real users and real unresolved gaps, big enough that a student can find their own problem inside it. Students write their own proposals in week 4 (due Monday 21 September), and they are assessed on how they decided what to build, built it, and delivered it. So the more room your idea leaves for a student's judgement, the better it works here.",
  "",
  "Nothing below is required. \"Not sure\" is a fine answer to any of it — several of these questions are ones we are still working out ourselves."
].join("\n");

function createProjectIdeaForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);
  form.setProgressBar(true);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  addSectionOne(form);
  addSectionTwo(form);
  addSectionThree(form);
  addSectionFour(form);
  addSectionFive(form);

  if (DEST_FOLDER_ID) {
    moveToFolder(form.getId(), DEST_FOLDER_ID);
  }

  var live = form.getPublishedUrl();
  var edit = form.getEditUrl();
  Logger.log("Live URL: " + live);
  Logger.log("Edit URL: " + edit);
  return { liveUrl: live, editUrl: edit };
}

function addSectionOne(form) {
  section(form, "About you", "");

  shortText(form, "Your name", "");
  shortText(form, "Email", "");
  choice(form, "Which describes you?", "", [
    "Industry mentor",
    "Faculty",
    "Student",
    "Other"
  ], true);
  shortText(form, "Organization or department, if any", "");
}

function addSectionTwo(form) {
  section(form, "The space", "The project or problem space itself — what it is and who it serves.");

  longText(form, "What is the project or problem space?", "A few sentences is plenty.");
  shortText(form, "Link to it, if there is one", "Repo, site, issue tracker, documentation.");
  longText(form, "Who uses it, or would use it?", "Or: not sure.");
}

function addSectionThree(form) {
  section(form, "Is it real?",
    "These are the questions we use to decide whether a space can carry a capstone. Skip any of them you cannot answer.");

  choice(form, "Is this live and running today, or would a student be starting it from nothing?", "", [
    "Live and in use",
    "Exists but dormant",
    "Would start from nothing",
    "Not sure"
  ], false);

  longText(form, "Who reacts to a contribution — a maintainer, a community, a team, a customer?",
    "Or: not sure.");

  longText(form, "How does an outsider contribute?",
    "Is there a documented process, an open issue list, a review step? Or: not sure.");

  longText(form, "If an AI wrote a working version of this in an afternoon, what would still be unsolved?",
    "This is the question we lean on hardest. Or: not sure.");

  longText(form, "Name one or two things that are genuinely unresolved in this space today",
    "At the level of \"someone would need to look into this\", not a task list. Or: not sure.");
}

function addSectionFour(form) {
  section(form, "Depth", "");

  longText(form, "Which areas, disciplines, or systems does this genuinely span?", "Or: not sure.");
  longText(form, "What would someone need to pick up to work in this space that a computer science graduate would not already have?",
    "Or: not sure.");
}

function addSectionFive(form) {
  section(form, "Working with us", "");

  choice(form, "Roughly how many students could work in this space at once, each on their own piece?", "", [
    "1",
    "2–3",
    "4 or more",
    "Not sure"
  ], false);

  choice(form, "If a maintainer or user doesn't respond in time, would you be willing to be the person who reacts to a student's work?", "", [
    "Yes",
    "No",
    "Not sure"
  ], false);

  choice(form, "How involved would you like to be?", "", [
    "A conversation or two",
    "Regular check-ins",
    "Ongoing mentorship",
    "Prefer not to be involved once it starts",
    "Not sure"
  ], false);

  longText(form, "Is there anything that has to happen — a deadline, a tool, an approval, an NDA?", "");
  longText(form, "Anything else we should know?", "");
}

function section(form, title, help) {
  var page = form.addPageBreakItem().setTitle(title);
  if (help) {
    page.setHelpText(help);
  }
  return page;
}

function shortText(form, title, help) {
  var item = form.addTextItem().setTitle(title).setRequired(false);
  if (help) {
    item.setHelpText(help);
  }
  return item;
}

function longText(form, title, help) {
  var item = form.addParagraphTextItem().setTitle(title).setRequired(false);
  if (help) {
    item.setHelpText(help);
  }
  return item;
}

function choice(form, title, help, options, withOther) {
  var item = form.addMultipleChoiceItem().setTitle(title).setRequired(false);
  if (help) {
    item.setHelpText(help);
  }
  item.setChoiceValues(options);
  if (withOther) {
    item.showOtherOption(true);
  }
  return item;
}

function moveToFolder(fileId, folderId) {
  var file = DriveApp.getFileById(fileId);
  var folder = DriveApp.getFolderById(folderId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}
