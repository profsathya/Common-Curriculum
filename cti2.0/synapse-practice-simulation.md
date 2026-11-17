# What practice changes in your brain

Motor learning · Demonstration page

(Page note: look. The page follows the design of the Nand to Tetris learning trail, cst286/trail-nand-to-adder.html: a dark page, an opening hero that holds the label, the title and the first paragraph beside a small animated picture of a synapse, a map of the four levels under the hero, and each level headed by its zoom path and the line "Level N of 4". In the title the words "in your brain" are set in the accent style.)

When you practice a movement, it gets better within minutes. Your muscles cannot grow stronger that fast, so the improvement has to come from somewhere else. On this page you follow it all the way down: from the throws you can watch, to the pathway that carries the command from the brain to the arm, to one connection between two neurons, to the number that says how strong that connection is. At each level you make a prediction first, then run the simulation to check it.

At each level you will also explain your thinking in your own words. You can ask for feedback on an explanation, improve it, and ask again. When you are ready to submit, press Copy my work to submit at the bottom of the screen. It works at any point on the page.

(Page note: a sticky bar at the top holds Pause/Play, the speed buttons 1x, 0.25x, 0.1x and 0.05x, four buttons "Practice 1 throw", "Practice 10 throws", "Rest one week" and "Start over", and two readouts, "Throws practiced: 0" and "Each input adds: 0.50 mV". The four buttons act on one shared state, and every level shows that state at its own scale.)

Zoom path: 1 The practice → 2 The pathway → 3 The synapse → 4 The strength

(Page note: model, line 1. The strength is the voltage each of the 20 practiced inputs adds to the receiving neuron. It starts at 0.50 mV and has a ceiling of 1.00 mV.)

(Page note: model, line 2. One practiced throw: new strength = strength + 0.05 × timing × (1.00 − strength), where timing = e^(−gap ÷ 20 ms) and the gap is 0 to 100 ms in steps of 5, default 0.)

(Page note: model, line 3. Rest one week: new strength = 0.50 + 0.70 × (strength − 0.50).)

(Page note: model, line 4. The receiving neuron fires on the 20 practiced inputs alone when 20 × strength is at least 15 mV, that is when the strength is at least 0.75 mV.)

(Page note: model, line 5. Spread of the throws in cm = 20 − 32 × (strength − 0.50), so 20 cm before practice and 4 cm at the ceiling. A throw lands at a random point such that about two out of three throws fall inside a circle whose radius is the spread.)

(Page note: model, line 6. AMPA receptors drawn at the synapse = strength ÷ 0.05, rounded to a whole number, so 10 before practice and 20 at the ceiling.)

## Level 1: The practice

(Page note: canvas. On the left a simple figure throws a dart. On the right a dartboard seen from the front. Each throw lands as a dot; the last ten dots are bright and older ones fade. A circle centred on the bullseye shows the current spread. Under the board a small chart plots the spread in cm against throws practiced. A badge reads "Spread of the throws: 20.0 cm".)

A learner is practicing dart throws. Press Practice 1 throw at the top a few times and watch where each dart lands. The circle on the board shows where about two out of three throws land, and its size is the spread of the throws. A smaller circle means the learner repeats the same throw more reliably.

Now press Practice 10 throws a few times, and watch the circle and the chart under the board. The learner's arm is no stronger than it was a few minutes ago, and the darts are the same. Something in the learner's nervous system is changing with every throw, and the next three levels zoom in to find it.

**Prediction**

The learner practices 60 throws in total. In which part of the practice does the spread shrink the most?

- **A** In the first 20 throws
  - Feedback: Yes. Check it on the chart: the spread falls quickly at first and then levels off. Each throw closes part of the gap that is left, so there is less to gain as the learner gets closer to their best. Level 4 shows the rule behind this curve.
- **B** In the last 20 throws
  - Feedback: Practice 60 throws and read the chart. Compare how far the spread falls in the first 20 throws with how far it falls in the last 20. Choose again.
- **C** By the same amount in each part
  - Feedback: If each throw helped by the same amount, the chart would be a straight line. Practice 60 throws and look at its shape. Choose again.

**Explain your thinking**

Explain your thinking: describe how the spread changed over the 60 throws. Then say what you think is changing inside the learner, since the muscles and the darts stayed the same. You will test your idea in the next levels.

