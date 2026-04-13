# Codexion Visual Replayer - Implementation Roadmap

## Milestone 1: Project Setup 
- [x] Initialize Vite + React (TypeScript).
- [x] Install dependencies (`framer-motion`, `lucide-react`, `zustand`, `zod`).
- [x] Establish directory structure (`components/`, `hooks/`, `store/`, `utils/`).

## Milestone 2: Log Parsing & Simulation State 
- [x] Create `useLogStore` for managing simulation data and current timestamp.
- [x] Implement `Parser` for validating and indexing JSON-per-line logs.
- [x] Create a `SnapshotGenerator` that calculates the state of all coders/dongles for any given `ts`.

## Milestone 3: Core Hub Visualization 
- [x] Implement `CircularHub` SVG container.
- [x] Create `CoderNode` with radial burnout bars using Framer Motion.
- [x] Create `DongleNode` with SVG USB icons and ownership indicators.
- [x] Implement ownership lines between coders and dongles.

## Milestone 4: Timeline & Animation
- [x] Build `TimelineSlider` with millisecond scrubbing.
- [x] Implement `PlaybackEngine` (requestAnimationFrame) to advance `ts` based on speed.
- [x] Add state icons for "Compiling," "Debugging," and "Refactoring."

## Milestone 5: Advanced Features & Polish 
- [x] Implement `HeapViewer` sidebar for real-time dongle queue inspection.
- [x] Add "Simulation Events" log sidebar.
- [x] Visual polish: Glow effects, color transitions, and responsive scaling.
