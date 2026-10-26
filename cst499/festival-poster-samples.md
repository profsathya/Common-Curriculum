# Capstone Festival: two sample posters

The student on these posters is a composite, not a real person. Kolibri and CompTIA Security+ are real, and the decisions are ones CST499 students made this semester. Numbers, dates and quotes are illustrative.

---

## Sample A — open-source contribution (Kolibri)

**Claim:** I can work in code I didn't write, find what is really wrong, and get my change accepted by the people who own it.
Sample Student, CST499 software track, contributing to Kolibri

**The gap I chose:** Postings for new-grad roles ask for code shipped through review, and mine had only been reviewed by my own team. I chose Kolibri, an offline learning platform for schools with little internet, where a bug that fails quietly hurts the most.
Evidence: 9 of 12 postings asked for code review.

### Contribute to a real project instead of building my own app
- What I was facing: Build my own app, join a partner project, or fix bugs in open source.
- How I knew: The postings asked for outside review. My own app would only be reviewed by me.
- What I chose and gave up: Open source. I gave up owning something from start to finish.
- What it says about me: I choose the evidence I need over what looks impressive.

### Get a clean baseline before writing any fix (the obstacle)
- What I was facing: 11 tests failed on my laptop before I had changed anything.
- How I knew: I could not tell my mistakes apart from my setup's.
- What I chose and gave up: I moved to Linux through WSL and gave up a week.
- What it says about me: I want to prove my change did what I say it did.
- Evidence: The same test run: 11 failures on Windows, 0 under WSL.

### Ask the maintainers before widening the fix
- What I was facing: The bug I was fixing also existed in two other places.
- How I knew: I reproduced all three and wrote down the steps.
- What I chose and gave up: I asked first, and they wanted one small pull request per place. I gave up a bigger change.
- What it says about me: The people who own the code decide what done means.
- Evidence: A maintainer's reply on the issue thread: "One PR per import path, please. That is easier for us to review."

### How I directed AI
- Claude Code gave me a fix for the one case in the bug report. I redirected it: "Find every place with the same pattern." It found two more.
- Claude Code gave me a test that used a fake file copy. I redirected it: "Test against a real copy that fails halfway."
- Claude Code gave me a three-paragraph pull request description. I redirected it: "Match the recently merged ones: short, one change." It became five lines.

The AI did most of the typing. I decided what the work needed, and I ran everything myself before trusting it.

**Where it stands:** My first pull request is open, and I have answered one round of review. It is not merged yet.
**What's next:** Get both pull requests merged, then keep contributing until the maintainers know my name.

---

## Sample B — certificate (CompTIA Security+)

**Claim:** When I don't understand something, I set up a situation where I can watch it happen.
Sample Student, CST499 certificate track, CompTIA Security+

**The gap I chose:** Entry-level analyst postings ask for a baseline certificate and hands-on experience with security tools. I knew the concepts from class, but I had never investigated anything myself.
Evidence: 10 of 12 postings named Security+.

### Security+ instead of another certificate
- What I was facing: Security+, AWS Cloud Practitioner, or a cyber-defense certificate.
- How I knew: I counted which ones the postings named.
- What I chose and gave up: Security+. I gave up cloud, which some postings also wanted.
- What it says about me: I let the evidence make the choice, not my guess.
- Evidence: Postings that named each certificate, out of 12: Security+ 10, AWS 3.

### Add a home lab instead of studying for the exam alone
- What I was facing: A certificate alone looks like everyone else's.
- How I knew: Working analysts document their investigations step by step.
- What I chose and gave up: A free virtual lab instead of used equipment or online labs only. I gave up some study time.
- What it says about me: I want something I can show, not only a score.
- Evidence: My lab: three virtual machines (Kali, Ubuntu, Windows) on an isolated network that cannot reach the internet.

### Pause Security+ to learn networking first (the obstacle)
- What I was facing: My practice scores stayed between 60% and 65% for three weeks.
- How I knew: I sorted my missed questions. Most were look-alike terms that need networking.
- What I chose and gave up: Two weeks on ports, protocols and subnets. I gave up two weeks on my exam date.
- What it says about me: When I am stuck, I look for the reason in my own mistakes.
- Evidence: Practice exam scores by week: 61%, 63%, 62%, two weeks of networking, then 78% and 81%.

### How I directed AI
- ChatGPT gave me a study plan that would fit anyone. I redirected it: "Here are the 40 questions I missed. What do they have in common?" I checked its groups against the exam objectives.
- ChatGPT gave me textbook definitions of the terms. I redirected it: "Quiz me only on the pairs I confuse, and use my lab as the example."
- ChatGPT gave me an exercise that scanned a public website. I redirected it: "Keep everything inside my isolated lab." We built an exercise I could run safely.

The AI made my practice faster. I decided what to practice, and I checked it against the exam objectives and my own results.

**Where it stands:** The exam is on December 12. Two lab write-ups are done, and my latest practice score is 81%.
**What's next:** Pass the exam, add one lab investigation a month, and aim for an analyst internship.
