Web VPython 3.2
# The free kick  -  bend it around the wall and score
# Straight at the goal is blocked: a wall of defenders is in the way.
# Aim to one side, add spin, and let the physics bring it back in.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

spin = 0            # turns per second. + bends LEFT, - bends RIGHT. Try 5, 6, 7      # <-- change this
aim = 0             # degrees. + aims RIGHT of the goal, - aims left. Try 12          # <-- change this
speed = 25          # kick speed in m/s (25 m/s is about 56 mph)                       # <-- change this
drag_on = True      # air drag: True or False                                          # <-- change this

# --- the physics numbers -------------------------------------------------
mass = 0.43         # kg, a soccer ball
radius = 0.11       # m
rho = 1.2           # air density, kg per cubic metre
Cd = 0.25           # drag coefficient of a smooth ball
area = pi * radius**2
g = vector(0, -9.8, 0)
launch_up = 15      # launch angle above the ground, degrees

# --- the pitch: goal 24 m away, wall of defenders 9 m away ---------------
scene.background = vector(0.55, 0.75, 0.95)
scene.camera.pos = vector(-7, 3.2, 4)
scene.camera.axis = vector(32, -2.5, -4)
for i in range(6):                                   # mowed stripes
    shade = 0.42 + 0.06 * (i % 2)
    box(pos=vector(3 + i*6, -0.06, 0), size=vector(6, 0.1, 46), color=vector(0.22, shade, 0.25))
box(pos=vector(24, 0.01, 0), size=vector(0.12, 0.02, 7.32), color=color.white)      # goal line
post1 = cylinder(pos=vector(24, 0, -3.66), axis=vector(0, 2.44, 0), radius=0.06, color=color.white)
post2 = cylinder(pos=vector(24, 0, 3.66), axis=vector(0, 2.44, 0), radius=0.06, color=color.white)
bar = cylinder(pos=vector(24, 2.44, -3.66), axis=vector(0, 0, 7.32), radius=0.06, color=color.white)
net = box(pos=vector(24.7, 1.22, 0), size=vector(1.4, 2.44, 7.32), color=color.white, opacity=0.15)
for dz in [-1.1, -0.37, 0.37, 1.1]:                  # the wall: four defenders, arms up
    box(pos=vector(9.15, 0.95, dz), size=vector(0.4, 1.9, 0.62), color=vector(0.75, 0.25, 0.2))
    sphere(pos=vector(9.15, 2.05, dz), radius=0.14, color=vector(0.9, 0.7, 0.55))
wall_top = 2.0      # they can jump: the wall blocks anything under 2 m
wall_half = 1.5     # and it is 3 m wide

# --- the kick ------------------------------------------------------------
up = radians(launch_up)
side = radians(aim)
v0 = speed * vector(cos(up) * cos(side), sin(up), cos(up) * sin(side))
omega = vector(0, 2 * pi * spin, 0)                  # spin as a vector: how fast, about which axis

ball = sphere(pos=vector(0, radius, 0), radius=radius, color=color.white, make_trail=True, trail_color=color.yellow, trail_radius=0.035)
ball.v = v0
ghost = sphere(pos=vector(0, radius, 0), radius=radius, color=color.gray(0.6), opacity=0.5, make_trail=True, trail_color=color.gray(0.7), trail_radius=0.02)
ghost.v = v0                                          # the ghost: your exact kick, but with NO spin
magnus_arrow = arrow(pos=ball.pos, axis=vector(0,0,0), color=color.cyan, shaftwidth=0.09)
banner = label(pos=vector(12, 4.6, 0), text="", height=26, box=False, opacity=0, color=color.yellow, visible=False)

gr = graph(title="Sideways drift: your kick (red) and the same kick with no spin (gray)", xtitle="time (s)", ytitle="sideways position z (m)", width=600, height=230, fast=False)
drift = gcurve(color=color.red, label="your kick")
gdrift = gcurve(color=color.gray(0.6), label="the ghost (no spin)")

def outcome(b, is_ball):
    # where is this ball, and is its flight over?  returns "" while still flying
    if 9.0 <= b.pos.x <= 9.4 and b.pos.y < wall_top and abs(b.pos.z) < wall_half:
        return "BLOCKED - hit the wall at " + str(round(b.pos.y, 2)) + " m up, " + str(round(abs(b.pos.z), 2)) + " m from its centre (it blocks up to 2.0 m)"
    if b.pos.x >= 24:
        if b.pos.y < 2.44 and abs(b.pos.z) < 3.66:
            return "GOAL! - crossed " + str(round(3.66 - abs(b.pos.z), 1)) + " m inside the post, " + str(round(b.pos.y, 2)) + " m off the ground"
        if abs(b.pos.z) >= 3.66:
            return "WIDE by " + str(round(abs(b.pos.z) - 3.66, 1)) + " m - crossed the line at z = " + str(round(abs(b.pos.z), 1)) + " m, the post is at 3.66"
        return "OVER the bar - crossed at " + str(round(b.pos.y, 2)) + " m, the bar is at 2.44"
    if b.pos.y < radius:
        return "landed short, " + str(round(24 - b.pos.x, 1)) + " m from the goal"
    return ""

def step(b, spinvec):
    v = b.v
    F = mass * g                                               # gravity
    if drag_on:
        F = F - 0.5 * rho * Cd * area * mag(v) * v             # drag: against the motion, grows with speed squared
    F = F + 0.5 * rho * area * radius * cross(spinvec, v)      # Magnus: sideways to both the spin axis and the motion
    b.v = v + (F / mass) * dt                                  # F = m a, one small step at a time
    b.pos = b.pos + b.v * dt

t = 0
dt = 0.005
ball_done = ""
ghost_done = ""
max_magnus = 0
while (ball_done == "" or ghost_done == "") and t < 4:
    rate(50)                          # one drawn frame...
    for i in range(4):                # ...carries four small physics steps
        if ball_done == "":
            step(ball, omega)
            ball_done = outcome(ball, True)
        if ghost_done == "":
            step(ghost, vector(0, 0, 0))
            ghost_done = outcome(ghost, False)
        t = t + dt
    F_magnus = 0.5 * rho * area * radius * cross(omega, ball.v)
    if ball_done == "" and mag(F_magnus) > max_magnus:
        max_magnus = mag(F_magnus)
    magnus_arrow.pos = ball.pos
    magnus_arrow.axis = F_magnus * 1.5                         # the sideways push, drawn on the ball
    if ball_done != "":
        magnus_arrow.visible = False
    drift.plot(t, ball.pos.z)
    gdrift.plot(t, ghost.pos.z)

banner.text = ball_done.split(" - ")[0]
banner.color = color.green if ball_done.startswith("GOAL") else color.yellow
banner.visible = True
scene.caption = ("RESULT: your kick: " + ball_done + "  |  the ghost (same kick, no spin): " + ghost_done + "\n" +
    "Measured: biggest sideways force on your ball " + str(round(max_magnus, 2)) + " N (its weight is " + str(round(mass * 9.8, 1)) + " N); " +
    "your ball ended at z = " + str(round(ball.pos.z, 2)) + " m, the ghost at z = " + str(round(ghost.pos.z, 2)) + " m.")
