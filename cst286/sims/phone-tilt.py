Web VPython 3.2
# How your phone knows which way is up  -  CST286 Explore Physics Loop
# The stage cards on the course page tell you which line to change.
# Lines marked  # <-- change this  are the ones to edit. The Reset button brings this original back.

shake = 0           # how hard the phone is being shaken, in m/s^2. Try 0, 3, 8            # <-- change this
gyro_drift = 0.5    # a tiny built-in error in the gyroscope, degrees per second. Try 0, 2  # <-- change this
trust_gyro = 0.0    # 0 = believe the accelerometer only, 1 = gyroscope only, 0.98 = what real phones do   # <-- change this

g = 9.8
dt = 0.01

scene.title = "The phone tilts to 40 degrees over 4 s, holds for 4 s, then comes back. Solid = truth. Ghost = what the phone believes."
phone = box(size=vector(0.7, 1.4, 0.08), color=vector(0.2, 0.2, 0.25))
ghost = box(size=vector(0.7, 1.4, 0.08), color=color.cyan, opacity=0.35)

gr = graph(title="Tilt: the truth and three ways of measuring it", xtitle="time (s)", ytitle="tilt (degrees)", width=600, height=260)
true_c = gcurve(color=color.black, label="true tilt")
acc_c = gcurve(color=color.red, label="accelerometer alone")
gyro_c = gcurve(color=color.blue, label="gyroscope alone")
mix_c = gcurve(color=color.green, label="the phone's blend")

def set_tilt(obj, deg):
    a = radians(deg)
    obj.axis = 0.7 * vector(cos(a), -sin(a), 0)
    obj.up = vector(sin(a), cos(a), 0)

tilt_gyro = 0
tilt_mix = 0
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
    set_tilt(phone, true_tilt)
    set_tilt(ghost, tilt_mix)
    true_c.plot(t, true_tilt)
    acc_c.plot(t, tilt_acc)
    gyro_c.plot(t, tilt_gyro)
    mix_c.plot(t, tilt_mix)

print("At the end the true tilt is 0. Accelerometer says", round(tilt_acc, 1), ", gyroscope says", round(tilt_gyro, 1), ", the blend says", round(tilt_mix, 1))
