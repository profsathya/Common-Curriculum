<!-- Editable text companion to trail-accelerometer.html (the .html is not built yet). DRAFT 1, 2 Oct 2026, for Prof. Sathya to edit.
Notes for the editor, not shown to students:
- NEW content that is not in the old videos: (a) a phone lying still reads about 9.8 m/s² and a falling phone reads about 0 (stop 6); (b) the phyphox app (stop 6); (c) the five "Make it yours" goals (stop 7); (d) the numbers in the stop 6 worked example (a large model, chosen so the arithmetic is easy).
- Corrected from the old Units video: 75 in³ needs 2.54 cubed. The video says "75 × 2.54 ÷ 1000".
- Computed here because the old videos leave them to students: detour problem (x = 32 km, total 156 km, 1.5 h).
- "About five to six hours" is my estimate: 2 h 40 min of video plus the examples.
- [VIDEO A/B/C] mark where the three new silent videos go. [SIM] marks starter code that opens in the course runner. PlayPosit links are added only if they open for a student outside Canvas.
- Each stop keeps the same seven parts in the same order. -->

CST286 · Fall 2026 · A trail you can take as your Sprint 2 goal

# How does your phone know it moved?

Turn your phone sideways and the screen turns with it. Walk, and the phone counts your steps. Drop it, and some phones call for help. Each of these starts from one small sensor, the accelerometer, and the sensor works because of physics you can learn in this sprint.

## A goal you can take as written

> **Given** the push on my phone, in newtons, and the phone's mass, in kilograms,
> **I can predict** the acceleration its sensor will report, in meters per second squared.
> **This is useful because** a step counter, a screen that rotates and a fall alert all start from that one number.

**Copy this goal** - paste it into your Sprint 2 goal post as it is, or change it at stop 7.

The trail has seven stops. The videos add up to about 2 hours 40 minutes, so with the examples the trail takes about five to six hours across the sprint. You can open the stops in any order. If you are not sure where to begin, begin at stop 1, because every later stop depends on getting units right.

---

## Stop 1 · Units

**Why this stop.** The sensor in your phone reports a number, and an app can use that number only if it knows the unit. A step counter that reads 9.8 and does not know whether it means meters per second squared or feet per second squared will count the wrong steps.

**After this stop you can** convert a quantity from one unit to another by lining up conversion factors so the units you do not want cancel.