(Page note: answer box, 4 rows, up to 1500 characters, with the button "Get AI feedback".)

Button, shown once the prediction above is answered: Zoom in: the pathway

## Level 2: The pathway from the brain to the arm

(Page note: canvas. Side view of a head and upper body. The motor cortex is highlighted, and a line runs from it down the spinal cord and out along a nerve to a muscle in the arm. When the receiving neuron fires, a pulse travels along that line and the muscle flashes. An enlarged view of a small part of the motor cortex shows 20 sending neurons, each connected to one receiving neuron. Beside the receiving neuron a gauge runs from 0 to 20 mV above rest, with a line at 15 mV labelled "threshold". A teal bar shows what the 20 practiced inputs add. During a practiced throw a grey bar on top of it shows the help from other inputs.)

(Page note: under the canvas a live line, e.g. "20 inputs × 0.50 mV = 10.0 mV. The threshold is 15 mV.")

The command for a throw starts in the motor cortex, the strip of the brain that controls movement. From there it travels down the spinal cord and out along a nerve to the muscles of the arm. The enlarged view shows one small part of that pathway inside the motor cortex: 20 sending neurons that all connect to one receiving neuron.

A neuron fires only when the voltage across its membrane rises far enough. On this page the receiving neuron has to rise 15 mV above its resting level, and that level is called its threshold. Each sending neuron that fires adds a small voltage to the receiving neuron, and the voltages from inputs that arrive together add up.

Before any practice, each of the 20 inputs adds 0.50 mV. Together they add 10 mV, which is not enough. During a practiced throw the receiving neuron still fires, because other inputs that are already strong add the rest. They are shown in grey, and they come from the areas that plan the movement and that feel the arm. Press Test the practiced inputs on their own to see what the 20 inputs can do without that help.

Button: Test the practiced inputs on their own

- Message when the inputs fall short, e.g.: The 20 practiced inputs add 10.0 mV. That is below the threshold of 15 mV, so the receiving neuron stays silent and no command leaves for the arm.
- Message when the inputs reach the threshold, e.g.: The 20 practiced inputs add 15.1 mV. That reaches the threshold of 15 mV, so the receiving neuron fires and the command travels to the arm.

**Practice**

The receiving neuron fires when its inputs add up to 15 mV. Suppose 20 inputs arrive together and each one adds the same voltage. How large does each one have to be for the neuron to just reach its threshold?

(Page note: a number box, a unit menu with choose a unit, mV, ms, cm, N, receptors, and a Check button.)

- Correct (0.75 mV): Correct. The 20 inputs share the 15 mV equally, so each one has to add 15 ÷ 20 = 0.75 mV. Keep this number in mind. It is the strength that the practiced inputs have to reach.
- If the answer is 300: You multiplied the threshold by the number of inputs. The 20 inputs together have to add up to 15 mV, so each one adds a share of it.
- If the answer is 15: 15 mV is what all 20 inputs have to add together. Find the share that each single input adds.
- If the answer is 0.5: 0.50 mV is what each input adds before practice, and 20 of them reach only 10 mV. Find the size that would reach 15 mV.
- Any other number: Not yet. Start from: number of inputs × voltage from each input = total voltage, and solve for the voltage from each input.
- Right number, wrong unit: The number is right, but check the unit. You are answering with a voltage.
- Wrong number and wrong unit: the line above for the number, followed by "Also check the unit."
- No number: Enter a number first.

**Prediction**

Practice does not add neurons to this pathway, and on this page the threshold stays at 15 mV. For the same 20 inputs to reach the threshold on their own, what has to change?

- **A** Each sending neuron has to fire a bigger spike
  - Feedback: A neuron's spike is all-or-none. When a neuron fires, the spike has the same size every time, however hard the neuron was driven. So the sending neurons cannot send a bigger spike. Choose again.
- **B** Each spike has to produce a larger voltage in the receiving neuron
  - Feedback: Yes. The spike that arrives stays the same, so the change has to happen at the place where the two neurons meet. That place is the synapse, and the next level takes you inside one.
- **C** Nothing has to change. The same inputs will get there if they keep trying
  - Feedback: Press Test the practiced inputs on their own several times without practicing in between. The 20 inputs add the same voltage every time, so repeating the test does not carry them over the threshold. Choose again.

**Explain your thinking**

Explain your thinking: the sending neurons fire the same spike before and after practice. What would have to be different at the place where two neurons meet for the same spike to have a larger effect?

