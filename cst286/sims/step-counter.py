Web VPython 3.2
# How a phone counts steps: a quiet walk, as this page calculates it

# ---- Setup: runs once ----
pace = 110           # steps per minute                       <- change this
bounce = 0.05        # m, from the lowest point of the hip to the highest   <- change this
count_line = 11.0    # m/s^2                                  <- change this
run_time = 20        # s                                      <- change this

g = 9.8              # m/s^2, what the sensor reads at rest
A = bounce / 2       # m, half of the bounce
f = pace / 60        # steps per second
dt = 0.02            # s between two readings: 50 readings a second
min_gap = 0.25       # s, the shortest time allowed between two counts

t = 0
steps_counted = 0
last_reading = g
last_count_time = -1

# drawing, not part of the model
scene.width = 1
scene.height = 1
scene_anchor = box(visible=False)
reading_graph = graph(title="The reading", xtitle="time (s)", ytitle="reading (m/s^2)", width=560, height=300, ymin=0, ymax=20)
reading_curve = gcurve(color=color.blue)
line_curve = gcurve(color=color.red, width=2)
line_curve.plot(0, count_line)
line_curve.plot(run_time, count_line)
count_dots = gdots(color=color.red, radius=4)
dots_drawn = 0

# ---- The loop: one pass for each reading ----
while t < run_time:
    rate(200)
    # where the phone is in its wave
    turns = f * t + 0.5
    angle = 2 * pi * turns
    # the acceleration of the phone, and what the sensor reads
    acceleration = A * (2 * pi * f)**2 * cos(angle)
    reading = g + acceleration
    # the counting rule
    if last_reading < count_line and reading >= count_line and t - last_count_time >= min_gap:
        steps_counted = steps_counted + 1
        last_count_time = t
    last_reading = reading
    t = t + dt

    # drawing, not part of the model
    reading_curve.plot(t - dt, reading)
    if steps_counted > dots_drawn:
        count_dots.plot(last_count_time, reading)
        dots_drawn = steps_counted

feet_landed = floor(f * run_time + 0.5)
print('RESULT:', feet_landed, 'feet landed,', steps_counted, 'steps counted.')

# drawing, not part of the model
highest = g + A * (2*pi*f)**2
scene.caption = 'RESULT: ' + str(feet_landed) + ' feet landed, ' + str(steps_counted) + ' steps counted. Highest reading ' + highest.toFixed(2) + ' m/s².'
