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
 *   4. Open the execution log for the two URLs
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
  "What we are looking for is a problem space rather than a specification — something with real users and real undecided parts, big enough that a student can find their own problem inside it. Students write their own proposals in week 4 (due Monday 21 September), and they are assessed on how they decided what to build, built it, and delivered it. So the more room your idea leaves for a student's judgement, the better it works here.",
  "",
  "Nothing below is required. \"Not sure\" is a fine answer to any of it — several of these questions are ones we are still working out ourselves."
].join("\n");

function createProjectIdeaForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);
  form.setProgressBar(true);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  addAboutYou(form);
  addProblemSpace(form);
  addDepthAndBreadth(form);
  addWorkingWithUs(form);

  if (DEST_FOLDER_ID) {
    moveToFolder(form.getId(), DEST_FOLDER_ID);
  }

  var live = form.getPublishedUrl();
  var edit = form.getEditUrl();
  Logger.log("Live URL: " + live);
  Logger.log("Edit URL: " + edit);
  return { liveUrl: live, editUrl: edit };
}

function addAboutYou(form) {
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

function addProblemSpace(form) {
  section(form, "The Problem Space", "");

  longText(form, "What is the problem this project is trying to solve?", "");
  longText(form, "Who are its customers?", "");
  choice(form, "Is it a new project or an existing project?", "", [
    "New project",
    "Existing project",
    "Not sure"
  ], false);
  longText(form, "If it is a new project, what other solutions exist for this problem?", "");
  longText(form, "Name one or two things that are undecided about the problem scope — can students take the lead in deciding them?", "");
}

function addDepthAndBreadth(form) {
  section(form, "Depth and Breadth", "");

  longText(form, "Does the project span more than one discipline, domain, or system? If yes, which ones?", "");
  longText(form, "Will this give students an opportunity to demonstrate their ability to learn something new? Please explain.", "");
  longText(form, "If students gave the project description to an AI — say Google AI Studio — do you have any suggestions on the value they would need to add to improve the outcome?", "");
}

function addWorkingWithUs(form) {
  section(form, "Working with us", "");

  choice(form, "Roughly how many students could work in this space?",
    "Please note: each student should have an independent goal, will submit a separate proposal, and will produce independent artifacts.", [
    "1",
    "2–3",
    "4 or more",
    "Not sure"
  ], false);

  longText(form, "Does the direction of the course sound reasonable to you? Do you see the focus on durable skills as complementary to the project goals?", "");
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