(Page note: answer box, 4 rows, up to 1500 characters, with the button "Get AI feedback".)

Button, shown once the prediction above is answered: Zoom in: the synapse

## Level 3: Inside one synapse

(Page note: canvas. One synapse, greatly enlarged. At the top the end of the sending neuron, holding small packets of glutamate. Below it a narrow gap. At the bottom the receiving neuron, with AMPA receptors drawn as channels in its membrane, two NMDA receptors each plugged by a magnesium ion, and spare AMPA receptors waiting inside. Labels name each part. At the side a small trace shows the voltage this synapse adds, and a label shows whether the receiving neuron is at rest or firing. A badge reads "AMPA receptors: 10 · This synapse adds 0.50 mV".)

(Page note: under the canvas a button "Fire the sending neuron alone" and a slider "Gap between the two firings: 0 ms", 0 to 100 ms in steps of 5. At 0 the label reads "Gap between the two firings: 0 ms (they fire together)". Next to it a live line, e.g. "timing = 1.00".)

The two neurons do not touch. The sending neuron ends just short of the receiving neuron, and the narrow gap between them is the synapse. Follow one spike across it. Slow motion helps here, so try 0.25x or 0.1x at the top.

Press Fire the sending neuron alone. The spike reaches the end of the sending neuron and releases a chemical messenger called glutamate into the gap. Glutamate binds to AMPA receptors on the receiving side. Each AMPA receptor is a channel, and when glutamate opens it, sodium ions flow into the receiving neuron and raise its voltage a little. The more AMPA receptors a synapse has, the more voltage the same spike produces. This page draws one receptor for every 0.05 mV.

Glutamate also binds to a second kind of receptor, the NMDA receptor. Nothing flows through it yet, because a magnesium ion sits in the channel like a plug. The plug stays in place while the receiving neuron is near its resting voltage.

Now press Practice 1 throw at the top. This time the receiving neuron fires while the glutamate is still bound. The jump in voltage pushes the magnesium plug out, and calcium ions flow in through the NMDA receptor. Calcium is the signal that tells the synapse that both neurons were active together. In response, the receiving neuron moves spare AMPA receptors into the synapse, so the next spike produces a larger voltage.

The calcium flows only while the two events overlap. Glutamate stays bound for a short time, so if the receiving neuron fires later, less calcium enters. Move the slider Gap between the two firings to make the receiving neuron fire later, practice one throw, and watch how much calcium enters.

Note under the text: On this page one practiced throw stands for the many paired firings that a real synapse needs, typically 60 to 100, and the new receptors arrive within a second. In a real synapse they arrive over minutes.

**Prediction**

You press Fire the sending neuron alone 20 times. Glutamate is released every time. What happens to the number of AMPA receptors?

- **A** It rises a little each time
  - Feedback: Try it and count the receptors. Glutamate opens the AMPA receptors each time, but look at the NMDA receptor. Its magnesium plug never leaves, so no calcium enters and nothing tells the synapse to change. Choose again.
- **B** It stays the same
  - Feedback: Yes. Glutamate alone is not enough. The calcium signal needs the sending neuron and the receiving neuron to be active together, and that is why people summarize this kind of change as "neurons that fire together wire together".
- **C** It rises for the first few presses and then stops
  - Feedback: Try it and count the receptors after each press. On this page they do not change at all when the sending neuron fires alone, because no calcium enters. Choose again.

**Practice**

This page draws one AMPA receptor for every 0.05 mV that a synapse adds. After some practice a synapse has 16 receptors. How much voltage does one spike add at that synapse now?

(Page note: a number box, a unit menu with choose a unit, mV, ms, cm, N, receptors, and a Check button.)

- Correct (0.80 mV): Correct. 16 receptors × 0.05 mV for each receptor = 0.80 mV. Before practice the same spike added 0.50 mV at this synapse.
- If the answer is 320: You divided the number of receptors by 0.05. Each receptor adds 0.05 mV, so multiply.
- Any other number: Not yet. Use: voltage = number of receptors × 0.05 mV.
- Right number, wrong unit: The number is right, but check the unit. You are answering with a voltage.
- Wrong number and wrong unit: the line above for the number, followed by "Also check the unit."
- No number: Enter a number first.

**Prediction**

