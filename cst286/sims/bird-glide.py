Web VPython 3.2
# How a bird glides without flapping  -  the whole flight in one program
# The bird leaves a 30 m cliff and does not flap. A buoy floats 370 m from the cliff.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

nose = 3            # degrees the nose points above level. Try -5, 0, 6, 12             # <-- change this
mass = 1.0          # kg                                                               # <-- change this
launch_speed = 10   # m/s, level, as the bird leaves the cliff                         # <-- change this
dt = 0.01           # s, the length of one time step                                   # <-- change this

# --- set up the bird and the air ------------------------------------------
g = 9.8             # m/s^2
rho = 1.2           # air density, kg/m^3
wing_area = 0.20    # m^2

def lift_coefficient(wing_tilt):
    # grows by 0.1 for each degree the wing is tilted into the oncoming air, up to 15 degrees
    if wing_tilt > 15:
        return max(0, 1.5 - 0.08 * (wing_tilt - 15))        # stalled: the lift falls
    if wing_tilt < -5:
        return -0.5
    return 0.1 * wing_tilt

def drag_coefficient(wing_tilt, CL):
    CD = 0.03 + 0.05 * CL**2                                # pushing through the air + the price of making lift
    if wing_tilt > 15:
        CD = CD + 0.025 * (wing_tilt - 15)                  # stalled: extra drag
    return CD

scene.width = 560
scene.height = 300
scene.background = vector(0.61, 0.78, 0.9)
sea = box(pos=vector(1000, -1, 0), size=vector(2400, 2, 80), color=vector(0.17, 0.43, 0.56))
cliff = box(pos=vector(-15, 15, 0), size=vector(30, 30, 80), color=vector(0.36, 0.29, 0.24))
buoy = cylinder(pos=vector(370, 0, 0), axis=vector(0, 5, 0), radius=1, color=color.red)
bird = sphere(pos=vector(0, 30, 0), radius=0.9, color=color.white, make_trail=True, trail_color=color.white)
bird.velocity = vector(launch_speed, 0, 0)
lift_arrow = arrow(pos=bird.pos, axis=vector(0, 0, 0), color=vector(0.25, 0.83, 0.76), shaftwidth=0.4)
drag_arrow = arrow(pos=bird.pos, axis=vector(0, 0, 0), color=vector(1, 0.7, 0.28), shaftwidth=0.4)
weight_arrow = arrow(pos=bird.pos, axis=vector(0, 0, 0), color=vector(0.73, 0.59, 1), shaftwidth=0.4)
g1 = graph(title="The path of the bird", xtitle="distance from the cliff (m)", ytitle="height (m)", width=560, height=220)
path_curve = gcurve(color=color.blue)

t = 0
step = 0
stalled = False
while bird.pos.y > 0 and t < 300:
    rate(2 / dt)                # play the flight at twice real speed

    # --- 1. find the lift --------------------------------------------------
    speed = mag(bird.velocity)
    path_angle = degrees(atan2(bird.velocity.y, bird.velocity.x))
    wing_tilt = nose - path_angle
    CL = lift_coefficient(wing_tilt)
    lift = 0.5 * rho * speed**2 * wing_area * CL

    # --- 2. find the drag, give each force its direction, and add them ------
    CD = drag_coefficient(wing_tilt, CL)
    drag = 0.5 * rho * speed**2 * wing_area * CD
    along = hat(bird.velocity)
    across = vector(-along.y, along.x, 0)
    F_net = lift * across - drag * along + vector(0, -mass * g, 0)

    # --- 3. take one time step ---------------------------------------------
    a = F_net / mass
    bird.velocity = bird.velocity + a * dt
    bird.pos = bird.pos + bird.velocity * dt
    t = t + dt

    # --- draw this instant (nothing below changes the flight) --------------
    if wing_tilt > 15:
        stalled = True
    step = step + 1
    lift_arrow.pos = bird.pos
    lift_arrow.axis = lift * across
    drag_arrow.pos = bird.pos
    drag_arrow.axis = -drag * along * 4
    weight_arrow.pos = bird.pos
    weight_arrow.axis = vector(0, -mass * g, 0)
    scene.camera.pos = vector(bird.pos.x + 8, max(bird.pos.y, 12), 60)
    scene.camera.axis = vector(0, 0, -60)
    if step % 10 == 0:
        path_curve.plot(bird.pos.x, bird.pos.y)

if bird.pos.y <= 0:
    landed = "landed " + str(round(bird.pos.x)) + " m from the cliff after " + str(round(t, 1)) + " s"
else:
    landed = "still in the air after " + str(round(t)) + " s, " + str(round(bird.pos.x)) + " m from the cliff"
scene.caption = ("RESULT: " + landed + (", past the buoy" if bird.pos.x > 370 else "") + ". " +
    ("The wing stalled during this flight. " if stalled else "The wing never stalled. ") +
    "(nose " + str(nose) + " degrees, mass " + str(mass) + " kg, launch speed " + str(launch_speed) + " m/s, dt " + str(dt) + " s)\n" +
    "Arrows: lift is teal, weight is purple, drag is orange and drawn 4 times longer so that you can see it.")
