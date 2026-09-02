Web VPython 3.2
# Keep the arrow true  -  how your phone knows which way is up
# The green arrow is your phone's compass-style arrow. It should point straight up
# no matter how the phone tilts or shakes. The phone only knows its tilt from two
# imperfect sensors - your job is to keep the arrow within 3 degrees of the truth.
# Lines marked  # <-- change this  are yours. The Reset button brings this original back.

shake = 0           # how hard the phone is being shaken, in m/s^2. Try 3, 8, 12            # <-- change this
gyro_drift = 0.5    # a tiny built-in error in the gyroscope, degrees per second. Try 2, 20  # <-- change this
trust_gyro = 0.0    # 0 = believe the accelerometer only, 1 = gyroscope only. Try 0.9, 0.98  # <-- change this

g = 9.8
dt = 0.01
win_limit = 3       # the arrow must stay within this many degrees of true up

scene.background = vector(0.93, 0.94, 0.96)
scene.range = 2.0
phone = box(size=vector(0.7, 1.4, 0.08), color=vector(0.2, 0.2, 0.25))
screen = box(size=vector(0.6, 1.25, 0.02), pos=vector(0, 0, 0.05), color=vector(0.85, 0.9, 0.95))
arrow_up = arrow(pos=vector(0, -0.4, 0.09), axis=vector(0, 0.8, 0), color=color.green, shaftwidth=0.07)
truth_mark = arrow(pos=vector(0, 0.95, 0), axis=vector(0, 0.35, 0), color=color.gray(0.5), shaftwidth=0.03)
banner = label(pos=vector(0, 1.62, 0), text="", height=22, box=False, opacity=0, color=color.yellow, visible=False)

gr = graph(title="Tilt: the truth and three ways of measuring it", xtitle="time (s)", ytitle="tilt (degrees)", width=600, height=260, fast=False)
true_c = gcurve(color=color.black, label="true tilt")
acc_c = gcurve(color=color.red, label="accelerometer alone")
gyro_c = gcurve(color=color.blue, label="gyroscope alone")
mix_c = gcurve(color=color.green, label="the phone's blend")

def tilt_things(deg, err_deg):
    # the phone follows the TRUE tilt; the screen arrow is placed using the phone's
    # ESTIMATE, so it misses true up by exactly the estimate's error
    a = radians(deg)
    phone.axis = 0.7 * vector(cos(a), -sin(a), 0)
    phone.up = vector(sin(a), cos(a), 0)
    screen.axis = 0.6 * vector(cos(a), -sin(a), 0)
    screen.up = vector(sin(a), cos(a), 0)
    e = radians(err_deg)
    arrow_up.axis = 0.8 * vector(sin(e), cos(e), 0)

tilt_gyro = 0
tilt_mix = 0
max_err = 0
worst_t = 0
t = 0
while t < 12:
    rate(25)                          # one drawn frame...
    for i in range(4):                # ...carries four small steps
        if t < 4:
            true_tilt = 10 * t
            true_rate = 10
        elif t < 8:
            true_tilt = 40
            true_rate = 0
        else:
            true_tilt = 40 - 10 * (t - 8)
            true_rate = -10
        # ACCELEROMETER: feels gravity split along the phone's two axes, plus any shaking
        a = radians(true_tilt)
        ax = g * sin(a) + shake * sin(40 * t)
        ay = g * cos(a) + shake * sin(53 * t)
        tilt_acc = degrees(atan2(ax, ay))                                  # the angle gravity seems to come from
        # GYROSCOPE: reports how fast the phone is turning; adding up rate x time gives the angle
        tilt_gyro = tilt_gyro + (true_rate + gyro_drift) * dt
        # THE BLEND a real phone uses: mostly the gyro for quick moves, a little accelerometer to stop the drift
        tilt_mix = trust_gyro * (tilt_mix + (true_rate + gyro_drift) * dt) + (1 - trust_gyro) * tilt_acc
        t = t + dt
    err = tilt_mix - true_tilt
    if abs(err) > max_err:
        max_err = abs(err)
        worst_t = t
    tilt_things(true_tilt, err)
    arrow_up.color = color.green if abs(err) <= win_limit else color.red
    true_c.plot(t, true_tilt)
    acc_c.plot(t, tilt_acc)
    gyro_c.plot(t, tilt_gyro)
    mix_c.plot(t, tilt_mix)

if max_err <= win_limit:
    banner.text = "ARROW HELD - biggest wobble " + str(round(max_err, 1)) + " deg"
    banner.color = color.green
else:
    banner.text = "ARROW LOST - up to " + str(round(max_err, 1)) + " deg off"
    banner.color = vector(0.8, 0.3, 0.1)
banner.visible = True
scene.caption = ("RESULT: " + banner.text + " - worst moment at t = " + str(round(worst_t, 1)) + " s\n" +
    "Measured at the end (true tilt 0): accelerometer says " + str(round(tilt_acc, 1)) + " deg, gyroscope says " + str(round(tilt_gyro, 1)) + " deg, the blend says " + str(round(tilt_mix, 1)) + " deg.")