You set the gap to 60 ms, so the receiving neuron fires 60 ms after the sending neuron, and you practice one throw. How does the change in strength compare with a throw at a gap of 0 ms?

- **A** It is about the same
  - Feedback: Set the gap to 60 ms, practice one throw and watch the calcium. Then compare the strength before and after the throw. Choose again.
- **B** It is much smaller
  - Feedback: Yes. At 60 ms the timing value is 0.05, so the throw strengthens the synapse only one twentieth as much as it would at 0 ms. A gap of 60 ms is long for a synapse, and the two firings hardly overlap. Level 4 shows what this does to a whole practice.
- **C** It is larger, because the synapse has more time
  - Feedback: More time works against the synapse here. Most of the glutamate has let go by the time the receiving neuron fires, so little calcium enters. Set the gap to 60 ms and test it. Choose again.

**Explain your thinking**

Explain your thinking: why does the synapse get stronger only when both neurons are active together? Use what you saw happen to the magnesium plug and to the calcium.

(Page note: answer box, 4 rows, up to 1500 characters, with the button "Get AI feedback".)

Button, shown once both predictions above are answered: Zoom in: the strength

## Level 4: The strength over a whole practice

(Page note: canvas. A graph of the strength of each practiced input, in mV, against throws practiced. A grey dashed line at 0.50 is labelled "before practice". A crimson line at 0.75 is labelled "20 inputs reach the threshold". A grey line at 1.00 is labelled "ceiling". The strength is a teal curve with a dot for each throw. Each rest is a vertical dotted line labelled "1 week".)

(Page note: above the graph, four counters: "Throws practiced: N", "Each input adds: 0.76 mV", "20 inputs together: 15.1 mV", "Fires on its own: yes" or "Fires on its own: not yet". Under the graph the same slider as in Level 3, "Gap between the two firings", sharing its value.)

Formula box: new strength = strength + 0.05 × timing × (1.00 − strength)

(Page note: two live lines under it, e.g. "timing = 1.00 at a gap of 0 ms" and "last throw: 0.500 + 0.05 × 1.00 × (1.00 − 0.500) = 0.525 mV". Before the first throw the second line reads "Practice a throw to see the rule at work.")

One number now stands for everything you saw in the synapse: the strength, which is the voltage that each practiced input adds to the receiving neuron. Every practiced throw moves the strength part of the way toward a ceiling of 1.00 mV, where the synapse has no room for more receptors.

Read the rule in the box as a sentence. Each throw closes 5% of the distance that is still left to the ceiling, multiplied by the timing value. The timing value is 1 when the two neurons fire together, and it falls quickly as the gap between them grows: 0.61 at 10 ms, 0.37 at 20 ms and 0.14 at 40 ms. Because each throw closes a share of the distance that is left, the early throws change the strength more than the late ones. That is the curve you saw in the spread of the darts at Level 1.

Rest works in the other direction. On this page one week without practice removes 30% of what practice had added above the starting 0.50 mV.

**Practice**

Each practiced input adds 0.60 mV. The learner practices one more throw with a gap of 0 ms. How much does each input add after that throw?

(Page note: a number box, a unit menu with choose a unit, mV, ms, cm, N, receptors, and a Check button.)

- Correct (0.62 mV): Correct. The distance left to the ceiling is 1.00 − 0.60 = 0.40 mV. The throw closes 5% of it, which is 0.02 mV, so the new strength is 0.62 mV.
- If the answer is 0.63: You took 5% of the current strength. The rule takes 5% of the distance that is still left to the ceiling.
- If the answer is 0.65: You added 0.05 mV. The throw adds 5% of the distance that is still left to the ceiling, and that distance is less than 1 mV.
- If the answer is 0.02: 0.02 mV is the amount this throw adds. Add it to the strength the input already had.
- Any other number: Not yet. Use: new strength = strength + 0.05 × (1.00 − strength).
- Right number, wrong unit: The number is right, but check the unit. You are answering with a voltage.
- Wrong number and wrong unit: the line above for the number, followed by "Also check the unit."
- No number: Enter a number first.

**Now you are the experimenter**

1. Press Start over, keep the gap at 0 ms, and practice one throw at a time until Fires on its own changes to yes. Count the throws it took.

2. Press Start over, set the gap to 20 ms, and practice until the 20 inputs reach the threshold again. Compare the number of throws with your first count.

