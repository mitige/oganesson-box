# Oganesson Box

**Electron** desktop application that visualizes **oganesson**
atoms (Og, element 118) interacting inside a translucent glass box.
The atoms are **glowing red**, and their interaction physics is computed in
real time.

![preview](https://via.placeholder.com/800x200/06030a/ff2a2a?text=Oganesson+Box)

## Features

* **Real-time 3D rendering** with Three.js
* **Red emissive atoms** with a luminous halo using additive sprites
* **Bloom post-processing** with UnrealBloomPass for a neon glow effect
* **Interaction physics**: softened Lennard-Jones potential
  with strong repulsion and weak attraction, typical of a noble gas
* **Translucent glass box** using MeshPhysicalMaterial with transmission
* **Floating atmospheric dust** for extra ambience
* **Thermostat**: controllable thermal agitation
* **Red glassmorphism UI**, controlled with sliders:

  * Number of atoms
  * Temperature/agitation
  * Interaction strength
  * Glow intensity/bloom
  * Automatic camera rotation
* **Orbital camera**: drag to rotate, scroll to zoom

## Installation

```bash
cd oganesson-box
npm install
npm start
```

> Three.js is loaded via CDN using an import map: an internet connection is
> required on first launch. See the offline section below.

## Usage

| Control                    | Action                |
| -------------------------- | --------------------- |
| Mouse drag                 | Orbit around the box  |
| Mouse wheel                | Zoom                  |
| Sliders in the right panel | Adjust the simulation |
| Reset                      | Regenerate the atoms  |

## Technical Details

### Interaction Potential

A softened **Lennard-Jones** potential is used:

$$F = \frac{24\varepsilon}{r}\left[2\left(\frac{\sigma}{r}\right)^{13} - \left(\frac{\sigma}{r}\right)^{7}\right]$$

With a cut-off at `2.5σ` and an increased repulsion factor to make the
“noble gas” behavior visually noticeable. Og is theoretically a noble gas,
although it is predicted to be more reactive than the others.

### Numerical Stability

* Time substeps
* Force and velocity clamping
* Light global damping
* Elastic collisions with restitution `0.9` on all 6 walls

## 🔧 Offline Mode Optional

To run without an internet connection, download Three.js locally and replace
the import map in `index.html`:

```html
<script type="importmap">
{
  "imports": {
    "three": "./vendor/three.module.js",
    "three/addons/": "./vendor/jsm/"
  }
}
</script>
```

## Structure

```
oganesson-box/
├── package.json      # Electron manifest
├── main.js           # Electron main process
├── index.html        # UI + glassmorphism CSS
├── renderer.js       # 3D engine + physics
└── README.md
```

---
