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
- The top bar (Capstone Festival · B.S. Computer Science · CSU Monterey Bay) shows on the front door only and scrolls away with the page.
- Inside screens have no top bar. "My visit" is a link at the bottom of each inside screen.
- The student card has neither; on a phone it takes the whole screen, with "Back to my route" above the card.

## Front door
- Eyebrow: December 2026 · date and rooms to be confirmed
- Title: Capstone Festival
- Intro: Tell us who you are. We will suggest which tables to visit and what to ask when you get there.
- Question: Who are you?
  - Family or friend / I am here for a student
  - Employer or industry guest / I want to meet students in my line of work
  - Faculty / I want to see how students worked
  - Administrator / I want a picture of the whole program
  - Student / I want to see what capstone looks like
- Link: Or see all 15 students

## Second question, by visitor
- Family or friend: "Who are you here for?" Type a name, pick the student.
- Employer: "What kind of work do you hire for?" The five areas of work, or "Any of these".
- Faculty: "What would you like to see today?"
  - How students made decisions / What they chose, what else they considered, and what the choice cost.
  - How students worked across domains / Where a second field of knowledge changed the work.
  - How students used AI in their work / Where AI helped, and where the student had to direct or correct it.
- Administrator: no question.
- Student: "What are you curious about?" The five areas, or "Show me a mix".

## Routes
- Family: their student first ("Your student"), then two more tables: one in the same room, one in another room.
  Heading: "You are here for [Name]. Start at [first name]'s table. Then visit two more tables to see what other students did."
- Employer: three students in the chosen area and one from another area (or one from each area).
- Faculty: four students whose posters show the chosen lens, spread across rooms.
- Administrator: "The program in 5 tables", one table per area, under a short program story (draft words below).
- Student: four tables in the chosen area, or five across areas. Line: "Ask the question on each card. Then ask how they chose their project."

## Administrator story (draft wording)
Each student in this capstone built an Interactive Poster. It opens with one claim about a skill the student can show, then the work behind it, a decision they made, and an obstacle they met.
Students present at their own laptops. The route below takes you to one table in each area of work.

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

## Not built yet (for Sergio or a later round)
- Real cards: AI drafting from the finished posters (due Mon 7 Dec) and the step where each student reads and approves their two card versions
- Student opt-in for name and photo on the site
- The spreadsheet behind "Share my visit"
- Typed-sentence matching for employers ("I hire for...")
- Hosting and the QR code
- Open question: Spanish version of the family path
