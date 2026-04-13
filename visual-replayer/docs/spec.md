# Codexion Visual Replayer - Frontend Specification

## Overview
A high-performance, web-based visualization tool for the Codexion multi-threading simulation. It allows users to upload simulation logs and scrub through the timeline to analyze resource contention, scheduling fairness, and burnout conditions.

## Log Format (JSON-per-line)
The replayer expects a `.txt` or `.log` file where each line is a JSON object.

### Event Types:
1. **INITIALIZE**: Simulation metadata.
   - `{"status": "INITIALIZE", "num_coders": 5, "time_to_burnout": 2000, ...}`
2. **REQUEST_DONGLE**: Coder enters a queue.
   - `{"ts": 100, "status": "REQUEST_DONGLE", "coder_id": 1, "dongle_id": 1, "queue": [1, 2], "priorities": [100, 150]}`
3. **TAKE_DONGLE**: Coder acquires a dongle.
   - `{"ts": 150, "status": "TAKE_DONGLE", "coder_id": 1, "dongle_id": 1, "queue": [2], "priorities": [150]}`
4. **START_COMPILE / START_DEBUG / START_REFACTOR**: State transitions.
   - `{"ts": 200, "status": "START_COMPILE", "coder_id": 1, "details": {"compiles_done": 1, "deadline": 2200}}`
5. **RELEASE_DONGLE**: Coder frees a dongle (starts cooldown).
   - `{"ts": 400, "status": "RELEASE_DONGLE", "coder_id": 1, "dongle_id": 1}`
6. **BURNOUT**: Simulation failure.
   - `{"ts": 1200, "status": "BURNOUT", "coder_id": 3}`
7. **SUCCESS**: Simulation completion.
   - `{"ts": 2500, "status": "SUCCESS"}`

## UI/UX Requirements
- **Circular Hub**:
  - Center: "Quantum Compiler" visual.
  - Ring: Coders arranged at `(360 / num_coders) * i` degrees.
  - Periphery: Dongles placed between coders.
- **Visual States**:
  - **Burnout Bar**: Radial progress bar around each coder representing `deadline - current_ts`.
  - **Dongle Cooldown**: Semi-transparent overlay on dongles with a countdown or progress arc.
  - **Connections**: SVG lines between coders and the dongles they currently hold.
- **Controls**:
  - Drag-and-drop log uploader.
  - Play/Pause and Speed (0.5x to 10x).
  - Millisecond-precise scrubbing.

## Technical Stack
- **Framework**: React 19 (TypeScript).
- **Build Tool**: Vite.
- **Animation**: Framer Motion.
- **Styles**: Vanilla CSS (CSS Modules preferred).
- **State**: Zustand (for timeline and log data).
- **Geometry**: Polar-to-Cartesian conversion for circular layouts.
