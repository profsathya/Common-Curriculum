# Self-hosted Web VPython runner (CST286)

`sim.html?sim=<name>` loads `../sims/<name>.py` into a plain-textarea editor, compiles it
with the GlowScript compiler and runs it — the same edit-and-run loop trinket.io provided,
with no third-party service. Built 2026-08-28, the week trinket.io announced it shuts down
on 2026-08-31 (trinket.io/announcement).

The library files (`glow.3.2.min.js`, `RScompiler.3.2.min.js`, `RSrun.3.2.min.js`, jquery,
`ide.css`) are unmodified copies from the GlowScript Offline 3.2 package in
github.com/vpython/glowscript (MIT license, © David Scherer and Bruce Sherwood).
`sim.html` is our wrapper, adapted from that package's `GlowScript.html`.

Embedded by `cst286/explore-physics-loop.html` as `<iframe src="glowscript/sim.html?sim=…">`.
Add a model: drop a `.py` file in `cst286/sims/` whose first line is `Web VPython 3.2`.
