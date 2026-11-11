# From one gate to a machine that adds

Editable companion to trail-nand-to-adder.html. Edit the words here and tell Alan; Alan carries each edit into the .html. The simulator, the live circuit drawing, the tests and the feedback messages they generate live only in the .html.

CST286 - Learning trail

Every computer you have used is built from millions of copies of one tiny part. You start with that part, a Nand gate, and build your way up to a chip that adds numbers. Each chip you write is drawn as a live circuit, so you can watch the signals move through your own design.

**Where you end up:** you can explain how a machine adds numbers using nothing but one kind of gate, because you built every layer yourself.

Each stop: **Predict** (say what the chip should do before you build it) - **Build** (write it in HDL from the chips you already made, and watch it appear as a circuit) - **Probe** (flip the inputs on the drawing and follow the signal through your own chip).

---

# Part 1: Boolean logic (Nand to Tetris project 1)

## Stop 1 - Meet the Nand gate

**After this stop you can**
- Read a truth table, which has one row for every combination of inputs.
- State in one sentence what a Nand gate does.

Every chip on this learning trail is made of Nand gates, so the first step is to know exactly what one Nand gate does. A gate takes bits in and gives a bit out, and a bit is either 0 or 1.

Flip the two inputs and watch the signal travel through the gate. When you have tried all four combinations, record what you saw in the truth table and check it.

**Shown when the predicted truth table has a wrong value:** Try each combination on the drawing again and copy what the output shows.

**What you just showed (appears when the stop is complete):** In one sentence: a Nand gate gives 0 only when both inputs are 1. The name is short for Not-And.

## Stop 2 - Build Not from one Nand

**After this stop you can**
- Write a part in HDL and connect its pins to wires.
- Explain why a Nand gate with both inputs tied together flips its input.

A Not gate flips a bit: 0 becomes 1, and 1 becomes 0. You build it here from a single Nand.

You describe a chip in HDL (hardware description language), which tells the simulator which parts to use and how to wire them. Each line under `PARTS:` is one part. Inside the parentheses, the name on the left of `=` is a pin of the part, and the name on the right is a wire in your chip. So `Nand(a=x, b=y, out=w);` means: connect the Nand's `a` pin to wire `x`, its `b` pin to wire `y`, and call its output `w`.

The wires in your chip are its inputs (here `in`), its outputs (here `out`), and any new names you make up for wires between parts.

**Shown when the predicted truth table has a wrong value:** Not gives the opposite of its input.

**Hints (shown one at a time, on request)**
1. Look at the two rows of the Nand truth table where a and b are equal.
2. When the same signal goes into both inputs of a Nand, only the rows 0,0 and 1,1 can happen. Read the output in those two rows.
3. One part is enough: a Nand whose a pin and b pin both connect to in, and whose out pin connects to out.

**What you just showed (appears when the stop is complete):** You described hardware in text and a simulator confirmed it. A Nand with both inputs tied together can only be in the rows 0,0 and 1,1, and in those rows its output is the opposite of its input.

## Stop 3 - Build And

**After this stop you can**
- Connect two parts with a wire that you name yourself.
- Use a chip you built as a part inside a new chip.

And gives 1 only when both inputs are 1. From this stop on, every chip you finish becomes a part you can use, so here you have Nand and Not.

To send the output of one part into the next part, give the wire between them a name of your own, such as `w`. One part writes to it with `out=w`, and the next part reads it.

**Shown when the predicted truth table has a wrong value:** And gives 1 in one row only: when a and b are both 1.

**Hints (shown one at a time, on request)**
1. Nand is short for Not-And. What do you get when you take the opposite of the opposite?
2. Send a and b through a Nand and name its output, for example out=w.
3. Two parts: a Nand from a and b to a wire w, then a Not from w to out.

**What you just showed (appears when the stop is complete):** You chained two parts with a wire you named. That is the pattern for everything that follows: small chips become the parts of larger chips.

## Stop 4 - Build Or

**After this stop you can**
- Build Or from the chips you have so far.
- Use the fact that "a or b" means the same as "not (not a and not b)".

Or gives 1 when at least one input is 1. None of your parts does that directly, so this stop takes a piece of reasoning before any wiring.

Fill in the truth table first and count the rows where Or gives 0. Then compare with the Nand table: it also gives 0 in exactly one row, so the question becomes how to make that row the right one.

