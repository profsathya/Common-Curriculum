Web VPython 3.2
# Where the rule breaks  -  friction, and letting go
# The same person on the same spinning chair, seen from above, with two switches.
# friction_torque: the chair's bearing twists against the spin the whole time.
# let_go: at 2 seconds the person lets go of the weights instead of pulling them in.
# Before you run it, predict on paper what happens to the spin with each switch on.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

mass_each = 1.5        # each weight, in kilograms. Try 3.0                                  # <-- change this
r_start = 0.75         # how far the weights are from the middle at the start, in meters. Try 0.9   # <-- change this
r_end = 0.20           # how far they are after pulling in, in meters. Try 0.0               # <-- change this
body_I = 2.0           # the person + chair's moment of inertia, in kg m^2. Try 1.0          # <-- change this
omega_start = 3.0      # how fast the chair spins at the start, in rad/s. Try 1.5             # <-- change this
friction_torque = 0.0  # a steady twist from the bearing against the spin, in N m. Try 0.5   # <-- change this
let_go = False         # True lets go of the weights at 2 s instead of pulling in. Try True  # <-- change this

dt = 0.001             # one small step of time, in seconds
spin_time = 2.0        # spin this long with the weights out...
pull_time = 0.5        # ...take this long to pull them in (if the person holds on)...
total_time = 5.0       # ...and stop the run at this time

def moment_of_inertia(r):
    # the body's share plus each weight's share, m * r^2
    return body_I + 2 * mass_each * r * r

