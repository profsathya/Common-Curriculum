# Capstone Festival Guide (prototype v2, 2026-11-23)

Companion to capstone-festival-site.html. Edit this file; Alan carries changes into the HTML.
Live page: https://profsathya.github.io/Common-Curriculum/cst499/capstone-festival-site.html
Replaced the 11 Nov version on 2026-11-23; the earlier version is in the repo history.
All students and projects are made up (the same fifteen as before).

## Decisions behind it
- 11 Nov: the audience is festival visitors, and the site gives each visitor a personal route. AI drafts each student's page ahead of time from their Interactive Poster and the student approves it. One static page, no backend; a visitor's answers stay on their device. Prototype first; Sergio gets the fine-tuning and the engineering parts.
- 20 Nov (Slack with Sergio and Utsab): a professional look with a small number of colors, the CSUMB colors. Another audience is Sathya's LinkedIn network.
- 23 Nov: one design. Sathya tried two merged pages per student, then five screens with one thing on each, then asked what the research says and chose three screens per student, each fitting the phone. The visitor collects a stamp for each student, and the stamp is the Otter logo.

## Front door (fits one phone screen)
- The Cal State Monterey Bay logo at the top left (the copy in cowork/fall-2026-courses/csumb-logo.jpg)
- Eyebrow: B.S. Computer Science
- Title: Capstone Festival
- Line: December 2026 · 15 students. Collect a stamp for each student you visit.
- Heading: I am a
  - Family member or friend
  - Hiring manager or industry guest
  - Faculty member
  - University administrator
  - Student
- Link: See all 15 students

## Second question, by visitor
- Family or friend: "Who are you here for?" Type a name, pick the student.
- Employer: "What kind of work do you hire for?" The five areas of work, or "Any of these".
- Faculty: "What would you like to see today?"
  - How students made decisions / What they chose, what else they considered, and what the choice cost.
  - How students worked across domains / Where a second field of knowledge changed the work.
  - How students used AI in their work / Where AI helped, and where the student had to direct or correct it.
- Administrator: no question.
- Student: "What are you curious about?" The five areas, or "Show me a mix".

## Who comes first
- Family: their own student, with the eyebrow "You are here for". Then one student in the same room and one in another room.
- Hiring manager and Student: students in the chosen area first, then one from another area.
- Faculty: students whose posters show the chosen lens, spread across rooms.
- University administrator: one table per area, with a short program story above the first card (draft wording below).
- When the planned students run out, the next two are the nearest tables the visitor has not opened.

## One student, three screens
Three bars at the top fill in. Next and Back are at the bottom. A tap on the screen also moves on; a tap on the left third goes back.
1. Who and what: a Monterey Bay Blue band with the white (reversed) Cal State Monterey Bay logo at its top right, then photo space (initials until a photo is added), name, Room and Table. Family see "You are here for"; everyone else sees the area of work. Below it: "What [first name] did" in plain words for family; "The project" (title and description) for everyone else. Foot line: "Drafted by AI from [first name]'s Interactive Poster. Read and approved by [first name] before it was published."
2. What it shows and what to ask: "What this shows about [first name]" for family, "[First name]'s claim" for everyone else. Then "Questions you can ask [first name]": two specific questions and one that is the same on every student: "What was the hardest decision you made, and what did you give up by making it?" Everyone else gets "A question to ask [first name]" (faculty get the question for their lens).
3. "Stamp your visit": a dashed circle that says "Tap to stamp your visit". Beside it: Room and Table, and "Stamp your passport when you have visited [first name]." Tapping stamps it; tapping the stamp undoes it. Then two buttons, "Interactive Poster" and "LinkedIn" (sample links in the prototype). Then "Visit next" with two students, one line each. Then My passport · All students · Start over. Buttons: Back · "Next: [next student's first name]".
- University administrators get one screen before the first student: "About this capstone" (draft wording below).

## The data file (added 23 Nov)
- The page holds the design and the wording. The students and the areas of work are in capstone-festival-data.js, next to the page. capstone-festival-data-sample.js holds the fifteen made-up students and shows the format; it is not edited.
- Alan (Claude) edits the page and never opens capstone-festival-data.js once it holds real students. Codex writes that file and the posters folder.
- Top of the file: sample (true only for made-up students), allApproved (set to true on Sat 12 Dec, which removes every "Draft" line), areas (key and label for each area of work), students (one entry each).
- Each student: id ("student-" plus the name in lowercase with hyphens), name, project, cat (an area key), room and table (null until rooms are assigned), plain (family wording), desc (professional wording), claim, fam (two questions), pro (one question), lens (d, x, a questions, each optional), poster (posters/<name>.html), linkedin, photo, approved.
- What the page does with missing things: no room, no Room and Table shown, and My passport groups students by area of work; no poster or no LinkedIn, that button is left out; no claim, the claim box is left out.
- Until a student is approved, their first screen starts with "Draft. [First name] has not approved this page yet." and the foot line ends "[First name] has not approved this page yet." Students have until Fri 11 Dec to ask for changes.
- The front page foot line for real students: "Each student's pages were drafted by AI from their Interactive Poster. A page marked Draft has not been approved by the student yet."

