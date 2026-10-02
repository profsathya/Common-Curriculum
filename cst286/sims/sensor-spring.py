Web VPython 3.2
# Inside the sensor  -  how far the small mass shifts
# The box is the phone. Inside it, a small mass sits on a spring.
# The phone accelerates to the right. The mass lags behind and the spring stretches
# until the spring pulls the mass along at the phone's acceleration.
# Before you run it, predict the shift on paper: x = mass * acceleration / spring_k.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

phone_acceleration = 2.0   # in m/s^2. Try 4, 9.8             # <-- change this
mass = 0.01                # the small mass, in kilograms. Try 0.02   # <-- change this
spring_k = 20.0            # the spring constant, in N/m. Try 40      # <-- change this

dt = 0.0002                              # one small step of time, in seconds
run_time = 1.0
damping = 2 * sqrt(spring_k * mass)      # just enough friction that the mass settles without bouncing
drawn_scale = 20                         # the shift is tiny, so the picture draws it 20 times larger

# The picture is drawn as if you were riding along with the phone, so the box stays still.
scene.background = vector(0.93, 0.94, 0.96)
scene.width = 600
scene.height = 300
scene.center = vector(0, 0.005, 0)
scene.range = 0.09
wall_color = vector(0.2, 0.2, 0.25)
box(pos=vector(0, 0.04, 0), size=vector(0.21, 0.006, 0.03), color=wall_color)
box(pos=vector(0, -0.04, 0), size=vector(0.21, 0.006, 0.03), color=wall_color)
box(pos=vector(-0.102, 0, 0), size=vector(0.006, 0.086, 0.03), color=wall_color)
box(pos=vector(0.102, 0, 0), size=vector(0.006, 0.086, 0.03), color=wall_color)
rest_x = 0.03                            # where the mass sits when the phone is not accelerating
box(pos=vector(rest_x, -0.03, 0), size=vector(0.001, 0.014, 0.001), color=color.gray(0.5))    # marks that resting place
block = box(pos=vector(rest_x, 0, 0), size=vector(0.02, 0.02, 0.02), color=vector(0.8, 0.3, 0.1))
spring = helix(pos=vector(0.099, 0, 0), axis=vector(rest_x + 0.01 - 0.099, 0, 0), radius=0.006, coils=10, thickness=0.0015, color=color.gray(0.4))
arrow(pos=vector(-0.04, 0.055, 0), axis=vector(0.08, 0, 0), color=color.red, shaftwidth=0.006)
label(pos=vector(0, 0.07, 0), text="phone accelerates", height=16, box=False, opacity=0, color=color.black)
label(pos=vector(0.065, -0.06, 0), text="drawn " + str(drawn_scale) + "x larger", height=13, box=False, opacity=0, color=color.gray(0.4))
readout = label(pos=vector(-0.04, -0.06, 0), text="", height=18, box=False, opacity=0, color=color.black)

gr = graph(title="How far the mass has shifted", xtitle="time (s)", ytitle="shift (mm)", width=600, height=260, fast=False)
shift_c = gcurve(color=color.blue, label="shift")

shift = 0             # how far the mass has fallen behind its resting place, in meters
shift_speed = 0
settled = False
t = 0
shift_c.plot(0, 0)
while t < run_time - dt / 2:
    rate(50)                          # one drawn frame...
    shift_before = shift
    for i in range(20):               # ...carries twenty small steps
        # the stretched spring pulls the mass forward; the damping slows any motion inside the phone
        spring_force = spring_k * shift + damping * shift_speed
        # the mass falls behind while its own acceleration is less than the phone's
        shift_speed = shift_speed + (phone_acceleration - spring_force / mass) * dt
        shift = shift + shift_speed * dt
        t = t + dt
    # settled = the shift has stopped changing
    if t > 0.02 and abs(shift - shift_before) < 0.00001 * abs(shift):
        settled = True
    drawn_x = max(rest_x - drawn_scale * shift, -0.088)
    block.pos.x = drawn_x
    spring.axis = vector(drawn_x + 0.01 - 0.099, 0, 0)
    shift_c.plot(t, 1000 * shift)
    if settled:
        readout.text = "settled shift = " + str(round(1000 * shift, 2)) + " mm"
    else:
        readout.text = "shift = " + str(round(1000 * shift, 2)) + " mm"

print("RESULT shift_mm=" + str(round(1000 * shift, 3)))
