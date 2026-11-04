# Two sample Interactive Posters

Editable companion to `interactive-poster-samples.html`. Edit this file and Alan carries the change into the HTML. Wording agreed by Alan, Astra and Argon on 3 Nov 2026, with Sathya's claims.

Labels used inside every card: **What it cost me** · **What I'm still not sure about** · **How I worked with AI** (sub-labels: *[tool] gave me*, *What I asked next*, *How I checked*). The Security+ work card also has **What I would do about it**.

## Page around the posters
- **Title and heading:** Two sample Interactive Posters
- **Intro:** These are two sample Interactive Posters, the way a visitor would see them on your laptop at the festival. The students are made up and the details are examples. When a visitor sits down, start by saying your claim and one sentence about each card. Then let the visitor choose which card to open, and talk them through what is inside.
- **Feedback note (under the intro):** This is the first semester we are using Interactive Posters, so these samples and this template are a first version for us too. If something is confusing, or you have an idea that would make the poster work better for you, please email either of us: Prof. Sathya (snarayanan@csumb.edu) or Prof. Paige (pweisskirch@csumb.edu). We will keep improving it with your suggestions.
- **Tabs and link:** Open-source sample · Security+ sample · Blank template · Open the template to build your poster
- **Note 1, The first screen:** The first screen has your claim, three cards with one line each, and one line on where things stand. Keep it short enough to fit on your laptop screen without scrolling. Your claim should say only what a visitor can see proven when they open the cards.
- **Note 2, The work card:** The work card shows the work itself, such as a bug and the test that proves the fix, or an investigation and what you observed. It also says what you are still not sure about. If AI helped, this is a good place to show how you worked with it and how you checked what it gave you.
- **Note 3, The decision and obstacle cards:** The decision card shows one choice you made, why you made it, and what it cost you. The third card shows something that went wrong, or an open question you are still working on. It is fine if it isn't solved yet.
- **Cards region label (accessibility):** Poster cards

## Open-source sample (Kolibri)
- **Claim:** I can understand the design and implementation of a large codebase and make changes to improve or fix issues and see it through its maintainers' review.
- **Where it stands:** My pull request was merged after two rounds of review. I'm now working on the second place I found with the same problem.
- **Work card:** Kolibri said copying the lessons was "complete" even when files were missing / Why it matters: a teacher without internet could find out in the middle of class that part of a lesson is missing.
- **Terminal line:** after fix  PASSED  "partial", 3 files listed
- **Evidence caption:** My test copies 40 files and makes 3 of them fail on purpose. Before my fix, Kolibri still said "complete". After my fix, it says "partial" and lists the 3 missing files.
- **What I'm still not sure about:** I'm not sure yet whether teachers should see this warning, or only the person who manages the device. I asked the maintainers about it on the issue page.
- **How I worked with AI:** Claude Code gave me: A fix for the one case in the bug report. / What I asked next: "Find every place that copies files the same way." It found two more. / How I checked: I tried to reproduce the bug in both places. One really had it. The other was already handled, so I left that one alone.
- **Decision card:** Fix bugs in a real open-source project instead of building my own app / Because: most of the job postings I saved asked for experience having code reviewed by other engineers.
- **Decision evidence caption:** 9 of the 12 job postings I saved asked for experience having code reviewed by other engineers.
- **Decision, what it cost me:** I won't have an app that is entirely my own.
- **Obstacle card:** 11 tests failed on my laptop before I had changed anything / What I did: I set up Linux and ran the tests there. They all passed, so I could tell whether my own changes broke anything.
- **Obstacle, what it cost me:** The setup took me a week, and I didn't work on the bug during that time.

## Security+ sample
- **Claim:** I can investigate network activity, recognize signs of an attack, and suggest ways to mitigate similar attacks with an action plan.
- **Where it stands:** My exam is on December 12. I have written up one investigation, and I'm working on a second one using traffic I didn't create myself.
- **Work card:** Was the Windows machine in my lab being scanned? / What I found: Yes. Another machine in the lab tried to connect to 1,000 ports in 20 seconds, which is what a scan looks like.
- **Evidence note:** My note: These requests came from the same machine, about two hundredths of a second apart, and each tried a different port.
- **What I would do about it:** First, I would close the ports the Windows machine doesn't need, such as port 21 for file transfer. Then I would add a firewall rule that blocks any machine that tries more than 20 new ports in a minute. Finally, I would set up an alert so the next scan like this shows up on its own, and nobody has to find it by reading a capture.
- **What I'm still not sure about:** I ran the scan myself, so I already knew the answer before I looked. I haven't yet shown that I can spot a scan in traffic I didn't create.
- **How I worked with AI:** unchanged, except the second label becomes "What I asked next".
- **Decision card:** Security+ and a home lab instead of studying for the exam alone / Because: 10 of the 12 job postings I saved asked for Security+, and the analyst postings also asked for experience investigating real network traffic.
- **Decision evidence:** remove the instruction to the reader. Keep: "I found Security+ in 10 of the 12 job postings I saved." Lab caption: My lab: three virtual machines on a network that can't reach the internet.
- **Decision, what it cost me:** I had less time to study for the exam, and I had to learn how to keep the lab cut off from the internet.
- **Obstacle card:** My practice scores were stuck around 62% for three weeks / What I did: I took two weeks off from practice exams to learn networking basics. After that, my practice score went up to 81%.
- **Obstacle, what it cost me:** My exam date moved back two weeks.

## Blank template tab (samples page)
- **Claim:** Your claim: one sentence about a skill your work shows, which a visitor can see proven when they open your cards. You might start with "I can…".
- **Under the claim:** Capstone: one line that says what your project or certificate is
- **Where it stands:** one sentence on what is finished and what isn't yet.
- **Work card:** [The problem you worked on, in plain words] / Why it matters: who it affects, and how.
  - Evidence: Show the work itself, such as the bug and the test that proves your fix, the investigation and what you observed, or the screen you built. Point out the part that matters most.
  - What I'm still not sure about: One sentence on what is still open. It's fine if something isn't settled yet.
  - How I worked with AI: You can use this section to show how you worked with AI. / What you first got back from the AI. / What you asked next, and why. / How you checked what the AI gave you, and what you found.
- **Decision card:** [A choice you made] instead of [another option you considered] / Because: the reason for your choice. If you can, use something from outside yourself, such as a job posting, a conversation, a user or a test result.
  - Evidence: Something a visitor can look at that backs up your reason, such as the postings you read.
  - What it cost me: One sentence on what this choice cost you.
- **Obstacle or open question card:** [What went wrong, or an open question you're still working on] / What I did or will try: what you changed, or what you're trying next.
  - Evidence: Show the problem or open question, and what changed if anything did. If it isn't solved yet, say so.
  - What it cost me: One sentence on what this cost you, if it cost you anything.

