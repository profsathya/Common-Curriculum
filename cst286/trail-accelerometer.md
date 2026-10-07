<!-- Editable text companion to trail-accelerometer.html. DRAFT 2, 4 Oct 2026; goal block revised by Prof. Sathya 5 Oct. The version with Practice blocks now lives inside how-i-learn-and-one-learning-trail.md (Part 2). Keep both files aligned.
Notes for the editor, not shown to students:
- Draft 2 follows Prof. Sathya's 3-4 Oct decisions: six stops instead of seven; Units and Direction keep their own short stops; each of his videos is clipped to one worked example; the main path needs only Newton's first and second laws; Newton's third law, the other motion problems and the full videos sit in a closed "More practice" shelf; practice happens at stop 6 from the phone's point of view. Draft 1 (seven stops) is kept in cowork/fall-2026-courses/content-tracks/cst286/trail-accelerometer-draft1-7stops.md.
- Clip times come from the captions and are approximate. Check each by watching: Units 13:10-15:55 · teacher walk 0:00-4:20 · headrest 3:42-7:46 · Earth and Mars 17:46-24:15.
- "About 45 minutes of video" = 3 + 4 + 5 + 4 + 7 + 6.5 + 8 + 5 + 3 minutes of new silent videos. "Two to three hours" is my estimate.
- NEW content that is not in the old videos: the still-phone and falling-phone readings and the phyphox app (stop 5); the direction example at stop 2; the numbers in the stop 5 example; the five problems at stop 6. Computed here because the video leaves it to students: the gold volume, 35.3 cm³.
- [VIDEO A/B/C] mark the three new short videos. [SIM] marks starter code that opens in the course runner. [CLIP id start end] gives the YouTube id and the start and end of a clip in seconds.
- All embedded videos start at 1.25x (his request, 3 Oct). -->

CST286 · Fall 2026 · A trail you can take as your Sprint 2 goal

# How does your phone know it moved?

Turn your phone sideways and the screen turns with it. Walk, and the phone counts your steps. Drop it, and some phones call for help. Each of these starts from one small sensor, the accelerometer, and the sensor works because of physics you can learn in this sprint.

## A goal you can take as written
Goal: Understand how an accelerometer in the phone knows when the phone is pushed.
A quantitative relationship I will be able to use:
> **Given** the push on my phone, and the phone's mass, in the right units,
> **I can predict** the acceleration its sensor will report, in the right unit.
> **This is useful because** knowing how this works supports many useful applications, like a step counter, a screen that rotates and a fall alert.

**Copy this goal** - paste it into your Sprint 2 goal post as it is, or change it at stop 6.

The trail has six stops and about 45 minutes of video. With the examples and the simulations it takes about two to three hours. Stops 1 and 2 are short and prepare you to read the sensor's numbers. Stops 3 and 4 are the two laws the sensor depends on. Stop 5 is the sensor, and stop 6 is where you practice on problems that start from your phone.

---

## Stop 1 · Units

**Why this stop.** The sensor in your phone reports a number, and an app can use that number only if it knows the unit. A step counter that reads 9.8 and does not know whether it means meters per second squared or feet per second squared will count the wrong steps.

**After this stop you can** convert a quantity from one unit to another by lining up conversion factors so the units you do not want cancel.

