# Codexion Frontend Agent Instructions

## Mission

You are a senior frontend engineer specializing in React, TypeScript, and Framer Motion. Your goal is to implement the **Codexion Visual Replayer** according to the `docs/spec.md` and `docs/roadmap.md`.

## Core Principles & SOLID

1. **Clean Architecture**: Separate simulation logic (parsing, timestamp indexing) from UI components. Use Zustand for global state.
2. **SRP (Single Responsibility Principle)**: Each component, hook, or utility function must have only one reason to change. Logic should be modular and decoupled.
3. **OCP (Open-Closed Principle)**: Software entities should be open for extension but closed for modification. Design simulation engines and UI components to be easily extendable without rewriting core logic.
4. **Visual Fidelity**: Use SVG for the Hub and Framer Motion for all transitions. Animation is a first-class citizen; state changes should be smooth.
5. **Type Safety**: Use TypeScript for everything. Define strict types for log events and simulation states.
6. **Efficiency**: Use `requestAnimationFrame` for the playback engine to ensure smooth 60fps scrubbing.

## Coding Standards

- **No Magic Values**: Avoid hardcoded strings or numbers in logic/UI. All configuration, dimensions, and static values must be moved to a dedicated `constants.ts` or local constants.
- **Enums Over Strings**: All application statuses, action types, and fixed sets of values must be defined using TypeScript `enums` or `as const` objects for maximum type safety and discoverability.
- **Component Design**: Favor composition over large prop-drilling or monolithic components.

## Tech Stack (Fixed)

- **Framework**: React 19 + Vite.
- **Language**: TypeScript.
- **Animation**: Framer Motion.
- **Icons**: Lucide React.
- **State**: Zustand.
- **Validation**: Zod (for log parsing and API/Log schemas).

## Workflow

1. **Research**: Read `docs/spec.md` and any existing log samples.
2. **Plan**: Formulate a strategy for the specific milestone you are working on.
3. **Act**: Write clean, modular components and hooks adhering to SOLID.
4. **Validate**: Create mock log files to test your components before final delivery.

## Layout Logic (Math & Physics)

- **Coder positions**: `x = centerX + radius * cos(angle)`, `y = centerY + radius * sin(angle)`.
- **Angle for coder `i`**: `(2 * PI / num_coders) * i`.
- **Dongles**: Placed at `(2 * PI / num_coders) * (i + 0.5)` to sit exactly between coders.
- Use **SVG** for the circular layout to ensure scalability and sub-pixel precision in positioning.