**Watch.** Units & Measurements - Prof. Sathya, 16 min · [youtu.be/H2ECsg6lxgg](https://youtu.be/H2ECsg6lxgg) · [slides](https://docs.google.com/presentation/d/1WNMl2gCaXzvLytnWBTNDmPVOMl2dWLSAWbwY3iNjDVU)

**Worked example.** How many liters of water fill a container of 75 cubic inches?

*Predict first:* is the answer closer to 0.2 liters, 1 liter or 75 liters?

1. Write where you start and where you want to end: 75 in³ → liters.
2. Find the conversion factors that connect them: 1 in = 2.54 cm, and 1 L = 1000 cm³.
3. The container is measured in cubic inches, so the inch-to-centimeter factor is used three times: 1 in³ = 2.54 × 2.54 × 2.54 = 16.39 cm³.
4. Line them up so the units cancel: 75 in³ × 16.39 cm³ / 1 in³ × 1 L / 1000 cm³.
5. Cubic inches cancel, then cubic centimeters cancel, and liters are left: **1.23 L**.

**Units check.** Run step 3 with 2.54 used once instead of three times. The answer becomes 0.19 L, about six times too small, and nothing in the arithmetic warns you. The units do warn you: in³ × cm / in leaves in² · cm, which is not a volume. In 1999 NASA lost the Mars Climate Orbiter because one team sent numbers in pound-force seconds and the other team read them as newton-seconds.

[VIDEO B - Same number, wrong unit]

**Ask your Dojo.**
- "Give me one unit conversion that needs two conversion factors. Do not solve it. Ask me to set up the chain, and tell me only whether my units cancel."
- "I will explain why 20 cm is 0.2 m and not 2000 m. Ask me questions until my explanation would convince someone who has never used the metric system."

---

## Stop 2 · Describing motion

**Why this stop.** The sensor reports acceleration with a direction: it gives three numbers, one for each direction the phone can move. To read those numbers you need to tell apart the quantities that carry a direction from the ones that do not.

**After this stop you can** tell distance from displacement and speed from velocity, and calculate a speed in consistent units.

**Watch.**
- Intro to vectors and scalars - Khan Academy, 9 min · [youtu.be/ihNZlp7iUHE](https://youtu.be/ihNZlp7iUHE)
- Questions 1 to 4, worked - Prof. Sathya, 12 min · [youtu.be/Rmmp6X59Lpg](https://youtu.be/Rmmp6X59Lpg)
- Question 5, a launched object - Prof. Sathya, 6 min · [youtu.be/dgV-u-BmIkY](https://youtu.be/dgV-u-BmIkY)
- Question 6, the detour - Prof. Sathya, 8 min · [youtu.be/F-1UkYUWxoQ](https://youtu.be/F-1UkYUWxoQ)
- [Slides](https://docs.google.com/presentation/d/1JzEkEWldFH_Y05a1hzHBevOPjGw9OSM7TszoygXa4oQ) · [worksheet](https://docs.google.com/document/d/1l8scaU7V5UcMh5aeyt1PW_qYaEG09BSd51Dz2nb5jis)

**Worked example.** A teacher walks 4 m east, 2 m south, 4 m west and 2 m north. What distance did she walk, and what is her displacement?

*Predict first:* are the two answers the same number?

1. Draw it on paper with north, east, south and west marked.
2. Distance has no direction, so add every part: 4 + 2 + 4 + 2 = **12 m**.
3. Displacement has a direction, so parts in opposite directions cancel. The 4 m east cancels the 4 m west, and the 2 m south cancels the 2 m north.
4. She ends where she started, so her displacement is **0 m**.

**Units check.** A driver plans a trip at 32 km/h. A closed road makes the last part 28 km longer, so he drives it at 40 km/h and still arrives 30 minutes late. If x is the planned distance for that last part, the planned time is x/32 and the real time is (x + 28)/40, both in hours. The 30 minutes must also be in hours, so the equation is x/32 = (x + 28)/40 − 0.5, and x = 32 km. Write 30 instead of 0.5 and the same equation gives x = −4,688 km, a negative distance, because the equation now says he was 30 hours late.

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
- Concept questions - Prof. Sathya, 16 min · [youtu.be/hOlmn-kd1nw](https://youtu.be/hOlmn-kd1nw)
- [Slides](https://docs.google.com/presentation/d/1stGiLbKXIaxam4nGDW-h4carQIVJDodHdklFGbaEPSU)

**Worked example.** What does the headrest on a car seat protect you from? (a) Nothing, it is a place to rest your head. (b) Injury to your head in a front collision. (c) Injury to your neck when the car is hit from behind. (d) Both b and c.

*Predict first:* choose one before you read on.

1. Take the car hit from behind. The car is pushed forward suddenly, and the seat pushes your body forward with it.
2. Nothing pushes your head forward, so by the first law your head stays where it was while your body moves ahead.
3. Your head therefore snaps backward compared with your body, and your neck takes the strain.
4. The headrest is behind your head, so it stops the head after a short distance.
5. In a front collision your head keeps moving forward, away from the headrest, so the headrest does not help there. The answer is **(c)**.

**Units check.** "The car rounds the curve at a constant 60 mi/h." The speed is constant, and the velocity is still changing, because velocity includes direction and the direction changes all the way around the curve. A change in velocity needs an unbalanced force, so there is one on the car even though the number on the speedometer stays at 60. In metric units 60 mi/h is 26.8 m/s.

**Ask your Dojo.**
- "A ball sits in the middle of a wagon and the wagon is pulled forward suddenly. Ask me where the ball ends up and why. Then ask me how this is like the mass inside my phone's sensor."
- "Ask me to explain why a seat belt is needed, using the first law, and keep asking 'what force?' until I name one."

---

## Stop 4 · Newton's second law

**Why this stop.** The goal on this page is a second-law prediction. The push on the phone is a force, the phone has a mass, and the second law connects them to the acceleration that the sensor reports.

**After this stop you can** use F = ma to predict any one of force, mass and acceleration from the other two, with the units carried through.

**Watch.**
- Newton's second law - Khan Academy, 7 min · [youtu.be/ou9YMWlJgkE](https://youtu.be/ou9YMWlJgkE)
- Concept questions, part 1 - Prof. Sathya, 25 min · [youtu.be/f4MusblLa1k](https://youtu.be/f4MusblLa1k)
- Concept questions, part 2 - Prof. Sathya, 19 min · [youtu.be/bcvbnbfFwrQ](https://youtu.be/bcvbnbfFwrQ)
- [Slides](https://docs.google.com/presentation/d/1stGiLbKXIaxam4nGDW-h4carQIVJDodHdklFGbaEPSU)

**Worked example.** An object weighs 98 N on Earth and 37 N on Mars. It sits on a frictionless surface. On which planet do you need more force to accelerate it sideways at 10 m/s²?

*Predict first:* Earth, Mars, or the same?

1. Weight is the force of gravity on the object, so on Earth 98 N = m × 9.8 m/s².
2. Divide to find the mass: m = 98 ÷ 9.8 = 10 kg.
3. Check with Mars, where gravity gives about 3.7 m/s²: 10 kg × 3.7 m/s² = 37 N. The mass is the same on both planets.
4. Gravity pulls down and the push is sideways, so gravity does not change the sideways force you need.
5. F = ma = 10 kg × 10 m/s² = **100 N on both planets**.

Now the goal on this page: a phone has a mass of 0.2 kg, and you push it along a smooth table with 1 N. The sensor reports a = F ÷ m = 1 N ÷ 0.2 kg = **5 m/s²** in the direction of the push.

**Units check.** In the example, use the weight in place of the mass: 98 × 10 gives 980, almost ten times too large. The units show the mistake, because newtons times meters per second squared is not a force. Mass is in kilograms and weight is in newtons, and one newton is one kilogram meter per second squared.

**Try it.** [SIM push-a-cart] The starter code has a cart, a force and a mass. Predict the acceleration on paper, run the code, and compare. Then double the mass and predict again before you run it.

**Ask your Dojo.**
- "Give me a force and a mass and ask me to predict the acceleration, with units. If I am right, change one number and ask me to predict how the answer changes before I calculate."
- "A cart is already moving when the same force acts on it for the same time. Ask me whether its speed increases by more, by less or by the same amount as a cart that starts from rest, and make me defend my answer with numbers."

---

## Stop 5 · Newton's third law

**Why this stop.** When your hand pushes the phone, the phone pushes back on your hand with the same force. Inside the sensor the same thing happens between the spring and the small mass. To predict what the mass does, you need to know which of those forces act on the mass and which act on something else.

**After this stop you can** list the forces that act on one object and use only those to decide whether it accelerates.

**Watch.**
- Newton's third law - Khan Academy, 8 min · [youtu.be/By-ggTfeuJU](https://youtu.be/By-ggTfeuJU)
- Concept questions - Prof. Sathya, 18 min · [youtu.be/JAZIdG1dlpM](https://youtu.be/JAZIdG1dlpM)
- [Slides](https://docs.google.com/presentation/d/1stGiLbKXIaxam4nGDW-h4carQIVJDodHdklFGbaEPSU)

**Worked example.** You push a table. The table pushes back on you with an equal force. Why does the table move at all?

*Predict first:* do the two forces cancel?

1. Your push acts on the table. The table's push back acts on you. They act on different objects, so they cannot cancel each other.
2. To decide whether the table moves, list only the forces on the table: your push, and the friction between its legs and the floor.
3. On a smooth floor your push is larger than the friction, so there is a net force on the table and it accelerates, by the second law.
4. If the legs are nailed down, the floor matches your push and the table stays.
5. To decide whether you move, list only the forces on you: the table's push back, and the friction under your feet. On ice that friction is small, so you slide backward.

**Units check.** A phone with a mass of 200 g rests on a table. Its weight is 0.2 kg × 9.8 m/s² = 1.96 N, so the table pushes up on it with 1.96 N. Use 200 in place of 0.2 and the weight comes out as 1,960 N, which is the weight of a motorcycle. Grams must become kilograms before the answer is in newtons.

**Ask your Dojo.**
- "A locomotive pulls wagons and the wagons pull back with an equal force. Ask me how the train can start moving, and do not accept an answer that says one pull is larger."
- "Ask me to name the action and reaction pair when a bird flies, and then ask me which object each force acts on."

---

## Stop 6 · Inside the sensor

**Why this stop.** This is where the three laws become a number on your phone. A small mass sits on a spring inside the chip. When the phone accelerates, the mass lags behind and the spring stretches until it pulls the mass along at the same acceleration. The phone measures how far the spring stretched.

**After this stop you can** predict how far the mass shifts for a given acceleration, and say what the sensor reports when the phone is still, pushed or falling.

**Watch.**
- Principle of the accelerometer - Prof. Sathya, 8 min · [youtu.be/gxZ7Hdrs3Yk](https://youtu.be/gxZ7Hdrs3Yk)
- How an accelerometer works - 5 min · [youtu.be/T_iXLNkkjFo](https://youtu.be/T_iXLNkkjFo)
- [Slides](https://docs.google.com/presentation/d/1P84I3PjGN-kAnTG6XqtGjv84gSKp-SCuNiLrsPANhZA)

[VIDEO A - Inside the sensor]

**Worked example.** A large model of the sensor has a mass of 0.01 kg on a spring with a spring constant of 20 N/m. The model is accelerated at 2 m/s². How far does the mass shift?

*Predict first:* a millimeter, a centimeter or a meter?

1. The spring is the only thing that pulls the mass along, so the spring force equals the mass times the acceleration: kx = ma.
2. Solve for the shift: x = ma ÷ k.
3. Put in the numbers with their units: x = 0.01 kg × 2 m/s² ÷ 20 N/m.
4. x = 0.001 m, which is **1 mm**.
5. The sensor works the other way around. It measures x and calculates a = kx ÷ m.

In a real phone the mass and the spring are a few thousandths of a millimeter across. The shift changes the gap between two tiny metal plates, the phone reads the change electrically, and three of these sit at right angles so the phone gets one number for each direction.

**What a still phone reads.** A phone lying on a table is not accelerating, and its sensor reads about 9.8 m/s² pointing up. The reason is that the spring has to hold the small mass up against gravity, so it is stretched even though nothing moves. A phone in free fall reads about 0, because the mass and the phone fall together and the spring is not stretched.

[VIDEO C - What a still phone reads]

**Units check.** In the worked example, give the mass as 10 g and use 10 in the formula. The shift comes out as 1 m, which is larger than the phone. The spring constant is in newtons per meter, and a newton contains kilograms, so the mass must be in kilograms.

**Try it.**
- [SIM sensor-spring] The starter code has a box with a mass on a spring inside. Set the acceleration, predict the shift with x = ma ÷ k, run the code, and compare. Then make the spring stiffer and predict whether the shift grows or shrinks.
- On your own phone: install the free app **phyphox** and open "Acceleration with g". Lay the phone flat and read the three numbers. Stand it on its long edge and read them again. Before each move, write down which number you expect to be near 9.8.

**Ask your Dojo.**
- "I will explain why a phone at rest reads 9.8 and a falling phone reads 0. Ask me questions wherever my explanation skips a step."
- "Ask me what the sensor reports when the phone moves at a steady speed in a straight line, and why."

---

## Stop 7 · Make it yours

The goal at the top of this page is one of many that use the same physics. Each goal below keeps the three-part form and changes what you predict. Choose one, or write your own in the same form, and take the Dojo prompt to your coach.

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

## Where this page comes from

The videos by Prof. Sathya and the worked examples at stops 1 to 5 come from earlier offerings of CST286. The Khan Academy videos and the video at stop 6 on how an accelerometer works are by their own authors. The trail layout, the units checks, the stop 6 example, the simulations and the goals at stop 7 were drafted with AI and reviewed by Prof. Sathya.
