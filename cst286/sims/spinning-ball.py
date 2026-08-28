Web VPython 3.2
# Why a spinning ball curves  -  CST286 Explore Physics Loop
# The stage cards on the course page tell you which line to change.
# Lines marked  # <-- change this  are the ones to edit. The Reset button brings this original back.

spin = 0            # turns per second. 0 = no spin. Try 5, 10, -10          # <-- change this
speed = 25          # launch speed in m/s. A hard kick is about 25 to 30      # <-- change this
drag_on = True      # air drag: True or False                                  # <-- change this

mass = 0.43         # kg, a soccer ball
radius = 0.11       # m
rho = 1.2           # air density, kg per cubic metre
Cd = 0.25           # drag coefficient of a smooth ball
area = pi * radius**2
g = vector(0, -9.8, 0)

scene.title = "Kicked along +x at 15 degrees up. Spin is about the vertical axis, so any curve shows up sideways."
scene.camera.pos = vector(-8, 4, 0)
scene.camera.axis = vector(28, -4, 0)
ground = box(pos=vector(30, -0.05, 0), size=vector(80, 0.1, 40), color=vector(0.3, 0.6, 0.3))
line = box(pos=vector(30, 0.01, 0), size=vector(80, 0.02, 0.1), color=color.white)
ball = sphere(pos=vector(0, radius, 0), radius=radius, color=color.white, make_trail=True, trail_color=color.yellow)

ball.v = speed * vector(cos(radians(15)), sin(radians(15)), 0)
omega = vector(0, 2 * pi * spin, 0)          # spin as a vector: how fast, and about which axis

gr = graph(title="Sideways drift of the ball", xtitle="time (s)", ytitle="sideways position z (m)", width=600, height=240)
drift = gcurve(color=color.red)

t = 0
dt = 0.005
while ball.pos.y >= radius:
    rate(50)                          # one drawn frame...
    for i in range(4):                # ...carries four small physics steps
        v = ball.v
        F = mass * g                                               # gravity
        if drag_on:
            F = F - 0.5 * rho * Cd * area * mag(v) * v             # drag: pushes against the motion, grows with speed squared
        F = F + 0.5 * rho * area * radius * cross(omega, v)        # Magnus: sideways to both the spin axis and the motion
        ball.v = v + (F / mass) * dt                               # F = m a, taken one small step at a time
        ball.pos = ball.pos + ball.v * dt
        t = t + dt
        if ball.pos.y < radius:
            break
    drift.plot(t, ball.pos.z)

print("Landed after", round(t, 2), "s at x =", round(ball.pos.x, 1), "m, drifted sideways z =", round(ball.pos.z, 2), "m")
