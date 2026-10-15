# SIDE // B — Interactive 3D Audio Experience

A high-prestige, atmospheric 3D disc carousel and audio player engineered with sub-pixel spring physics, real-time vinyl shaders, and minimalist audio controls.

---

## ⚡ Highlights & Cool Stuff

- **Sub-Pixel 3D Spring Physics**: Custom semi-implicit Euler integration engine running at a rock-solid 60 FPS, calculating depth, yaw, tilt, and angular roll in real time.
- **Dynamic 3D Disc Shading**: Conic glint reflections, specular highlights, radial vinyl micro-grooves, and analog film grain textures mapped directly onto circular geometries.
- **Synchronized Playback Spin**: Active vinyl disc smoothly rotates with continuous angular velocity while music plays, immediately pausing on drag or pause states.
- **Debounced Audio Pipeline**: Zero-stutter track transitions decoupling heavy MP3 metadata decoding from the 60 FPS rendering thread.
- **Deep Dark Luxury UI**: Dark mode palette (`#060608`), hairline borders (`rgba(255,255,255,0.08)`), and deep glassmorphic dropdowns (`backdrop-filter: blur(28px)`).
- **Whisper-Quiet Progress Rail**: Ultra-minimal progress bar with instantaneous click-to-seek, track counters, and micro-typography.
- **Fluid Gesture & Touch Support**: Inertia-based momentum flicking, pointer capture, mouse hover tilt tracking, and touch swipe gestures.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 8](https://vite.dev/) (Oxidation / Rolldown fast path) |
| **Styling & Shaders** | [Tailwind CSS v4](https://tailwindcss.com/) + Pure CSS 3D Matrix Transforms |
| **Audio Engine** | Native HTML5 Audio API with debounced pipeline management |
| **Typography** | *Instrument Serif*, *Oswald*, *Inter*, and JetBrains Mono |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🏎️ Engineering & Performance Architecture

1. **Direct DOM Mutation in RAF**: Animation loops bypass React's virtual DOM reconciliation during motion, writing transforms and CSS variables directly to slide elements via `requestAnimationFrame`.
2. **Hardware Layer Optimization**: Avoided composite layer explosion and off-screen blend mode readbacks by utilizing GPU-instanced 3D transforms (`translate3d`, `rotateY`, `rotateX`) with standard alpha compositing.
3. **Decoupled Spring State**: External React state changes and internal pointer drag springs are coordinated via ref-based locks (`prevIndexRef`) so the carousel never fights user input.
4. **Pre-Decoded Texture Pipeline**: All vinyl cover assets utilize eager image decoding into VRAM to ensure zero hitching when entering viewport depth.

---

## 🎮 Controls & Interaction

- **Click Active Disc**: Play / Pause audio
- **Click Adjacent Disc**: Smooth spring slide to focus
- **Drag / Swipe**: Natural physics flick with release inertia
- **Spacebar**: Global Play / Pause toggle
- **Arrow Keys**: Step previous (`←` / `↑`) or next (`→` / `↓`)
- **Tracklist Menu**: Instant jump to any record in the catalog

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/5aled-jpeg/music-playlist.git

# Navigate into project directory
cd music-playlist

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
