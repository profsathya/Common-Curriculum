Web VPython 3.2
# Two bike lamps on one battery pack: how long do they stay lit?

# ---- Setup: runs once ----
voltage = 6            # volts: the battery pack
R1 = 12                # ohms: the front lamp
R2 = 12                # ohms: the rear lamp
wiring = "series"      # "series" is one after the other, "parallel" is side by side
energy = 12 * 60       # watt-minutes: a 12 watt-hour pack
dt = 1                 # minutes between steps
t = 0                  # minutes since the lamps were switched on

# drawing, not part of the model
scene.width = 1
scene.height = 1
scene_anchor = box(visible=False)
energy_graph = graph(title="Energy left in the pack", xtitle="time (hours)", ytitle="energy left (watt-hours)", width=560, height=300, xmin=0, ymin=0, ymax=12)
energy_curve = gcurve(color=color.blue, width=2)
energy_curve.plot(0, energy / 60)

# ---- The loop: one pass for each minute ----
while energy > 0:
    if wiring == "series":
        current = voltage / (R1 + R2)
    else:
        current = voltage / R1 + voltage / R2
    power = voltage * current
    energy = energy - power * dt
    t = t + dt

    # drawing, not part of the model
    rate(200)
    energy_curve.plot(t / 60, energy / 60)

# drawing, not part of the model
scene.caption = 'RESULT: the lamps stayed lit for ' + t.toFixed(0) + ' minutes (' + (t / 60).toFixed(1) + ' hours). Current from the pack ' + current.toFixed(2) + ' A, power ' + power.toFixed(1) + ' W.'
