# From one gate to a machine that adds

Editable companion to trail-nand-to-adder.html. Edit the words here and tell Alan; Alan carries each edit into the .html. The simulator, the live circuit drawing, the tests and the feedback messages they generate live only in the .html.

Shape (decided 11 Nov 2026): the trail runs top-down. Each level is one box. The student sees it run, learns it, practices, rebuilds it in HDL from the boxes one level down, and passing the tests opens the boxes inside (double-click to zoom in). Reviewer shortcut: add ?unlock=1 to the page address to open every level.

CST286 - Learning trail - Nand to Tetris

Every computer you have used could be built from millions of copies of one tiny part. You start at the top, with a working machine that adds two numbers. Then you open it box by box, and at every level you rebuild what you just saw, until you reach that one part.

**Where you end up:** you can explain how a machine adds numbers, all the way down to one kind of gate, because you opened every box and rebuilt it yourself.

Every level has the same five steps: **See it run** (flip the inputs of a working box and watch what it does) - **Learn it** (read what the box is for) - **Practice** (check that you can predict it) - **Build it** (rebuild the box in HDL from the boxes one level down) - **Open the box** (double-click a box you used and go inside it).

---

## Level 1 - A machine that adds (Add4)

**After this level you can**
- Read and write 4-bit binary numbers, and add two of them by hand with carries.
- Build a 4-bit adder by chaining one small adder for each column.

**See it run:** This box adds two 4-bit numbers. Set `a` and `b` with the switches under the drawing and read `out`. Try 7 + 1. Then try 15 + 1, and notice what the machine shows when the answer needs a fifth bit.

**Learn it**

The same wires that carry 0 and 1 can carry numbers. Four wires together carry a 4-bit number: each wire is worth 8, 4, 2 or 1, and the number is the sum of the wires that are 1. So 0101 is 4 + 1 = 5.

The machine adds the way you add by hand, one column at a time, starting from the right. A column can hold only 0 or 1. So when a column adds up to 2 (binary 10) it writes 0 and carries 1 to the next column, and when it adds up to 3 (binary 11) it writes 1 and carries 1.

When the last column produces a carry, there is no fifth wire to hold it, so the carry is dropped. This is called overflow, and it is why 15 + 1 shows 0.

**Video:** none yet (slot is hidden until a video is added)

**Practice:** Two short practices, because the build step depends on both: reading binary numbers, and adding them column by column.

**Build it**

Now rebuild the machine to see how it works. Inside the box there is one small adder for each column, and the carry from each column goes into the next column. You have two ready-made boxes to use: `HalfAdder` adds two bits, and `FullAdder` adds three bits (two bits plus a carry coming in).

The inputs `a` and `b` are 4 bits wide. A group of wires like this is called a bus, and `a[0]`, `a[1]`, `a[2]`, `a[3]` pick out its single bits, with `a[0]` as the 1s place. The first column is written for you. Add the other three columns.

(followed by the HDL explanation below)

**Hints (shown one at a time, on request)**
1. One adder for each column, as in the add-by-hand practice. The carry that leaves one column is the carry that enters the next column.
2. Columns 1, 2 and 3 each have three bits to add: a bit of a, a bit of b, and the carry from the column before. That is a FullAdder. Give each carry wire its own name, such as c2 and c3.
3. Column 1 is: FullAdder(a=a[1], b=b[1], c=c1, sum=out[1], carry=c2); Columns 2 and 3 follow the same pattern. The carry out of column 3 has nowhere to go, so you can leave that pin out.

**What you just showed (appears when the level is complete):** You rebuilt a machine that adds from four column adders. You used HalfAdder and FullAdder as boxes without knowing what is inside them, which is how engineers design large chips. Now open one of them.

---

## Level 2 - Inside a column: the FullAdder (FullAdder)

**After this level you can**
- Explain what a FullAdder does with its three input bits.
- Build a FullAdder from two HalfAdders and one more gate.

**See it run:** This is the box that sat in three of your four columns. Click `a`, `b` and `c` on the drawing and watch `sum` and `carry`. Each time, count how many of the three inputs are 1.

**Learn it**

Every column after the first has three bits to add: `a`, `b`, and the carry `c` that comes in from the column to its right. Three bits add up to 0, 1, 2 or 3, so two output bits are enough to write the answer: `carry` is the left bit and `sum` is the right bit.

When you add three numbers by hand, you add two of them first and then add the third to the result. The chip can work the same way, and the box that adds two bits is the HalfAdder you used in column 0.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** Count how many of the three inputs are 1. Write that count in binary: carry is the left bit and sum is the right bit.

**Build it**

Build the FullAdder from the boxes below it. You have HalfAdder, and you also have the logic gates And, Or and Xor: And gives 1 only when both inputs are 1, Or gives 1 when at least one input is 1, and Xor gives 1 when the two inputs are different.