3. Press Start over, practice with a gap of 0 ms until the inputs just reach the threshold, and then press Rest one week. Check whether the pathway still fires on its own, and count the throws that bring it back.

4. Find the smallest number of throws after which one week of rest still leaves the pathway above the threshold.

**Explain your thinking**

In your own words: how does repeating a movement change the brain so that the movement becomes more reliable? Use the words synapse, receptor and threshold.

(Page note: answer box, 4 rows, up to 1500 characters, with the button "Get AI feedback".)

**Where this model stops being true** (collapsed)

This page follows one group of 20 synapses and gives them all the same strength. A real throw depends on millions of synapses in the motor cortex, the cerebellum, the basal ganglia and the spinal cord, and they do not all change in the same way. The page ties the spread of the darts directly to the strength of these 20 synapses so that you can watch the two move together. In a real learner the link between synapses and performance runs through many more steps.

The page also compresses time. One practiced throw here stands for the many paired firings that a real synapse needs, typically 60 to 100, and the receptors arrive within a second. In a real synapse they arrive over minutes, and making the change last takes hours or longer because the neuron has to build new proteins.

The page leaves out other ways a pathway changes with practice. Synapses can also weaken, new synapses can form within an hour of training, and neurons can change how easily they fire. The numbers on the page (0.50 mV, 20 inputs, 15 mV, 5% for each throw, 30% lost in a week of rest) were chosen to be easy to work with, and they are not measurements.

The chain you followed is the one researchers have found in the motor cortex of animals that learn a reaching skill: two neurons are active together, calcium enters, receptors are added, and the connection grows stronger.

**Where the science comes from** (collapsed)

- Rioult-Pedotti, Friedman and Donoghue (2000). Learning-induced LTP in neocortex. Science 290, 533–536. Rats that learned a reaching skill had stronger connections in the motor cortex on the trained side. Link: https://doi.org/10.1126/science.290.5491.533
- Xu and colleagues (2009). Rapid formation and selective stabilization of synapses for enduring motor memories. Nature 462, 915–919. New synapses formed in the motor cortex of mice within an hour of training on a reaching task. Link: https://pmc.ncbi.nlm.nih.gov/articles/PMC2844762/
- Bi and Poo (1998). Synaptic modifications in cultured hippocampal neurons: dependence on spike timing, synaptic strength, and postsynaptic cell type. Journal of Neuroscience 18, 10464–10472. A synapse grew stronger when the receiving neuron fired within about 20 ms after the sending neuron. Link: https://doi.org/10.1523/JNEUROSCI.18-24-10464.1998
- Huganir and Nicoll (2013). AMPARs and synaptic plasticity: the last 25 years. Neuron 80, 704–717. A review of how the magnesium block, calcium and AMPA receptors produce the change. Link: https://pmc.ncbi.nlm.nih.gov/articles/PMC4195488/
- Feldman (2012). The spike-timing dependence of plasticity. Neuron 75, 556–571. A review of the timing rule, including how many paired firings a change typically needs. Link: https://pmc.ncbi.nlm.nih.gov/articles/PMC3431193/

## Feedback button messages

- Fewer than 12 words: Write a few sentences first. Say what you saw on the simulation and why you think it happens.
- While waiting: Reading your explanation…
- Heading over the reply: Feedback on your explanation
- Button after a reply: Get feedback again
- No reply after one automatic retry: The feedback helper is not answering right now. Your explanation is still saved here. You can try again in a moment, or copy your explanation and ask your own AI for feedback.

## Copy my work to submit

(Page note: a button fixed at the bottom right of the screen on every level.)

Button: Copy my work to submit

- When the copy works: Your work is copied. Review the text and paste it where you were asked to submit it. Copying alone does not submit.
- When the browser blocks copying: Select the text below, copy it, and paste it where you were asked to submit it. Copying alone does not submit. (Page note: followed by a box holding the text, already selected.)

(Page note: the copied text lists, in order: the title line "What practice changes in your brain (motor learning demonstration)"; the date and time and "Levels opened: N of 4"; for each of the four predictions the question, "My first choice:" and "My final choice:" (or "not answered yet"); for each of the three practice problems the problem, "My answer:", "Checked: correct", "Checked: not yet correct" or "not checked yet", and "Checks made: N"; for each of the four explanations the question, then every round of feedback in order: "Version N, what I wrote before asking for feedback:" with the text the student sent, and "AI feedback on version N:" with the reply; then "My explanation now, revised after the last feedback:" with the current text, or a line saying it is the same as the last version; and "Times I asked for feedback: N". With no feedback yet it shows "My explanation:" (or "not written yet") and "AI feedback: not asked for yet". Up to 12 rounds are kept per box; then "Throws practiced: N", "Each input adds: x mV", "Gap between the two firings: g ms" and "Weeks of rest taken: N".)