**Shown when the predicted truth table has a wrong value:** Or gives 0 in one row only: when a and b are both 0.

**Hints (shown one at a time, on request)**
1. Or is 0 in exactly one row, and Nand is 0 in exactly one row. Compare which row it is in each table.
2. Nand gives 0 only when both of its inputs are 1. You want 0 only when a and b are both 0. What could you do to a and to b before they reach the Nand?
3. Three parts: a Not for a, a Not for b, and a Nand of the two flipped signals going to out.

**What you just showed (appears when the stop is complete):** You used a law of logic (De Morgan's law) to build a gate you did not have from gates you did have.

## Stop 5 - Build Xor

**After this stop you can**
- Turn a sentence that uses "and", "or" and "not" into a circuit.
- Count the Nand gates in your design and look for a smaller one.

Xor (exclusive or) gives 1 when the two inputs are different. It matters later on this trail because adding two bits gives exactly the Xor of those bits.

A method that works for any truth table: write a sentence for each row where the output is 1, then join the sentences with "or". Each "and", "or" and "not" in your sentence becomes one part.

**Shown when the predicted truth table has a wrong value:** Xor gives 1 when a and b are different, and 0 when they are the same.

**Hints (shown one at a time, on request)**
1. Say it in words: out is 1 when (a is 1 and b is 0) or (a is 0 and b is 1).
2. Each "and", "or" and "not" in that sentence is one part. You need two Nots, two Ands and one Or.
3. Five parts: Not a to na, Not b to nb, And of a and nb to w1, And of na and b to w2, Or of w1 and w2 to out. When it passes, look at the Nand count below the tests: there is a design with only four Nands.

**What you just showed (appears when the stop is complete):** You have a method that turns any truth table into a circuit: one And for each row that gives 1, joined by Or.

## Stop 6 - Choose between two signals: Mux

**After this stop you can**
- Build a chip where one input (sel) decides which of the other inputs reaches the output.
- Explain why only one of the two And gates inside a Mux can pass a signal at a time.

A multiplexer (Mux) is a selector switch made of logic. When `sel` is 0 the output copies `a`, and when `sel` is 1 it copies `b`.

This is how a computer chooses between two results. At the last stop of this trail, a Mux is what lets one chip either add two numbers or And them, depending on a control bit.

**Shown when the predicted truth table has a wrong value:** Read sel first: when sel is 0 copy a, and when sel is 1 copy b.

**Hints (shown one at a time, on request)**
1. In words: out is (a and not sel) or (b and sel).
2. Make one And that lets a through only when sel is 0, and another And that lets b through only when sel is 1. Only one of them can pass its signal at a time.
3. Four parts: Not sel to ns, And of a and ns to w1, And of b and sel to w2, Or of w1 and w2 to out.

**What you just showed (appears when the stop is complete):** An And gate works as a door: one input is the signal, and the other input opens or closes the door. A Mux is two doors where exactly one is open.

## Stop 7 - Route one signal to two places: DMux

**After this stop you can**
- Build a chip that has two outputs.
- Describe DMux as a Mux run in reverse.

A demultiplexer (DMux) takes one input and routes it. When `sel` is 0 the input goes to output `a`, and when `sel` is 1 it goes to output `b`. The output that is not chosen stays 0.

A chip with two outputs needs both of them connected: one part ends in `=a` and another ends in `=b`.

**Shown when the predicted truth table has a wrong value:** The chosen output copies in, and the other output is 0.

**Hints (shown one at a time, on request)**
1. Each output says: "I copy in, but only when sel points at me."
2. a is (in and not sel). b is (in and sel).
3. Three parts: Not sel to ns, And of in and ns to a, And of in and sel to b.

**What you just showed (appears when the stop is complete):** That completes the logic gates on this trail. With Not, And, Or, Xor, Mux and DMux you can build the chips that do arithmetic.

---

# Part 2: Boolean arithmetic (Nand to Tetris project 2)

## Stop 8 - Count in binary

**After this stop you can**
- Convert a number between decimal and 4-bit binary using the place values 8, 4, 2 and 1.

The same wires that carry 0 and 1 can carry numbers. Four wires together carry a 4-bit number: each wire is worth 8, 4, 2 or 1, and the number is the sum of the wires that are 1. So 1010 is 8 + 2 = 10.

Play with the four bits first. Then work through the challenges below, where the page stops showing the value and you work it out.

**What you just showed (appears when the stop is complete):** Four bits give you the 16 numbers from 0 to 15. Each extra bit doubles how many numbers you can write.

## Stop 9 - Add in binary by hand

**After this stop you can**
- Add two binary numbers column by column, carrying a 1 when a column adds up to 2 or 3.
- Recognize overflow, which is a sum that needs more bits than you have.

Binary addition works like the addition you learned in school, with one change: a column can hold only 0 or 1. When a column adds up to 2 (binary 10), you write 0 and carry 1. When it adds up to 3 (binary 11), you write 1 and carry 1.

Start in the rightmost column. Click a sum bit or a carry bit to change it. The carry row shows the 1 you carry into each column.

**What you just showed (appears when the stop is complete):** Notice what every column did: it took in up to three bits (a bit of a, a bit of b, and a carry) and gave out two bits (a sum bit and a carry). The next two stops build that column as a chip.

## Stop 10 - Add two bits: HalfAdder

**After this stop you can**
- Build the chip that adds two bits.
- Match the sum column and the carry column of a truth table to gates you already know.

The rightmost column of an addition has two bits to add. The result needs two outputs: `sum` is the bit you write down in that column, and `carry` is the bit you carry to the next column. So 1 + 1 gives sum 0 and carry 1, which is binary 10.

Fill in the truth table, then look at each output column on its own. You have seen both columns before.

**Shown when the predicted truth table has a wrong value:** Add a and b as numbers. The result is 0, 1 or 2, and 2 is written as carry 1, sum 0.

**Hints (shown one at a time, on request)**
1. Fill in the truth table, then compare the sum column and the carry column with the truth tables of the gates you built.
2. sum is 1 when exactly one input is 1. carry is 1 only when both inputs are 1.
3. Two parts: an Xor of a and b going to sum, and an And of a and b going to carry.

**What you just showed (appears when the stop is complete):** Arithmetic turned out to be logic: the sum bit is an Xor and the carry bit is an And.

## Stop 11 - Add three bits: FullAdder

**After this stop you can**
- Build the chip that adds three bits: two bits plus the carry from the column before.
- Combine two HalfAdders into a FullAdder and explain what the extra gate is for.

Every column after the first has three bits to add: `a`, `b` and the carry `c` that comes in from the column to its right. Three bits add up to 0, 1, 2 or 3, so two output bits are still enough.

You add three numbers by hand in two steps: first two of them, then the third. The chip can work the same way.

**Shown when the predicted truth table has a wrong value:** Count how many of the three inputs are 1. Write that count in binary: carry is the left bit and sum is the right bit.

**Hints (shown one at a time, on request)**
1. Add in two steps: first a + b, then add c to that result.
2. Each step is a HalfAdder. Each step can produce a carry, and the chip's carry is 1 when either step produced one.
3. Three parts: HalfAdder of a and b giving s1 and c1, HalfAdder of s1 and c giving sum and c2, and an Or of c1 and c2 going to carry.

**What you just showed (appears when the stop is complete):** A question worth explaining to someone: the two HalfAdders inside your FullAdder can never both produce a carry for the same inputs. The truth table shows why.

## Stop 12 - Add two 4-bit numbers: Add4

**After this stop you can**
- Chain adders so that the carry of each column feeds the next column.
- Use bus pins: a[0] is the rightmost bit of the 4-bit input a.

Here you turn the add-by-hand stop into wires: one adder for each column, with the carry of each column feeding the next.

The inputs `a` and `b` are 4 bits wide. A group of wires like this is called a bus, and `a[0]`, `a[1]`, `a[2]`, `a[3]` pick out its single bits, with `a[0]` as the 1s place. A connection looks like `a=a[0]` or `sum=out[0]`.

The simulator tests all 256 combinations of a and b. A carry out of the last column is dropped, so you can leave that pin out of the part. The Nand to Tetris course builds Add16, which is the same design with 16 columns.

**Hints (shown one at a time, on request)**
1. One adder for each column, as in the add-by-hand stop. The carry that leaves one column is the carry that enters the next.
2. Column 0 has no carry coming in, so a HalfAdder is enough there. Give each carry wire its own name, such as c1, c2, c3.
3. Four parts. The first: HalfAdder(a=a[0], b=b[0], sum=out[0], carry=c1); The second: FullAdder(a=a[1], b=b[1], c=c1, sum=out[1], carry=c2); Columns 2 and 3 follow the same pattern, and the last carry pin can be left out.

**What you just showed (appears when the stop is complete):** You built a machine that adds, and the only thing inside it is Nand gates. Set a = 1111 and b = 0001 with the switches and watch the carry travel through every column of your drawing.

## Stop 13 - Add 1: Inc4

**After this stop you can**
- Build a chip that adds 1 to a number.
- Feed a fixed 1 or 0 into a pin with true and false.

Counting up by one is so common inside a computer (for example, to move on to the next instruction of a program) that it gets its own chip.

You can feed a fixed value into a pin by writing `true` (for 1) or `false` (for 0) on the right of the `=` sign. For a bus pin you can set single bits, for example `b[0]=true`.

**Hints (shown one at a time, on request)**
1. You already have a chip that adds two numbers. What number do you want to add?
2. Use Add4 with a connected to in, and build the number 1 on b one bit at a time: b[0]=true, and false for the other three bits.
3. One part: Add4(a=in, b[0]=true, b[1]=false, b[2]=false, b[3]=false, out=out); A smaller design chains four HalfAdders, with true as the second input of the first one.

**What you just showed (appears when the stop is complete):** Set in to 1111 on the drawing. Adding 1 to the largest 4-bit number wraps around to 0000, which is the overflow you met in the add-by-hand stop.

## Stop 14 - Negative numbers

**After this stop you can**
- Read and write 4-bit numbers in two's complement, where the leftmost bit is worth -8.
- Negate a number by flipping every bit and adding 1.

Computers store negative numbers by changing what the leftmost bit is worth: in a 4-bit number it counts as -8, where before it counted as 8. So 1111 is -8 + 4 + 2 + 1 = -1, and four bits now cover the numbers from -8 to 7. This way of writing numbers is called two's complement.

The reason for this choice is that the adder you built works on these numbers with no changes. Subtraction needs no new chip, because x - y is the same as x + (-y). To get the negative of a number, flip every bit and then add 1.

**What you just showed (appears when the stop is complete):** Your Add4 already subtracts. Go back to that stop and add 0101 (5) and 1101 (-3): the result is 0010 (2).

## Stop 15 - One chip, many operations: the ALU

**After this stop you can**
- Predict what the ALU computes from its six control bits.
- Find control bits that make the ALU compute a function you choose, such as x - y.

The ALU (arithmetic logic unit) is the chip that does the computing in the Nand to Tetris computer. It takes two numbers, `x` and `y`, and six control bits. Each control bit does one small job, in this order:
- `zx` sets x to zero, then `nx` flips every bit of x.
- `zy` sets y to zero, then `ny` flips every bit of y.
- `f` chooses what to do with the two results: add them (1) or And them (0).
- `no` flips every bit of the output.Every piece is something you have built or could now build: a Mux to choose, a Not to flip, an adder to add. The surprise is how many operations come out of these six switches. Pick a target, set the switches, and check. The page tests your settings on all 256 pairs of x and y. A result that does not fit in 4 bits wraps around, as in the overflow you met earlier. (This ALU is 4 bits wide; the one in the course is 16 bits wide and works the same way.)

**Hints (shown one at a time, on request)**
1. To get a result that ignores an input, zero that input first. Remember that x + 0 = x, and that And with 1111 also leaves x unchanged.
2. Flipping every bit of a number n gives -n - 1. So zero followed by a flip gives 1111, which is -1. That -1 is your tool for x - 1, and a flip at the end can turn a "minus" into a "plus".
3. For x - y: flip x, add y, then flip the result. For x | y: flip both inputs, And them, then flip the result (the same law of logic you used to build Or).

**What you just showed (appears when the stop is complete):** Six control bits and a few chips you know how to build give a whole menu of arithmetic and logic. A processor picks from that menu on every instruction it runs.

## End - Look back at what you built

**After this stop you can**
- Explain in your own words how a chip that adds numbers is made from Nand gates.

This table shows every chip on the trail and how many Nand gates your version uses, counting the Nands inside the chips you used as parts.

**Explain it** (questions on the Look back stop)
1. Why does a Nand gate with both inputs tied together act as a Not gate?
2. Why can the two HalfAdders inside a FullAdder never both produce a carry for the same inputs?
3. Why does flipping every bit of a number and adding 1 give its negative?