**Watch.** Prof. Sathya sets up one conversion - 3 min clip [CLIP H2ECsg6lxgg 790 955] · [slides](https://docs.google.com/presentation/d/1WNMl2gCaXzvLytnWBTNDmPVOMl2dWLSAWbwY3iNjDVU)

**Worked example.** The clip sets this problem up and leaves the last step to you. You have 1.5 pounds of gold, and the density of gold is 19.3 grams per cubic centimeter. What is its volume in cubic centimeters?

*Predict first:* a golf ball is about 40 cm³. Is the gold larger or smaller than a golf ball?

1. Write where you start and where you want to end: 1.5 lb → cm³.
2. Find the conversion factors that connect them: 2.2 lb = 1 kg, 1 kg = 1000 g, and for gold 19.3 g fills 1 cm³.
3. Line them up so each unit you do not want cancels: 1.5 lb × 1 kg / 2.2 lb × 1000 g / 1 kg × 1 cm³ / 19.3 g.
4. Pounds cancel, then kilograms, then grams, and cubic centimeters are left.
5. Multiply and divide the numbers: 1.5 × 1000 ÷ 2.2 ÷ 19.3 = **35.3 cm³**, a little smaller than a golf ball.

**Units check.** In step 3, turn the density factor upside down and multiply by 19.3 instead of dividing. The answer becomes 13,159, and nothing in the arithmetic warns you. The units do warn you, because grams times grams per cubic centimeter leaves g² / cm³, which is not a volume. In 1999 NASA lost the Mars Climate Orbiter because one team sent numbers in pound-force seconds and the other team read them as newton-seconds.

[VIDEO B - Same number, wrong unit]

**Ask your Dojo.**
- "Give me one unit conversion that needs two conversion factors. Do not solve it. Ask me to set up the chain, and tell me only whether my units cancel."
- "I will explain why 20 cm is 0.2 m and not 2000 m. Ask me questions until my explanation would convince someone who has never used the metric system."

---

## Stop 2 · Direction

**Why this stop.** The sensor reports acceleration with a direction. It gives three numbers, one for each direction the phone can move, and each number can be positive or negative. To read those numbers you need to tell apart the quantities that carry a direction from the ones that do not.

**After this stop you can** tell distance from displacement and speed from velocity, and say what the sign of a sensor reading means.

**Watch.** Prof. Sathya works the teacher-walk problem - 4 min clip [CLIP Rmmp6X59Lpg 0 260] · [slides](https://docs.google.com/presentation/d/1JzEkEWldFH_Y05a1hzHBevOPjGw9OSM7TszoygXa4oQ)

**Worked example.** You push your phone to the right along a desk, and the sensor's first number, x, reads +5 m/s². Then you push it just as hard to the left. What does x read now?

*Predict first:* +5, −5 or 0?

1. Acceleration is a vector, so it has a size and a direction.
2. The sensor shows the direction along the desk as the sign of x. A push to the right gives a positive x.
3. The second push has the same size, so the number is still 5.
4. The second push points the other way, so the sign changes: x reads **−5 m/s²**.
5. The size of the push did not change. Only its direction did, and the sign is how the sensor tells you.

**Units check.** You walk 10 m in 8 s, so your speed is 1.25 m/s. The same walk is 4.5 km/h and 2.8 mi/h. The number is 1.25, 4.5 or 2.8 depending on the unit, so a number without its unit does not tell anyone how fast you walked. Add "toward the door" and the speed becomes a velocity, because now it has a direction.

**Try it.** Mark a 10 m line outside. Time yourself walking it and calculate your speed in meters per second. Then walk back to the start and state your distance and your displacement for the round trip.

**Ask your Dojo.**
- "Ask me for three everyday quantities, one at a time, and have me say whether each is a vector or a scalar and why. Correct me only after I give my reason."
- "I drove 300 miles in 5 hours. Ask me what I can calculate from that and what I cannot, and why."

---

## Stop 3 · Newton's first law

**Why this stop.** Inside the sensor is a small mass that is free to move a little. When the phone speeds up, the mass keeps doing what it was doing, so it falls behind the phone. That falling behind is the first law at work, and it is what the sensor measures.

**After this stop you can** predict what an object will do when the thing carrying it speeds up, slows down or turns.

**Watch.**
- Newton's first law - Khan Academy, 5 min · [youtu.be/5-ZFOhHQS68](https://youtu.be/5-ZFOhHQS68)
- Prof. Sathya works the headrest question - 4 min clip [CLIP hOlmn-kd1nw 222 466]
- [Slides](https://docs.google.com/presentation/d/1stGiLbKXIaxam4nGDW-h4carQIVJDodHdklFGbaEPSU)

**Worked example.** A ball sits in the middle of a wagon, and nothing holds it in place. Someone pulls the wagon forward suddenly. Where does the ball end up: at the same spot in the wagon, toward the front, or toward the back?

*Predict first:* choose one before you read on.

1. Before the pull, the ball and the wagon are both at rest.
2. The pull is a force on the wagon, so the wagon starts to move forward.
3. Nothing pushes the ball forward, so by the first law the ball stays where it was.
4. The wagon moves forward under the ball, so the ball ends up **toward the back** of the wagon.
5. The small mass inside your phone's sensor does the same thing when the phone speeds up.

**Units check.** "The car rounds the curve at a constant 60 mi/h." The speed is constant, and the velocity is still changing, because velocity includes direction and the direction changes all the way around the curve. A change in velocity needs an unbalanced force, so there is one on the car even though the number on the speedometer stays at 60. In metric units 60 mi/h is 26.8 m/s.

**Ask your Dojo.**
- "A cup of coffee sits on a car's dashboard and the driver brakes hard. Ask me what the cup does and why. Then ask me how this is like the mass inside my phone's sensor."
- "Ask me to explain why a seat belt is needed, using the first law, and keep asking 'what force?' until I name one."

---

## Stop 4 · Newton's second law

**Why this stop.** The goal on this page is a second-law prediction. The push on the phone is a force, the phone has a mass, and the second law connects them to the acceleration that the sensor reports.

**After this stop you can** use F = ma to predict any one of force, mass and acceleration from the other two, with the units carried through.

**Watch.**
- Newton's second law - Khan Academy, 7 min · [youtu.be/ou9YMWlJgkE](https://youtu.be/ou9YMWlJgkE)
- Prof. Sathya works the Earth and Mars question - 6 min clip [CLIP f4MusblLa1k 1066 1455]
- [Slides](https://docs.google.com/presentation/d/1stGiLbKXIaxam4nGDW-h4carQIVJDodHdklFGbaEPSU)

**Worked example.** A phone has a mass of 0.2 kg. You push it along a smooth table with a force of 1 N. What acceleration does its sensor report?

*Predict first:* more than 1 m/s² or less than 1 m/s²?

1. The second law says the net force on an object equals its mass times its acceleration: F = ma.
2. You know the force and the mass, so solve for the acceleration: a = F ÷ m.
3. Put in the numbers with their units: a = 1 N ÷ 0.2 kg.
4. One newton is one kilogram meter per second squared, so the kilograms cancel and m/s² is left.
5. a = **5 m/s²** in the direction of the push. Double the mass and the same push gives 2.5 m/s².

**Units check.** A phone's mass is often given as 200 g. Use 200 in place of 0.2 and the acceleration comes out as 0.005, which is a thousand times too small. A newton contains kilograms, so the mass must be in kilograms before the answer is in meters per second squared. The clip shows a second version of this mistake: weight is a force in newtons, and mass is in kilograms.

**Try it.** [SIM push-a-cart] The starter code has a cart, a force and a mass. Predict the acceleration on paper, run the code, and compare. Then double the mass and predict again before you run it.

**Ask your Dojo.**
- "Give me a force and a mass and ask me to predict the acceleration, with units. If I am right, change one number and ask me to predict how the answer changes before I calculate."
- "A cart is already moving when the same force acts on it for the same time. Ask me whether its speed increases by more, by less or by the same amount as a cart that starts from rest, and make me defend my answer with numbers."

---

## Stop 5 · Inside the sensor

**Why this stop.** This is where the two laws become a number on your phone. A small mass sits on a spring inside the chip. When the phone accelerates, the mass lags behind and the spring stretches until it pulls the mass along at the same acceleration. The phone measures how far the spring stretched.

**After this stop you can** predict how far the mass shifts for a given acceleration, and say what the sensor reports when the phone is still, pushed or falling.

**Watch.**
- Principle of the accelerometer - Prof. Sathya, 8 min · [youtu.be/gxZ7Hdrs3Yk](https://youtu.be/gxZ7Hdrs3Yk)
- How an accelerometer works - 5 min · [youtu.be/T_iXLNkkjFo](https://youtu.be/T_iXLNkkjFo)
- [Slides](https://docs.google.com/presentation/d/1P84I3PjGN-kAnTG6XqtGjv84gSKp-SCuNiLrsPANhZA)

[VIDEO A - Inside the sensor · https://youtu.be/O_PRqMp7gXg]

**Worked example.** A large model of the sensor has a mass of 0.01 kg on a spring with a spring constant of 20 N/m. The model is accelerated at 2 m/s². How far does the mass shift?

*Predict first:* a millimeter, a centimeter or a meter?

1. The spring is the only thing that pulls the mass along, so the spring force equals the mass times the acceleration: kx = ma.
2. Solve for the shift: x = ma ÷ k.
3. Put in the numbers with their units: x = 0.01 kg × 2 m/s² ÷ 20 N/m.
4. x = 0.001 m, which is **1 mm**.
5. The sensor works the other way around. It measures x and calculates a = kx ÷ m.

In a real phone the mass and the spring are a few thousandths of a millimeter across. The shift changes the gap between two tiny metal plates, the phone reads the change electrically, and three of these sit at right angles so the phone gets one number for each direction.

**What a still phone reads.** A phone lying on a table is not accelerating, and its sensor reads about 9.8 m/s² pointing up. The reason is that the spring has to hold the small mass up against gravity, so it is stretched even though nothing moves. A phone in free fall reads about 0, because the mass and the phone fall together and the spring is not stretched.

[VIDEO C - What a still phone reads · https://youtu.be/IYGsbg9F3VU]

**Units check.** In the worked example, give the mass as 10 g and use 10 in the formula. The shift comes out as 1 m, which is larger than the phone. The spring constant is in newtons per meter, and a newton contains kilograms, so the mass must be in kilograms.

**Try it.**
- [SIM sensor-spring] The starter code has a box with a mass on a spring inside. Set the acceleration, predict the shift with x = ma ÷ k, run the code, and compare. Then make the spring stiffer and predict whether the shift grows or shrinks.
- On your own phone: install the free app **phyphox** and open "Acceleration with g". Lay the phone flat and read the three numbers. Stand it on its long edge and read them again. Before each move, write down which number you expect to be near 9.8.

**Ask your Dojo.**
- "I will explain why a phone at rest reads 9.8 and a falling phone reads 0. Ask me questions wherever my explanation skips a step."
- "Ask me what the sensor reports when the phone moves at a steady speed in a straight line, and why."

---

## Stop 6 · Explore from the phone

You now have what the sensor needs: units, direction and the two laws. This stop is where you practice. Each problem below starts from something a phone or a car does with its sensor, and each one is written as a goal in the three-part form. Choose one to work on with your Dojo, or write your own in the same form. If you choose one, it can replace the goal at the top of this page as your Sprint 2 goal.

**Step counter.**
> Given the up-and-down acceleration my phone records while I walk, I can predict how many steps it will count in one minute. This is useful because it tells me when a step counter can be trusted and when it cannot.

Dojo: "Help me plan how to record my phone's acceleration for one minute of walking and count the peaks. Ask me what could make the count wrong before I record anything."

**Fall alert.**
> Given the height my phone falls from, I can predict how long its sensor will read close to zero. This is useful because a phone or a watch uses that time to decide whether someone has fallen.

Dojo: "Ask me to predict how long a phone is in free fall from 1 meter. Do not give me the formula until I have tried to reason from 9.8 m/s² second by second."

**Tilt control in a game.**
> Given the angle I tilt my phone, I can predict the reading along the screen. This is useful because a game turns that reading into steering.

Dojo: "Ask me what the sensor reads along the screen when the phone is flat and when it is upright, and then help me work out what happens in between." Starter code: [SIM phone-tilt]

**Car airbag.**
> Given a car's speed and the time it takes to stop in a crash, I can predict the acceleration the car's sensor reports. This is useful because the airbag fires only above a set value.

Dojo: "A car going 15 m/s stops in 0.1 s. Ask me to predict the acceleration and compare it with 9.8 m/s². Then ask me why hard braking does not fire the airbag."

**Earthquake detector.**
> Given how strongly the ground shakes, I can predict whether a phone lying on a table will register it. This is useful because thousands of phones together can report an earthquake seconds before the shaking arrives somewhere else.

Dojo: "Help me find out how small an acceleration a phone sensor can detect, and ask me how I would tell an earthquake from someone bumping the table."

---

## More practice

These are the full videos and the extra problems from earlier offerings of CST286. Open one when you want more worked problems on a topic, or when your Dojo suggests one.

**Units.** Units & Measurements, the full video - Prof. Sathya, 16 min · [youtu.be/H2ECsg6lxgg](https://youtu.be/H2ECsg6lxgg)

**Direction and motion.**
- Intro to vectors and scalars - Khan Academy, 9 min · [youtu.be/ihNZlp7iUHE](https://youtu.be/ihNZlp7iUHE)
- Distance, displacement, speed and velocity, questions 1 to 4 - Prof. Sathya, 12 min · [youtu.be/Rmmp6X59Lpg](https://youtu.be/Rmmp6X59Lpg)
- Question 5, a launched object - Prof. Sathya, 6 min · [youtu.be/dgV-u-BmIkY](https://youtu.be/dgV-u-BmIkY)
- Question 6, the detour - Prof. Sathya, 8 min · [youtu.be/F-1UkYUWxoQ](https://youtu.be/F-1UkYUWxoQ)
- [Worksheet](https://docs.google.com/document/d/1l8scaU7V5UcMh5aeyt1PW_qYaEG09BSd51Dz2nb5jis)

**Newton's first law.** Concept questions, the full video - Prof. Sathya, 16 min · [youtu.be/hOlmn-kd1nw](https://youtu.be/hOlmn-kd1nw)

**Newton's second law.**
- Concept questions, part 1 - Prof. Sathya, 25 min · [youtu.be/f4MusblLa1k](https://youtu.be/f4MusblLa1k)
- Concept questions, part 2 - Prof. Sathya, 19 min · [youtu.be/bcvbnbfFwrQ](https://youtu.be/bcvbnbfFwrQ)

**Newton's third law.** When your hand pushes the phone, the phone pushes back on your hand with the same force. These two videos show how to decide which forces act on which object.
- Newton's third law - Khan Academy, 8 min · [youtu.be/By-ggTfeuJU](https://youtu.be/By-ggTfeuJU)
- Concept questions - Prof. Sathya, 18 min · [youtu.be/JAZIdG1dlpM](https://youtu.be/JAZIdG1dlpM)

---

## Where this page comes from

The videos and clips by Prof. Sathya, and the worked examples at stops 1 and 3, come from earlier offerings of CST286. The Khan Academy videos and the video at stop 5 on how an accelerometer works are by their own authors. The trail layout, the units checks, the examples at stops 2, 4 and 5, the simulations and the problems at stop 6 were drafted with AI and reviewed by Prof. Sathya.
