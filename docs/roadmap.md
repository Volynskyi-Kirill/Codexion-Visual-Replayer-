# Codexion Visual Replayer - Implementation Roadmap

## Milestone 1: Project Setup 
- [x] Initialize Vite + React (TypeScript).
- [x] Install dependencies (`framer-motion`, `lucide-react`, `zustand`, `zod`).
- [x] Establish directory structure (`components/`, `hooks/`, `store/`, `utils/`).

## Milestone 2: Log Parsing & Simulation State 
- [ ] Create `useLogStore` for managing simulation data and current timestamp.
- [ ] Implement `Parser` for validating and indexing JSON-per-line logs.
- [ ] Create a `SnapshotGenerator` that calculates the state of all coders/dongles for any given `ts`.

## Milestone 3: Core Hub Visualization 
- [ ] Implement `CircularHub` SVG container.
- [ ] Create `CoderNode` with radial burnout bars using Framer Motion.
- [ ] Create `DongleNode` with SVG USB icons and ownership indicators.
- [ ] Implement ownership lines between coders and dongles.

## Milestone 4: Timeline & Animation
- [ ] Build `TimelineSlider` with millisecond scrubbing.
- [ ] Implement `PlaybackEngine` (requestAnimationFrame) to advance `ts` based on speed.
- [ ] Add state icons for "Compiling," "Debugging," and "Refactoring."

## Milestone 5: Advanced Features & Polish 
- [ ] Implement `HeapViewer` sidebar for real-time dongle queue inspection.
- [ ] Add "Simulation Events" log sidebar.
- [ ] Visual polish: Glow effects, color transitions, and responsive scaling.
