Web VPython 3.2
# How a plane stays up  -  CST286 Explore Physics Loop
# The stage cards on the course page tell you which line to change.
# Lines marked  # <-- change this  are the ones to edit. Reload the page to reset.

speed = 60          # airspeed in m/s. A small plane cruises near 60              # <-- change this
angle = 5           # angle of attack in degrees. Try 0, 5, 10, 20                # <-- change this
mass = 1000         # kg, a light aircraft                                        # <-- change this

wing_area = 16      # square metres
rho = 1.2           # air density
stall_angle = 15    # degrees. Past this the air stops following the wing and lift collapses
g = 9.8

def lift_coefficient(a_deg):
    # how much lift a wing makes, per unit of speed squared and wing area
    if a_deg <= stall_angle:
        return 2 * pi * radians(a_deg)                     # lift grows in a straight line with angle
    return 2 * pi * radians(stall_angle) * 0.35            # stalled: most of the lift is gone

scene.title = "A wing flying to the right. Yellow arrow = lift, red arrow = weight. Height starts at 100 m."
scene.camera.pos = vector(0, 100, 60)
scene.camera.axis = vector(0, 0, -60)
plane = box(pos=vector(0, 100, 0), size=vector(8, 0.4, 12), color=color.white)
body = cylinder(pos=vector(-4, 100, 0), axis=vector(10, 0, 0), radius=0.6, color=vector(0.7, 0.7, 0.75))
lift_arrow = arrow(pos=plane.pos, axis=vector(0, 0, 0), color=color.yellow, shaftwidth=0.6)
weight_arrow = arrow(pos=plane.pos, axis=vector(0, 0, 0), color=color.red, shaftwidth=0.6)

g1 = graph(title="Height of the plane", xtitle="time (s)", ytitle="height (m)", width=600, height=220)
height = gcurve(color=color.blue)
g2 = graph(title="Lift versus weight", xtitle="time (s)", ytitle="force (N)", width=600, height=220)
lift_c = gcurve(color=color.orange, label="lift")
weight_c = gcurve(color=color.red, label="weight")

vy = 0
t = 0
dt = 0.02
while t < 30 and plane.pos.y > 0:
    rate(50)
    effective_angle = angle - degrees(atan(vy / speed))            # climbing meets the air more head-on, so the working angle drops
    lift = 0.5 * rho * speed**2 * wing_area * lift_coefficient(effective_angle)
    weight = mass * g
    vy = vy + ((lift - weight) / mass) * dt                        # F = m a in the vertical direction only
    plane.pos = plane.pos + vector(speed * dt, vy * dt, 0)
    body.pos = plane.pos - vector(4, 0, 0)
    scene.camera.pos = plane.pos + vector(0, 0, 60)
    lift_arrow.pos = plane.pos
    lift_arrow.axis = vector(0, lift / 1000, 0)
    weight_arrow.pos = plane.pos
    weight_arrow.axis = vector(0, -weight / 1000, 0)
    height.plot(t, plane.pos.y)
    lift_c.plot(t, lift)
    weight_c.plot(t, weight)
    t = t + dt

print("After", round(t, 1), "s: height", round(plane.pos.y, 1), "m, climbing at", round(vy, 2), "m/s")