## Bottom of the page

Text button: Clear my saved work on this page

Second button that appears next to it to confirm: Yes, clear it

(Page note: work is saved in this browser only, under the key kin-practice-synapse-v1.)

Link, shown only when the address ends in ?review=1 or #review: Reviewing this page? Open all levels

## For the AI feedback button (not shown to students)

(Page note: each "Get AI feedback" press sends the system prompt below, and one user message made of the question, the private notes for that box, a one-line summary of what the student has done on the page, and the student's explanation.)

### System prompt

You are a teaching assistant for an introductory kinesiology course on motor learning. The student is working through an interactive page called 'What practice changes in your brain'. It shows a learner practicing dart throws, the pathway from the motor cortex to the arm, one synapse between a sending neuron and a receiving neuron (glutamate, AMPA receptors, NMDA receptors with a magnesium plug, calcium), and a graph of how the strength of the synapse changes with practice, timing and rest. The page is a simplified model and says so. The student has written a short explanation in answer to one question. You will receive the question, private notes on what a sound explanation contains, what the student has done on the page, and the student's explanation.

Write feedback addressed to the student as "you". Use plain words and 3 to 5 sentences. No headings, no lists, no formulas the student did not use.

First say what is right in the explanation, specifically, using a few of the student's own words. Then name the one most important gap or mistake in the reasoning, if there is one, and say what is missing without writing the missing part for them. Then ask one question that would lead them to it, and point to what to watch on the simulation: which part of the picture, which number, or which button or slider setting.

If the explanation is complete and correct, say so plainly, and ask one question that tests it in a nearby situation.

Never write the full correct explanation for the student, and do not give them numbers they have not given you. Do not introduce parts of the mechanism that the private notes say belong to a later level. If the explanation is off the topic of the question, ask them to describe what they saw on the simulation first. Do not praise in general terms.

### Private notes, Explain your thinking box 1

A sound answer describes the shape of the change: the spread shrank quickly during the first throws and more slowly later, and it levels off. It also offers a specific idea of what is changing inside the learner, in the nervous system and not in the muscles. At this level any reasoned idea is acceptable, because Levels 2 to 4 test it. Do not tell the student that synapses or receptors change; that belongs to later levels. Common gaps: saying only that the throws got better, with no description of the shape; using "muscle memory" as the whole explanation; saying the muscles got stronger.

### Private notes, Explain your thinking box 2

A sound answer starts from the fact that a spike is all-or-none and arrives unchanged, so the difference has to be at the place where the two neurons meet, in how strongly the receiving side responds to the same spike. A reasoned idea is enough here, for example that the receiving neuron has more of whatever responds to the signal. Do not reveal receptors, glutamate or calcium; that belongs to Level 3. Common gaps: saying the spike gets bigger or faster; saying more neurons join the pathway; restating the question.

### Private notes, Explain your thinking box 3

A sound answer says that glutamate alone opens the AMPA receptors, but the NMDA receptor stays plugged by magnesium while the receiving neuron is near rest. Only when the receiving neuron fires while glutamate is still bound does the jump in voltage push the plug out, so calcium can enter. Calcium is the signal that leads the neuron to add AMPA receptors, which makes the next spike produce more voltage. So both neurons have to be active, and close together in time. Common gaps: leaving out the magnesium plug or the voltage; saying glutamate itself adds the receptors; confusing calcium with sodium; not connecting calcium to the added receptors.

### Private notes, Explain your thinking box 4

A sound answer follows the whole chain. Each practiced throw makes sending and receiving neurons in the pathway fire together. At each of those synapses calcium enters and AMPA receptors are added, so each spike adds more voltage to the receiving neuron. When the inputs together reach the receiving neuron's threshold, the pathway fires on its own and the command for the movement is produced reliably. A strong answer also names a pattern or a limit: early throws change the strength more than late ones, poor timing slows the change, rest removes part of the gain, or the page is a simplified model of a much larger system. The student was asked to use the words synapse, receptor and threshold.