**Hints (shown one at a time, on request)**
1. Add in two steps: first a + b, then add c to that result.
2. Each step is a HalfAdder. Each step can produce a carry, and the chip's carry is 1 when either step produced one.
3. Three parts: a HalfAdder of a and b giving s1 and c1, a HalfAdder of s1 and c giving sum and c2, and an Or of c1 and c2 going to carry.

**What you just showed (appears when the level is complete):** A question worth explaining to someone: the two HalfAdders inside your FullAdder can never both produce a carry for the same inputs. The truth table shows why.

---

## Level 3 - Adding two bits: the HalfAdder (HalfAdder)

**After this level you can**
- Match the sum column and the carry column of a truth table to logic gates.
- Build a HalfAdder from two gates.

**See it run:** Click `a` and `b`. `sum` is the bit you write down in a column, and `carry` is the bit you carry to the next column. So 1 + 1 gives sum 0 and carry 1, which is binary 10.

**Learn it**

Every box so far has been about numbers. At this level the numbers turn into logic.

A logic gate answers a yes-or-no question about its inputs. And asks "are both inputs 1?". Or asks "is at least one input 1?". Xor (exclusive or) asks "are the two inputs different?".

Fill in the truth table for sum and carry. Then look at each output column on its own and ask which of those three questions it answers.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** Add a and b as numbers. The result is 0, 1 or 2, and 2 is written as carry 1, sum 0.

**Build it**

Build the HalfAdder from logic gates. Each output needs one gate.

**Hints (shown one at a time, on request)**
1. Compare the sum column and the carry column of your truth table with what And, Or and Xor do.
2. sum is 1 when exactly one input is 1. carry is 1 only when both inputs are 1.
3. Two parts: an Xor of a and b going to sum, and an And of a and b going to carry.

**What you just showed (appears when the level is complete):** Arithmetic turned out to be logic: the sum bit is an Xor and the carry bit is an And.

---

## Level 4 - Are they different? Xor (Xor)

**After this level you can**
- Turn a sentence that uses "and", "or" and "not" into a circuit.
- Count the Nand gates in your design and look for a smaller one.

**See it run:** This is the gate that produced your sum bit. Click `a` and `b`: the output is 1 when they are different.

**Learn it**

Xor can be built from the three simplest gates: And, Or and Not. Not has one input and flips it, so 0 becomes 1 and 1 becomes 0.

Here is a method that works for any truth table. Write a sentence for each row where the output is 1, then join the sentences with "or". Each "and", "or" and "not" in your sentence becomes one box.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** Xor gives 1 when a and b are different, and 0 when they are the same.

**Build it**

Write the sentence for Xor first, then turn each word into a box.

**Hints (shown one at a time, on request)**
1. Say it in words: out is 1 when (a is 1 and b is 0) or (a is 0 and b is 1).
2. Each "and", "or" and "not" in that sentence is one box. You need two Nots, two Ands and one Or.
3. Five parts: Not a to na, Not b to nb, And of a and nb to w1, And of na and b to w2, Or of w1 and w2 to out. When it passes, look at the Nand count under the tests: there is a design with only four Nands.

**What you just showed (appears when the level is complete):** You have a method that turns any truth table into a circuit: one And for each row that gives 1, joined by Or.

---

## Level 5 - Both at once: And (And)

**After this level you can**
- Build And from a Nand and a Not.
- Explain And as the opposite of Nand.

**See it run:** Click `a` and `b`: the output is 1 only when both are 1.

**Learn it**

You are now close to the bottom. There is one gate you have not met yet, and everything from here down is made of it: Nand, which is short for Not-And. A Nand gate gives the opposite of And, so it gives 0 only when both inputs are 1.

That means And can be built from the two boxes below it: a Nand, and a Not that flips the result back.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** And gives 1 in one row only: when a and b are both 1.

**Build it**

Connect the two boxes with a wire that you name yourself.

**Hints (shown one at a time, on request)**
1. Nand is short for Not-And. What do you get when you take the opposite of the opposite?
2. Send a and b through a Nand and name its output, for example out=w.
3. Two parts: a Nand from a and b to a wire w, then a Not from w to out.

**What you just showed (appears when the level is complete):** And is a Nand followed by a Not. You chained two boxes with a wire you named.

---

## Level 6 - At least one: Or (Or)

**After this level you can**
- Build Or from Not and Nand.
- Use the fact that "a or b" means the same as "not (not a and not b)".

**See it run:** Click `a` and `b`: the output is 0 only when both are 0.

**Learn it**

Or gives 1 when at least one input is 1. Neither of the boxes below it does that directly, so this level takes a piece of reasoning before any wiring.

