# Capstone Festival — two sample posters

These two posters belong to a sample student. The student is not a real person. The project (Kolibri) and the certificate (CompTIA Security+) are real, and the decisions and obstacles are ones CST499 students have run into this semester. The numbers, dates and conversation excerpts are illustrative.

Each poster reads top to bottom. The first line is the claim. Everything below it is the evidence for that claim.

---

## Sample A — An open-source contribution (Kolibri)

### The one thing I want you to remember

I can work in code I did not write, find out what is really wrong, and get my change accepted by the people who own that code.

*Sample Student · B.S. Computer Science · CST499 software track*

### The gap I chose, and why

I enjoy finding out why something breaks, and I am patient with code that other people wrote. When I read twelve postings for new-grad software roles, nine of them asked for experience working in an existing codebase and shipping changes through code review. Every line of code I had written had only been reviewed by my own team. So the gap I chose to close this semester was getting my code reviewed and accepted by engineers outside my team.

I chose Kolibri because it is an open-source learning platform used in schools that have little or no internet. The people who depend on it cannot easily report a problem, so a bug that fails quietly matters more there.

### Decision 1 — Contribute to an existing project instead of building my own app

- **What I was facing.** I had three options: build my own app, join a partner project, or contribute fixes to an open-source project.
- **How I knew.** The postings asked for review by other engineers. My own app would only be reviewed by me.
- **What I chose and what I gave up.** I chose open source. I gave up owning something from start to finish, which a classmate chose for exactly that reason. I accepted that my evidence would be smaller pieces of work that someone else approved.
- **What it says about how I work.** I chose the option that gave me the evidence I needed, even though it was not the one that felt most impressive.

### Decision 2 — Get a clean baseline before writing any fix (the obstacle)

- **What I was facing.** When I ran Kolibri's tests on my Windows laptop, 11 of them failed before I had changed a single line.
- **How I knew.** I could not tell whether a failure after my fix was caused by me or by my setup. Screenshot: the test run with 11 failures on Windows.
- **What I chose and what I gave up.** I moved my setup to Linux through WSL and spent most of a week on it. I gave up that week of progress on the bug itself.
- **What it says about how I work.** I want to be able to prove that my change did what I said it did. Screenshot: the same test run with 0 failures under WSL.

### Decision 3 — Ask the maintainers before widening the fix

- **What I was facing.** The bug report said that importing content from a USB drive showed "complete" even when some files failed to copy. While reading the code, I found the same pattern in two other import paths.
- **How I knew.** I reproduced the problem on all three paths and wrote down the steps for each one.
- **What I chose and what I gave up.** I could have fixed all three in one pull request. Instead, I posted my findings on the issue and asked the maintainers which they wanted first. They asked for one small pull request per path. I gave up the bigger, more impressive change.
- **What it says about how I work.** The people who own the code decide what "done" means. Link: my comment on the issue and the maintainer's reply.

### How I directed AI

I used Claude Code throughout. Below are four turns from the conversation, and why I redirected it each time.

1. I asked it to find the root cause. It found it quickly and suggested a fix for the one case in the bug report.
2. I asked it to look for every place that used the same pattern, because a fix for one case would leave the others failing quietly. It found the two other import paths.
3. It had written the test against a mock of the file copy. I asked it to write the test against a real copy that fails halfway, because the mock could not fail the way a real USB drive does.
4. I asked it to draft the pull request description in the style of recently merged Kolibri pull requests, which are short and name one change. Its first draft was three paragraphs long, and we cut it to five lines.

The AI did most of the typing. I decided what the work needed to be, and I ran everything myself before I trusted it.

### Where it stands

My first pull request is open, and I have answered one round of review comments. It is not merged yet. The maintainer team is small, so the timing depends on people I do not control. While I wait, I am preparing the second pull request.

### What's next

Get the first pull request merged, then the second. After that, I want to keep contributing to one project long enough that the maintainers recognize my name.

---

## Sample B — A certificate (CompTIA Security+)

### The one thing I want you to remember

When I do not understand something, I set up a situation where I can watch it happen.

*Sample Student · B.S. Computer Science · CST499 certificate track*

### The gap I chose, and why

Capture-the-flag competitions never feel like work to me, and I notice small details that other people skip. When I read postings for entry-level security analyst roles, they asked for two things. They asked for a baseline certificate, and they asked for hands-on experience with security tools. I knew the concepts from my classes, but I had never investigated anything myself. That was the gap I chose to close.

### Decision 1 — Security+ instead of another certificate

- **What I was facing.** I was choosing between Security+, AWS Cloud Practitioner and a cyber-defense certificate.
- **How I knew.** Security+ was named in 10 of the 12 postings I saved. AWS was named in 3. Screenshot: my posting tally.
- **What I chose and what I gave up.** I chose Security+. I gave up cloud, which some postings also asked for.
- **What it says about how I work.** I let the postings make the choice instead of my guess about what sounded best.

### Decision 2 — Add a home lab instead of studying for the exam alone

- **What I was facing.** A certificate shows what I know, but every candidate who has one looks the same on paper.
- **How I knew.** The postings asked for hands-on tools, and the analysts whose work I looked at document their investigations step by step.
- **What I chose and what I gave up.** I built a virtual lab on my laptop: three virtual machines on an isolated network. I considered buying used network equipment, or using only online labs. The virtual lab cost nothing and I control all of it. I gave up some study time, and I had to learn how to keep the lab isolated.
- **What it says about how I work.** I want something I can show, not only a score.

### Decision 3 — Stop studying for Security+ to learn networking first (the obstacle)

- **What I was facing.** My practice exam scores stayed between 60% and 65% for three weeks.
- **How I knew.** I sorted every question I had missed. Most were about terms that look alike, and most of those depended on networking knowledge I did not have. Chart: practice scores by week, with the missed questions grouped by topic.
- **What I chose and what I gave up.** I paused Security+ for two weeks and studied ports, protocols and subnets. I gave up two weeks on my exam timeline. My next practice exam score was 78%.
- **What it says about how I work.** When I am stuck, I look for the reason in my own mistakes before I try harder at the same thing.

### How I directed AI

I used ChatGPT. Below are four turns from the conversation, and why I redirected it each time.

1. I asked for a study plan. It gave me a plan that would fit anyone studying for Security+.
2. I pasted in the 40 practice questions I had missed and asked what they had in common. It grouped them, and I checked the groups against the official exam objectives.
3. I asked it to quiz me only on the pairs of terms I kept confusing, and to explain each wrong answer using my lab instead of a textbook example.
4. I asked it to design a lab exercise where I could see one of those differences in real traffic. Its first suggestion pointed a scanning tool at a public website, so I told it to keep everything inside my isolated lab network. Write-up: the exercise we ended up with.

The AI made my practice faster. I decided what to practice, and I checked it against the exam objectives and my own results.

### Where it stands

The exam is scheduled for December 12. I have two lab write-ups finished and a third in progress. My latest practice exam score is 81%.

### What's next

Pass the exam, then keep the lab running and add one investigation a month. After that, I am aiming for an analyst internship or the CySA+ certificate.
