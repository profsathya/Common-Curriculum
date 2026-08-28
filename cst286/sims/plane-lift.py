Web VPython 3.2
# Clear the ridge  -  how a plane stays up
# A ridge crosses your path 600 m ahead, 135 m tall. You start at 100 m.
# Pick the tilt and the speed that carry you over it - and mind the stall.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

speed = 60          # airspeed in m/s (60 m/s is about 134 mph). Try 30, 70, 120     # <-- change this
angle = 5           # angle of attack in degrees. Try 3, 7, 14, 20                    # <-- change this
mass = 1000         # kg, a light aircraft. Try 3000                                  # <-- change this

# --- the physics numbers -------------------------------------------------
wing_area = 16      # square metres
rho = 1.2           # air density
stall_angle = 15    # degrees. Past this the air stops following the wing and lift collapses
g = 9.8
ridge_x = 600       # the ridge peak is this far ahead
ridge_top = 135     # and this tall; its faces start 40 m either side

def lift_coefficient(a_deg):
    # how much lift a wing makes, per unit of speed squared and wing area
    if a_deg <= stall_angle:
        return 2 * pi * radians(a_deg)                     # lift grows in a straight line with angle
    return 2 * pi * radians(stall_angle) * 0.35            # stalled: most of the lift is gone

def ridge_height(x):
    # the ridge face: rises to ridge_top at the peak, over the last 40 m each side
    if abs(x - ridge_x) < 40:
        return ridge_top * (1 - abs(x - ridge_x) / 40)
    return -1

# --- the world -----------------------------------------------------------
scene.background = vector(0.55, 0.75, 0.95)
ground = box(pos=vector(450, -1, 0), size=vector(1100, 2, 300), color=vector(0.35, 0.52, 0.3))
ridge = pyramid(pos=vector(ridge_x, 0, 0), size=vector(ridge_top, 80, 120), axis=vector(0, 1, 0), color=vector(0.45, 0.4, 0.35))
cylinder(pos=vector(ridge_x, ridge_top, 0), axis=vector(0, 6, 0), radius=1.2, color=vector(0.4, 0.28, 0.15))   # the tree on the peak
cone(pos=vector(ridge_x, ridge_top + 5, 0), axis=vector(0, 14, 0), radius=6, color=vector(0.15, 0.4, 0.2))
plane = box(pos=vector(0, 100, 0), size=vector(8, 0.5, 14), color=color.white)
body = cylinder(pos=vector(-5, 100, 0), axis=vector(11, 0, 0), radius=0.7, color=vector(0.75, 0.75, 0.8))
tail = box(pos=vector(-4.5, 101.5, 0), size=vector(2.5, 2.5, 0.3), color=color.white)
lift_arrow = arrow(pos=plane.pos, axis=vector(0, 0, 0), color=color.yellow, shaftwidth=1.2)
weight_arrow = arrow(pos=plane.pos, axis=vector(0, 0, 0), color=color.red, shaftwidth=1.2)
banner = label(pos=vector(0, 0, 0), text="", height=26, box=False, opacity=0, color=color.yellow, visible=False)

g1 = graph(title="Height of the plane (the ridge top is the gray line)", xtitle="time (s)", ytitle="height (m)", width=600, height=220)
height_c = gcurve(color=color.blue)
ridge_c = gcurve(color=color.gray(0.6))
g2 = graph(title="Lift versus weight", xtitle="time (s)", ytitle="force (N)", width=600, height=220)
lift_c = gcurve(color=color.orange, label="lift")
weight_c = gcurve(color=color.red, label="weight")

# --- the flight ----------------------------------------------------------
vy = 0
t = 0
dt = 0.02
result = ""
stalled = False
while result == "" and t < 30:
    rate(25)                          # one drawn frame...
    for i in range(2):                # ...carries two physics steps
        effective_angle = angle - degrees(atan(vy / speed))        # climbing meets the air more head-on, so the working angle drops
        if effective_angle > stall_angle:
            stalled = True
        lift = 0.5 * rho * speed**2 * wing_area * lift_coefficient(effective_angle)
        weight = mass * g
        vy = vy + ((lift - weight) / mass) * dt                    # F = m a in the vertical direction only
        plane.pos = plane.pos + vector(speed * dt, vy * dt, 0)
        t = t + dt
        if plane.pos.y <= 0:
            result = "STALLED and hit the ground" if stalled else "sank into the ground, " + str(round(ridge_x - plane.pos.x)) + " m short of the ridge"
        elif plane.pos.y < ridge_height(plane.pos.x):
            result = "CRASHED into the ridge, " + str(round(ridge_top - plane.pos.y)) + " m below the top"
        elif plane.pos.x > ridge_x + 45:
            result = "CLEARED the ridge with " + str(round(plane.pos.y - ridge_top, 1)) + " m to spare"
    body.pos = plane.pos - vector(5, 0, 0)
    tail.pos = plane.pos + vector(-4.5, 1.5, 0)
    scene.camera.pos = vector(plane.pos.x + 30, max(plane.pos.y, 60), 140)
    scene.camera.axis = vector(0, 0, -140)
    lift_arrow.pos = plane.pos
    lift_arrow.axis = vector(0, lift / 800, 0)
    weight_arrow.pos = plane.pos
    weight_arrow.axis = vector(0, -weight / 800, 0)
    height_c.plot(t, plane.pos.y)
    ridge_c.plot(t, ridge_top)
    lift_c.plot(t, lift)
    weight_c.plot(t, weight)

banner.pos = plane.pos + vector(0, 40, 0)
banner.text = result if result != "" else "still flying at " + str(round(plane.pos.y)) + " m"
banner.color = color.green if result.startswith("CLEARED") else color.yellow
banner.visible = True
print(result if result != "" else "Ran out of time still flying.")
print("Final height", round(plane.pos.y, 1), "m after", round(t, 1), "s, climbing at", round(vy, 2), "m/s.", "The wing stalled during this flight." if stalled else "The wing never stalled.")
