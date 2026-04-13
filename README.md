# Codexion Visualizer

A real-time, multi-threaded concurrency simulation visualizer. This project models a shared workspace where multiple coders compete for limited USB dongles to compile code, demonstrating core concurrent programming concepts (mutexes, condition variables, scheduling policies like FIFO/EDF).

The system consists of a high-performance **C simulation binary**, a **Go backend** for process orchestration and WebSocket streaming, and a **React 19 frontend** for real-time visualization.

---

## Architecture

- **Simulation (`/coders`)**: Multi-threaded C application.
- **Backend (`/server`)**: Go (Gin) server that spawns simulation processes and streams JSON logs via WebSockets.
- **Frontend (`/visual-replayer`)**: React dashboard using Framer Motion for smooth animations and Zustand for state management.

---

## Deployment Guide (Production)

The easiest way to deploy the full stack is using **Docker Compose**.

### 1. Prerequisites
- Docker and Docker Compose installed on the target machine.

### 2. Configuration
Copy the template environment file to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to match your production environment:
- `PORT`: The internal port for the Go backend (default `3000`).
- `CLIENT_HOST`: The domain or IP from which users will access the site (used for CORS).
- `LOGS_DIR`: Path where simulation logs and analytics will be persisted.

### 3. Launch
Build and start the containers in detached mode:
```bash
docker-compose up -d --build
```

The application will be available at:
- **Frontend**: `http://your-server-ip` (Port 80)
- **Backend API**: `http://your-server-ip:3000` (or your custom `PORT`)

---

## Local Development

### Backend (Go + C)
1. Navigate to the server directory: `cd server`
2. Build the C binary: `make build` (this copies the binary from `../coders` to `server/`)
3. Run the Go server: `go run cmd/server/main.go` or `make run`

### Frontend (React)
1. Navigate to the frontend directory: `cd visual-replayer`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make sure your `.env` has `VITE_API_BASE_URL=http://localhost:3000`.

---

## Features

- **Live Mode**: Watch the simulation unfold in real-time as the C binary executes.
- **Replay & Scrubbing**: Once a simulation is finished, you can replay it, change speed (0.5x to 10x), and scrub the timeline.
- **Visual Analytics**:
    - **Burnout Timers**: Real-time countdowns for each coder node.
    - **Connection Lines**: Yellow for "Requesting", Green for "Acquired".
    - **Heap Viewer**: Real-time visualization of the dongle priority queues.
- **Scheduling Policies**: Toggle between FIFO and EDF (Earliest Deadline First) to see how they impact survival.

---

## Troubleshooting

- **C Binary Compilation**: If building without Docker, ensure you have `gcc` and `make` installed. The binary requires POSIX threads (`-pthread`).
- **WebSocket Issues**: Ensure your firewall allows traffic on both port 80 (frontend) and the backend port (default 3000).
- **Persistence**: Analytics data is stored in the volume mapped to `./server/logs`. Ensure the directory has appropriate write permissions.

---

## License
Created as part of the 42 curriculum.
