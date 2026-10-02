Web VPython 3.2
# Push a cart  -  force, mass and the acceleration you predict
# A constant force pushes a cart along a track with no friction.
# Before you run it, predict the acceleration on paper: a = F / m.
# Then run it and compare your number with the one on the screen.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

force = 1.0    # the push, in newtons. Try 2, 0.5          # <-- change this
mass = 0.2     # the cart's mass, in kilograms. Try 0.4    # <-- change this

dt = 0.001            # one small step of time, in seconds
run_time = 3          # the push lasts this many seconds
track_length = 50     # in meters. The run also stops if the cart reaches the end

scene.background = vector(0.93, 0.94, 0.96)
scene.width = 600
scene.height = 300
scene.center = vector(track_length / 2, 5, 0)
scene.range = 0.32 * track_length
track = box(pos=vector(track_length / 2, -0.25, 0), size=vector(track_length + 6, 0.5, 4), color=color.gray(0.6))
for i in range(6):
    box(pos=vector(10 * i, 0.02, 0), size=vector(0.15, 0.05, 4), color=color.white)      # a mark every 10 meters
cart = box(pos=vector(0, 1, 0), size=vector(4, 2, 3), color=vector(0.2, 0.45, 0.8))
push = arrow(pos=cart.pos + vector(2, 0, 0), axis=vector(4 * force, 0, 0), color=color.red, shaftwidth=0.6)
readout = label(pos=vector(track_length / 2, 13, 0), text="", height=18, box=False, opacity=0, color=color.black)

gr = graph(title="Speed of the cart", xtitle="time (s)", ytitle="speed (m/s)", width=600, height=260, fast=False)
speed_c = gcurve(color=color.blue, label="speed")

position = 0
speed = 0
acceleration = 0
t = 0
speed_c.plot(0, 0)
while t < run_time - dt / 2 and position < track_length:
    rate(25)                          # one drawn frame...
    speed_before = speed
    t_before = t
    for i in range(40):               # ...carries forty small steps
        if t >= run_time - dt / 2 or position >= track_length:
            break
        # the force changes the speed a little, then the speed changes the position a little
        speed = speed + (force / mass) * dt
        position = position + speed * dt
        t = t + dt
    # measure the acceleration from the motion: change in speed divided by the time it took
    acceleration = (speed - speed_before) / (t - t_before)
    cart.pos.x = position
    push.pos.x = position + 2
    speed_c.plot(t, speed)
    readout.text = ("force = " + str(force) + " N   mass = " + str(mass) + " kg\n" +
        "acceleration = " + str(round(acceleration, 2)) + " m/s^2\n" +
        "speed = " + str(round(speed, 2)) + " m/s\n" +
        "time = " + str(round(t, 2)) + " s")

scene.caption = "RESULT: acceleration = " + str(round(acceleration, 3)) + " m/s^2, speed after " + str(round(t, 2)) + " s = " + str(round(speed, 3)) + " m/s\n"