def two(x):
    # writes a number with two digits after the point
    n = round(abs(x) * 100)
    s = str(n // 100) + "." + str((n % 100) // 10) + str(n % 10)
    if x < 0 and n > 0:
        s = "-" + s
    return s

# L_spin is the angular momentum of everything that turns with the chair.
# Friction is an outside twist: it takes away friction_torque of L every second.
L_spin = moment_of_inertia(r_start) * omega_start

rng = max(1.3, max(r_start, r_end) + 0.4)
scene.background = vector(0.93, 0.94, 0.96)
scene.width = 600
scene.height = 400
scene.center = vector(-0.55 * rng, 0, 0)
scene.range = rng
scene.autoscale = False
scene.fov = 0.2                          # a narrow view, so the picture looks flat from straight above
ring(pos=vector(0, 0, -0.08), axis=vector(0, 0, 1), radius=r_start, thickness=0.006, color=color.gray(0.75))   # where the weights start
ring(pos=vector(0, 0, -0.08), axis=vector(0, 0, 1), radius=max(r_end, 0.001), thickness=0.006, color=color.gray(0.75))   # where they end up
body = cylinder(pos=vector(0, 0, -0.06), axis=vector(0, 0, 0.06), radius=0.25, color=vector(0.25, 0.3, 0.4))
rod_half = max(r_start, r_end) + 0.12
rod = cylinder(pos=vector(-rod_half, 0, 0.03), axis=vector(2 * rod_half, 0, 0), radius=0.02, color=color.gray(0.65))
nose = sphere(pos=vector(0, 0.25, 0.02), radius=0.06, color=vector(0.85, 0.75, 0.6))   # shows which way the person faces
weight_color = vector(0.9, 0.45, 0.1)
w1 = sphere(pos=vector(r_start, 0, 0.1), radius=0.08, color=weight_color, make_trail=False, trail_type="points", interval=2, trail_radius=0.015)
w2 = sphere(pos=vector(-r_start, 0, 0.1), radius=0.08, color=weight_color, make_trail=False, trail_type="points", interval=2, trail_radius=0.015)
label(pos=vector(-1.95 * rng, -0.85 * rng, 0), align="left", text="top view: person + chair (dark disc), two weights (orange)", height=13, box=False, opacity=0, color=color.gray(0.35))
readout = label(pos=vector(-1.95 * rng, 0.5 * rng, 0), align="left", text="", height=16, box=False, opacity=0, color=color.black)

L_most = L_spin
omega_most = L_spin / moment_of_inertia(min(r_start, r_end))
g1 = graph(title="How fast the chair spins", xtitle="time (s)", ytitle="omega (rad/s)", width=600, height=220, ymin=0, ymax=1.2 * omega_most, fast=False)
omega_c = gcurve(color=color.blue, label="omega")
g2 = graph(title="Angular momentum L", xtitle="time (s)", ytitle="L (kg m^2/s)", width=600, height=220, ymin=0, ymax=1.3 * L_most, fast=False)
total_c = gcurve(color=color.red, label="body + weights")
body_c = gcurve(color=vector(0.2, 0.6, 0.3), label="body only")

released = False
p1 = vector(0, 0, 0)       # a flying weight's position (the other one is at -p1)
v1 = vector(0, 0, 0)       # and its velocity (the other one moves at -v1)

def L_flying():
    # each flying weight's angular momentum about the middle is m * |r x v|
    if not released:
        return 0
    return 2 * mass_each * mag(cross(p1, v1))

def show():
    c = cos(angle)
    s = sin(angle)
    rod.pos = vector(-rod_half * c, -rod_half * s, 0.03)
    rod.axis = vector(2 * rod_half * c, 2 * rod_half * s, 0)
    nose.pos = vector(-0.25 * s, 0.25 * c, 0.02)
    if released:
        w1.pos = p1 + vector(0, 0, 0.1)
        w2.pos = -p1 + vector(0, 0, 0.1)
        if mag(p1) > 2.4 * rng:            # well off the screen
            w1.visible = False
            w2.visible = False
    else:
        w1.pos = vector(r * c, r * s, 0.1)
        w2.pos = vector(-r * c, -r * s, 0.1)
    L_total = L_spin + L_flying()
    omega_c.plot(t, omega)
    total_c.plot(t, L_total)
    body_c.plot(t, body_I * omega)
    readout.text = ("omega = " + two(omega) + " rad/s\n" +
        "I = " + two(I) + " kg m^2\n" +
        "L body + weights = " + two(L_total) + " kg m^2/s\n" +
        "L body only = " + two(body_I * omega) + " kg m^2/s\n" +
        "time = " + two(t) + " s")

def friction_step():
    # the bearing's twist takes a little L away each step, until the chair stops
    global L_spin
    if L_spin > 0:
        L_spin = max(0, L_spin - friction_torque * dt)

t = 0
angle = 0
r = r_start
I = moment_of_inertia(r)
omega = L_spin / I
show()

# 1. Spin with the weights held out.
end_time = spin_time
while t < end_time - dt / 2:
    rate(50)                          # one drawn frame...
    for i in range(20):               # ...carries twenty small steps
        if t >= end_time - dt / 2:
            break
        friction_step()
        omega = L_spin / I
        angle = angle + omega * dt
        t = t + dt
    show()
omega_before = omega
L_before = L_spin

if let_go:
    # 2a. Let go. Each weight flies off in a straight line, along its circle's edge,
    # at the speed it had: omega * r_start. The body keeps its own share of L, body_I * omega.
    released = True
    p1 = vector(r_start * cos(angle), r_start * sin(angle), 0)
    v1 = omega * r_start * vector(-sin(angle), cos(angle), 0)
    I = body_I
    L_spin = body_I * omega
    w1.make_trail = True
    w2.make_trail = True
else:
    # 2b. Pull both weights in.
    pull_start = t
    end_time = pull_start + pull_time
    while t < end_time - dt / 2:
        rate(50)
        for i in range(20):
            if t >= end_time - dt / 2:
                break
            friction_step()
            t = t + dt
            u = min(1, (t - pull_start) / pull_time)        # how far through the pull, from 0 to 1
            r = r_start + (r_end - r_start) * u * u * (3 - 2 * u)
            I = moment_of_inertia(r)
            omega = L_spin / I
            angle = angle + omega * dt
        show()

# 3. Keep going to the end of the run.
end_time = total_time
while t < end_time - dt / 2:
    rate(50)
    for i in range(20):
        if t >= end_time - dt / 2:
            break
        friction_step()
        omega = L_spin / I
        angle = angle + omega * dt
        if released:
            p1 = p1 + v1 * dt          # no force on a flying weight, so it keeps a straight line
        t = t + dt
    show()

switches = "friction_torque = " + two(friction_torque) + " N m, let_go = " + ("True" if let_go else "False")
scene.caption = ("RESULT: " + switches + " | omega before = " + two(omega_before) + " rad/s, at end = " + two(omega) + " rad/s | " +
    "L body + weights before = " + two(L_before) + ", at end = " + two(L_spin + L_flying()) + " kg m^2/s | " +
    "L body only at end = " + two(body_I * omega) + " kg m^2/s\n")