## Word limits (so each screen fits a phone without scrolling)
Measured on 23 Nov on the smallest common phone screen, 360 by 640 visible, with the real fonts. Each limit leaves some room for long words.
- What [first name] did (family, plain words): up to 45 words. Longest sample now: 36.
- Project title (everyone else): up to 10 words. Longest sample now: 11, which still fits.
- Project description (everyone else): up to 28 words. Longest sample now: 25.
- The claim: up to 22 words. Longest sample now: 24, which still fits.
- Each of the two family questions: up to 14 words. Longest sample now: 15, which still fits.
- The one question for other visitors: up to 25 words. Longest sample now: 19.
- A name longer than 18 characters is set in smaller type, so it does not take more room than a short one.
- Checked: all 15 samples, for every kind of visitor, fit without scrolling at 360x640, 390x664 (current iPhones in Safari), 412x760 and 430x752. On an iPhone SE-size screen (375x553) screens 2 and 3 scroll by up to 17 pixels.
- Why three screens: scrolling pages lose attention toward the bottom (Nielsen Norman Group eyetracking, 2018) and tap-through sequences lose people after three or four screens (Nielsen Norman Group, mobile carousels). Three screens that each fit the phone avoids both.

## Administrator story (draft wording)
Each student in this capstone built an Interactive Poster. It opens with one claim about a skill the student can show, then the work behind it, a decision they made, and an obstacle they met.
Students present at their own laptops. Each table below shows a different area of work.

## My passport
- "This is kept on your phone only. Nothing is shared unless you press the button below."
- A cover with the otter mark, the count ("2 of 15 stamps"), and one circle per student grouped by room. A stamped circle shows the otter.
- Share my visit with the organizers: [x] What I did: who I am here as, and which students I visited · [ ] My name · One thing you will remember from today (optional)
- In the preview copy (no address set) the button only shows what would be shared.

## Share my visit: where it goes (built and tested 23 Nov)
- The button sends the visitor's checked items to a Google Sheet in Sathya's Drive, "Capstone Festival: Share my visit (Fall 2026)", tab Visits. One visitor is one row: Received, Visitor, Students visited, Number visited, Name, One thing I will remember, Page.
- A small script attached to the sheet receives each submission (the code is in cowork/fall-2026-courses/capstone-festival-share.gs). Sathya deployed it as a web app on 23 Nov, and its address is in SHARE_URL near the top of the script in the live .html. The address is meant to be public: it can only add a row to that one tab, and it cannot read the sheet or reach anything else in the Drive.
- On the live page the button says "Share with the organizers", and the visitor sees "Sent to the festival organizers. Thank you." or "This did not go through. Check your connection and try again."

## The stamp
- The Classic Otter Spirit Mark, alone inside a ring, in Monterey Bay Blue. Ring words: CAPSTONE FESTIVAL · DECEMBER 2026.
- Source: the blue version on the university's Logo Guidelines page (csumb.edu/communications/brand-guidelines/logo-guidelines/).
- The ring of words around the mark has not been reviewed by University Communications.

## Colors (csumb.edu/communications/brand-identity/color-palette)
- Monterey Bay Blue #31456b and Ocean Blue #6b92b6, with white and light tints of the blue.
- Valley Green #689466 only as a small dot on "Stamped" marks.
- The three looks to compare (Design A B C, 12 Nov) are gone; there is one look.

## Foot of the front door
- Prototype. The students and projects on this page are made up, and the links on each page are samples.

## Finding the room (decided 11 Nov, not built yet)
- A "Directions to the BIT building" button that opens Google Maps on the visitor's phone.
- On each student card: a floor plan of the building with that student's room highlighted and a line from the entrance.
- A QR code on a sign at each entrance and each room door opens the site with "you are here" already set, so the path starts from that spot. No location permission is asked.
- No 3D model and no moving dot indoors.
- Needed first: the BIT floor plans and the final list of festival rooms.

## Not built yet (for Sergio or a later round)
- Real students: Codex writes the data file from the first-version posters (prompt in cowork/fall-2026-courses/codex-prompt-capstone-festival-real-students.md); students read their pages and ask for changes by Fri 11 Dec
- Student opt-in for name and photo on the site
- Typed-sentence matching for employers ("I hire for...")
- Hosting and the QR code
- Open question: Spanish version of the family path
- What stamps the passport on the day. In the prototype it is a tap.