Fill in the truth table and count the rows where Or gives 0. A Nand gate also gives 0 in exactly one row, the row where both of its inputs are 1. So the question becomes how to make that one row the right one.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** Or gives 0 in one row only: when a and b are both 0.

**Build it**

Decide what should happen to a and to b before they reach the Nand.

**Hints (shown one at a time, on request)**
1. Or is 0 in exactly one row, and Nand is 0 in exactly one row. Compare which row it is in each table.
2. Nand gives 0 only when both of its inputs are 1. You want 0 only when a and b are both 0. What could you do to a and to b before they reach the Nand?
3. Three parts: a Not for a, a Not for b, and a Nand of the two flipped signals going to out.

**What you just showed (appears when the level is complete):** You used a law of logic (De Morgan's law) to build a gate you did not have from gates you did have.

---

## Level 7 - Flip a bit: Not (Not)

**After this level you can**
- Build Not from a single Nand.
- Explain why a Nand gate with both inputs tied together flips its input.

**See it run:** Click `in` and watch `out` do the opposite.

**Learn it**

Not is the last box before the bottom. It has one input, and it flips it.

You build it from a single Nand gate. A Nand has two inputs and Not has only one, so the question at this level is what to connect to the second input. Remember what Nand does: it gives 0 only when both of its inputs are 1.

**Video:** none yet (slot is hidden until a video is added)

**Shown when the truth table has a wrong value:** Not gives the opposite of its input.

**Build it**

One box is enough.

**Hints (shown one at a time, on request)**
1. Think about the Nand rows where a and b are equal: 0,0 and 1,1.
2. When the same signal goes into both inputs of a Nand, only the rows 0,0 and 1,1 can happen. In those rows the output is the opposite of the input.
3. One part: a Nand whose a pin and b pin both connect to in, and whose out pin connects to out.

**What you just showed (appears when the level is complete):** A Nand with both inputs tied together can only be in the rows 0,0 and 1,1, and in those rows its output is the opposite of its input.

---

## Level 8 - The bottom: the Nand gate (Nand)

**After this level you can**
- State in one sentence what a Nand gate does.
- Explain why every box above it could be built from this one gate.

**See it run:** This is the one part that everything above it is made of. Click `a` and `b` and try all four combinations.

**Learn it**

You have reached the bottom of the trail. Every box you opened on the way down was built from the boxes below it, and all of them end here.

In a real chip, a Nand gate is made of a few transistors, which are tiny electrical switches. That is the place where logic meets physics.

**Video:** none yet (slot is hidden until a video is added)

**Practice:** Record what you saw in the truth table. Click a ? to set it to 0, and click again for 1.

**Shown when the truth table has a wrong value:** Try each combination on the drawing again and copy what the output shows.

**What you just showed (appears when the level is complete):** In one sentence: a Nand gate gives 0 only when both inputs are 1. The Not, And, Or, Xor, HalfAdder, FullAdder and Add4 you built are all arrangements of this one gate.

---

## End - Zoom all the way out

**After this level you can**
- Explain in your own words how a machine that adds numbers could be built from Nand gates alone.

**Learn it**

This is your own 4-bit adder with every box opened, all the way down. Set `a` and `b` with the switches and watch the signals travel through the Nand gates.

**Video:** none yet (slot is hidden until a video is added)

---

## How to write a part in HDL (shown in full at level 1, and as a fold-out at the other build levels)

You describe a chip in HDL (hardware description language), which tells the simulator which boxes to use and how to wire them. Each line under `PARTS:` is one box. Inside the parentheses, the name on the left of `=` is a pin of that box, and the name on the right is a wire in your chip. So `HalfAdder(a=x, b=y, sum=s, carry=c);` means: connect the HalfAdder's `a` pin to wire `x` and its `b` pin to wire `y`, and call its two outputs `s` and `c`.

The wires in your chip are its inputs, its outputs, and any new names you make up for wires between boxes. To send the output of one box into another box, give the wire between them a name of your own. One box writes to it, for example with `carry=c1`, and the other box reads it.

## What each box does (shown in the parts list at each build level)

- **Nand:** out is 0 only when a and b are both 1
- **Not:** out is the opposite of in
- **And:** out is 1 only when a and b are both 1
- **Or:** out is 1 when a or b (or both) is 1
- **Xor:** out is 1 when a and b are different
- **HalfAdder:** adds two bits: sum is the bit you write down, carry is the bit you carry
- **FullAdder:** adds three bits (a, b and a carry c): sum is the bit you write down, carry is the bit you carry
- **Add4:** out = a + b (4 bits, a carry out of the last column is dropped)

## Explain it (questions at the end)

1. Why does a Nand gate with both inputs tied together act as a Not gate?
2. Why can the two HalfAdders inside a FullAdder never both produce a carry for the same inputs?
3. When your adder shows 0 for 15 + 1, which wire carried the missing 1, and where did it go?
