# Capstone Festival Guide (prototype v1, 2026-11-11)

Companion to capstone-festival-site.html. Edit this file; Alan carries changes into the HTML.
Live page: https://profsathya.github.io/Common-Curriculum/cst499/capstone-festival-site.html
Replaced the directory-style sample on 2026-11-11; the earlier version is in the repo history.
All students and projects are made up (the same fifteen as the earlier sample).

## Decisions behind it (11 Nov)
- Audience: festival visitors. The site gives each visitor a personal route through the room.
- AI works ahead of time. It drafts each student's card from their Interactive Poster; the student approves it. Nothing is generated on the day.
- One static page, one URL, adaptive: phone first; on a laptop the route sits on the left and the open card on the right.
- No backend. A visitor's answers stay on their device. "Share my visit" sends a summary to a spreadsheet only if they press it, with checkboxes for what is included.
- Prototype first, built here; Sergio gets the fine-tuning and the engineering parts.

## Top bar and My visit
- There is no top bar. The front door carries the title.
- "My visit" is a link at the bottom of each inside screen. On the student card it sits under "Visit next".

## Front door (meant to fit one phone screen without scrolling)
- Eyebrow: CSU Monterey Bay · B.S. Computer Science
- Title: Capstone Festival
- Line: December 2026. Pick one to get your route.
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

## One card at a time (replaced the route list on 11 Nov)
- After the second question the visitor lands on one student card. There is no list of tables.
- Under the card: "Visit next" with two students (name, project, Room and Table). Tapping one opens that card, which offers the next two.
- Who comes first:
  - Family: their own student, with the eyebrow "You are here for". Then one student in the same room and one in another room.
  - Hiring manager and Student: students in the chosen area first, then one from another area.
  - Faculty: students whose posters show the chosen lens, spread across rooms.
  - University administrator: one table per area, with a short program story above the first card (draft wording below).
- When the planned students run out, the next two are the nearest tables the visitor has not opened.
- Under "Visit next": My visit · All students · Start over.
- On a laptop the card is on the left and "Visit next" on the right.

## Administrator story (draft wording)
Each student in this capstone built an Interactive Poster. It opens with one claim about a skill the student can show, then the work behind it, a decision they made, and an obstacle they met.
Students present at their own laptops. Each table below shows a different area of work.

## Student card
- Space for the student's photo (initials until a photo is added), area of work, name, Room and Table in large type
- Family version: "What [first name] did" in plain words · "What this shows about [first name]" (the claim) · "Questions you can ask [first name]": two specific questions and one that is the same on every card: "What was the hardest decision you made, and what did you give up by making it?"
- Everyone else: Project title and description · "[First name]'s claim" · "A question to ask [first name]" (faculty get the question for their lens)
- Links: "[First name]'s Interactive Poster" · "[First name] on LinkedIn" (sample links in the prototype)
- Button: "I visited [first name]" (stored on the phone; the route shows a check)
- Foot line: "Drafted by AI from [first name]'s Interactive Poster. Read and approved by [first name] before it was published."

## Foot of the page
- Prototype. The students and projects on this page are made up, and the links on each card are samples.

## My visit
- "This is kept on your phone only. Nothing is shared unless you press the button below."
- Share my visit with the organizers: [x] What I did: who I am here as, and which tables I visited · [ ] My name · One thing you will remember from today (optional)
- In the prototype the button only shows what would be shared.

## Three looks to compare (12 Nov, prototype only)
- A small "Design A B C" control sits at the bottom right. It changes the look only; the words and the structure are the same in all three. The choice is remembered on the device.
- A: the first look. Light grey and green, rounded cards.
- B: festival night. Dark navy and gold, capital headings, room and table drawn like a ticket.
- C: editorial. Serif headings, no boxes, thin rules, one color for each area of work.
- The control comes out once a look is chosen.

## Finding the room (decided 11 Nov, not built yet)
- A "Directions to the BIT building" button that opens Google Maps on the visitor's phone.
- On each student card: a floor plan of the building with that student's room highlighted and a line from the entrance.
- A QR code on a sign at each entrance and each room door opens the site with "you are here" already set, so the path starts from that spot. No location permission is asked.
- No 3D model and no moving dot indoors.
- Needed first: the BIT floor plans and the final list of festival rooms.

## Not built yet (for Sergio or a later round)
- Real cards: AI drafting from the finished posters (due Mon 7 Dec) and the step where each student reads and approves their two card versions
- Student opt-in for name and photo on the site
- The spreadsheet behind "Share my visit"
- Typed-sentence matching for employers ("I hire for...")
- Hosting and the QR code
- Open question: Spanish version of the family path
