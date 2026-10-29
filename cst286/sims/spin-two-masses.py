Web VPython 3.2
# Pull in the weights  -  a spinning chair speeds up
# You are looking down from above at a person on a spinning chair (the dark disc).
# The person holds a weight on each side, on a light rod. There is no friction.
# After 2 seconds the person pulls both weights in toward the middle.
# Before you run it, predict on paper how fast the chair spins after the pull.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

mass_each = 1.5      # each weight, in kilograms. Try 3.0                                  # <-- change this
r_start = 0.75       # how far the weights are from the middle at the start, in meters. Try 0.9   # <-- change this
r_end = 0.20         # how far they are after pulling in, in meters. Try 0.0               # <-- change this
body_I = 2.0         # the person + chair's moment of inertia, in kg m^2. Try 1.0          # <-- change this
omega_start = 3.0    # how fast the chair spins at the start, in rad/s. Try 1.5             # <-- change this

dt = 0.001           # one small step of time, in seconds
spin_time = 2.0      # spin this long with the weights out...
pull_time = 0.5      # ...take this long to pull them in...
after_time = 2.5     # ...then spin this much longer

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

# L is the angular momentum: L = I * omega. With no outside twist, L stays the same.
L = moment_of_inertia(r_start) * omega_start

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
w1 = sphere(pos=vector(r_start, 0, 0.1), radius=0.08, color=weight_color)
w2 = sphere(pos=vector(-r_start, 0, 0.1), radius=0.08, color=weight_color)
label(pos=vector(-1.95 * rng, -0.85 * rng, 0), align="left", text="top view: person + chair (dark disc), two weights (orange)", height=13, box=False, opacity=0, color=color.gray(0.35))
readout = label(pos=vector(-1.95 * rng, 0.55 * rng, 0), align="left", text="", height=16, box=False, opacity=0, color=color.black)

omega_most = L / moment_of_inertia(min(r_start, r_end))
g1 = graph(title="How fast the chair spins", xtitle="time (s)", ytitle="omega (rad/s)", width=600, height=220, ymin=0, ymax=1.2 * omega_most, fast=False)
omega_c = gcurve(color=color.blue, label="omega")
g2 = graph(title="Angular momentum L = I * omega", xtitle="time (s)", ytitle="L (kg m^2/s)", width=600, height=220, ymin=0, ymax=1.3 * L, fast=False)
L_c = gcurve(color=color.red, label="L")

def show():
    c = cos(angle)
    s = sin(angle)
    rod.pos = vector(-rod_half * c, -rod_half * s, 0.03)
    rod.axis = vector(2 * rod_half * c, 2 * rod_half * s, 0)
    nose.pos = vector(-0.25 * s, 0.25 * c, 0.02)
    w1.pos = vector(r * c, r * s, 0.1)
    w2.pos = vector(-r * c, -r * s, 0.1)
    omega_c.plot(t, omega)
    L_c.plot(t, I * omega)
    readout.text = ("omega = " + two(omega) + " rad/s\n" +
        "I = " + two(I) + " kg m^2\n" +
        "L = " + two(I * omega) + " kg m^2/s\n" +
        "time = " + two(t) + " s")

t = 0
angle = 0
r = r_start
I = moment_of_inertia(r)
omega = L / I
show()

# 1. Spin with the weights held out.
end_time = spin_time
while t < end_time - dt / 2:
    rate(50)                          # one drawn frame...
    for i in range(20):               # ...carries twenty small steps
        if t >= end_time - dt / 2:
            break
        omega = L / I
        angle = angle + omega * dt
        t = t + dt
    show()
omega_before = omega
I_before = I
L_before = I * omega

# 2. Pull both weights in.
# Before you run it, predict on paper:  omega after = omega_start * I_start / I_end
pull_start = t
end_time = pull_start + pull_time
while t < end_time - dt / 2:
    rate(50)
    for i in range(20):
        if t >= end_time - dt / 2:
            break
        t = t + dt
        u = min(1, (t - pull_start) / pull_time)        # how far through the pull, from 0 to 1
        r = r_start + (r_end - r_start) * u * u * (3 - 2 * u)
        I = moment_of_inertia(r)
        omega = L / I                 # L stays the same, so a smaller I means a bigger omega
        angle = angle + omega * dt
    show()

# 3. Keep spinning with the weights pulled in.
end_time = t + after_time
while t < end_time - dt / 2:
    rate(50)
    for i in range(20):
        if t >= end_time - dt / 2:
            break
        omega = L / I
        angle = angle + omega * dt
        t = t + dt
    show()

scene.caption = ("RESULT: omega before = " + two(omega_before) + " rad/s, after = " + two(omega) + " rad/s | " +
    "I before = " + two(I_before) + ", after = " + two(I) + " kg m^2 | " +
    "L before = " + two(L_before) + ", after = " + two(I * omega) + " kg m^2/s\n")
