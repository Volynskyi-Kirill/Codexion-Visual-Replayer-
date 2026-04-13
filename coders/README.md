_This project has been created as part of the 42 curriculum by kvolynsk._

## Description

**Codexion** is a multi-threaded concurrency simulation that models a shared workspace where multiple coders compete for limited USB dongles to compile quantum code. The project demonstrates core concepts of concurrent programming: thread synchronization, mutual exclusion, fair resource allocation, and deadline-driven scheduling.

### Problem Overview

In a circular co-working hub, coders cycle through three phases: **compile** (holding two dongles), **debug** (non-critical), and **refactor** (non-critical). Key challenges:

- **Resource contention**: Each coder needs two dongles simultaneously to compile, but fewer dongles exist than coders.
- **Fairness under pressure**: A scheduler (FIFO or Earliest-Deadline-First) must arbitrate dongle access fairly.
- **Burnout management**: Coders have a deadline (time_to_burnout milliseconds). If they do not start compiling within this window, they burn out and the simulation ends.
- **Cooldown state**: Dongles become unavailable for a specified duration after release, increasing contention.

The simulation succeeds if all coders reach their compile quota before any burns out. It fails (and stops) on the first burnout.

### Learning Objectives

Master POSIX threading primitives and synchronization patterns:

- Implement thread-safe shared resource management with mutexes and condition variables.
- Build a priority queue for fair dongle scheduling.
- Detect and prevent deadlock and starvation.
- Achieve precise timing for deadline monitoring.
- Ensure log serialization under high concurrency.

---

## Instructions

### Build Prerequisites

- **OS**: Linux
- **Compiler**: `cc` (GCC or Clang)
- **Flags**: `-Wall -Wextra -Werror -pthread`
- **Standard**: C99 or later

### Compilation

From the `coders/` directory:

```bash
cd coders
make
```

This produces the executable `coders`.

To clean:

```bash
make clean       # Remove object files
make fclean      # Remove object files and binary
make re          # Full rebuild
```

### Running the Program

```bash
./codexion <number_of_coders> <time_to_burnout> <time_to_compile> <time_to_debug> \
         <time_to_refactor> <number_of_compiles_required> <dongle_cooldown> <scheduler>
```

### Argument Descriptions

All arguments are **mandatory** and must be non-negative integers:

| Argument                      | Type | Description                                                                                                                                                 |
| ----------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `number_of_coders`            | int  | Total coders (= number of dongles). Range: 1+. Arranges coders in a circle.                                                                                 |
| `time_to_burnout`             | int  | Milliseconds before burnout. If a coder doesn't start compiling within this window since simulation start or last compile start, it burns out. Must be > 0. |
| `time_to_compile`             | int  | Duration (ms) of compilation phase while holding two dongles. Must be > 0.                                                                                  |
| `time_to_debug`               | int  | Duration (ms) of debug phase (no dongle required). Must be > 0.                                                                                             |
| `time_to_refactor`            | int  | Duration (ms) of refactor phase (no dongle required). Must be > 0.                                                                                          |
| `number_of_compiles_required` | int  | Target number of compiles per coder. If all coders reach this, simulation succeeds and stops. Must be > 0.                                                  |
| `dongle_cooldown`             | int  | Duration (ms) after dongle release before it can be acquired again. Must be ≥ 0.                                                                            |
| `scheduler`                   | str  | Arbitration policy: `fifo` (First-In-First-Out) or `edf` (Earliest-Deadline-First). Case-sensitive.                                                         |

### Example Run Commands

**Small test** (2 coders, lenient timing):

```bash
./codexion 2 3000 300 300 300 2 100 fifo
```

Expected: Both coders compile at least 2 times before burnout.

**Normal run** (5 coders, moderate pressure):

```bash
./codexion 5 2500 400 300 400 3 150 edf
```

Expected: All 5 coders compile 3 times each; simulation completes without burnout.

**Stress test** (10 coders, tight deadline):

```bash
./codexion 10 1500 500 200 300 2 200 fifo
```

Expected: High contention; likely burnout due to tight deadline and resource scarcity.

### Invalid Input Handling

The program rejects and exits with an error message if:

- Any argument is negative.
- Any argument is not a valid integer.
- `scheduler` is neither `fifo` nor `edf`.
- `number_of_coders` is 0 or negative.

### Logging Output

The simulation prints all state changes in chronological order:

```
timestamp_ms X has taken a dongle
timestamp_ms X is compiling
timestamp_ms X is debugging
timestamp_ms X is refactoring
timestamp_ms X burned out
```

Where `timestamp_ms` is milliseconds elapsed since simulation start and `X` is the coder ID (1 to number_of_coders).

Example expected output (3 coders, successful completion):

```
0 1 has taken a dongle
1 1 has taken a dongle
1 1 is compiling
201 1 is debugging
401 1 is refactoring
405 2 has taken a dongle
406 2 has taken a dongle
406 2 is compiling
606 2 is debugging
806 2 is refactoring
900 3 has taken a dongle
902 3 has taken a dongle
902 3 is compiling
1102 3 is debugging
1302 3 is refactoring
```

---

## Resources

### POSIX Threading & Synchronization

- **man pages** (Linux):
    - `pthread_create(3)` – Thread creation.
    - `pthread_mutex_lock(3)` / `pthread_mutex_unlock(3)` – Mutual exclusion.
    - `pthread_cond_wait(3)` / `pthread_cond_timedwait(3)` – Condition variable signaling.
    - `gettimeofday(2)` – Wall-clock time for precise scheduling.
    - `usleep(3)` – Sub-second sleep for throttling.
- **GeeksforGeeks**: [Multithreading in C](https://www.geeksforgeeks.org/c/multithreading-in-c/) – Comprehensive guide to thread creation, synchronization, and POSIX thread API.
- **Medium**: [Understanding Threads in C](https://medium.com/@akshatarhabib/understanding-threads-in-c-c9feb5e9372a) – Practical introduction to C threading concepts.
- **Medium**: [Mutexes in C](https://medium.com/@sherniiazov.da/mutexes-in-c-ac2b0f1a6d34) – Detailed explanation of mutex mechanisms and usage patterns.

### Scheduling & Real-Time Systems

- **Wikipedia**: [Earliest Deadline First Scheduling](https://en.wikipedia.org/wiki/Earliest_deadline_first_scheduling) – Overview of EDF algorithm and optimality proof.
- **GeeksforGeeks**: [Earliest Deadline First (EDF) CPU Scheduling Algorithm](https://www.geeksforgeeks.org/operating-systems/earliest-deadline-first-edf-cpu-scheduling-algorithm/) – Practical implementation and examples of EDF scheduling.

### Priority Queues & Heaps

- **GeeksforGeeks**: [Heap in C](https://www.geeksforgeeks.org/c/heap-in-c/) – C implementation of heap data structures and operations.
- **Medium**: [Stack and Heap](https://medium.com/@beingnile/stack-and-heap-25ada76c1b61) – Memory management and heap fundamentals.

### AI Usage Disclosure

**Tools used**: OpenAI ChatGPT, GitHub Copilot.

**Tasks**:

- Code structure brainstorming (files, module separation).
- Debugging logic for heap insertion/deletion bugs.
- Pthread API reference lookups and usage examples.
- Validation of scheduling logic against EDF properties.

**Manual validation**:

- All core synchronization logic (mutex placement, condition variable signaling, race condition prevention) was designed and reviewed by the developer.
- All scheduling logic (FIFO queue, EDF deadline comparison) was manually tested with trace outputs.
- Memory leak checks performed with Valgrind memcheck.
- Thread safety verified with Valgrind helgrind.

---

## Blocking Cases Handled

### 1. Deadlock Prevention

**Problem**: Threads waiting for mutexes in inconsistent order can deadlock.

**Relation to Coffman Conditions**: Deadlock requires all four conditions:

1. Mutual exclusion (mutex protects dongles) ✓
2. Hold and wait (thread holds dongle, waits for second) ✓
3. No preemption (mutexes cannot be forcibly taken) ✓
4. Circular wait (coder N waits for left, N+1 waits for right, etc.) ✓

**Mitigation**:

- Enforce strict lock ordering: always acquire left dongle **before** right dongle (by coder ID).
- If a coder cannot acquire both within the scheduler's arbitration, the scheduler rejects the current request and enqueues for retry.
- Timeout on condition variables prevents indefinite waits if state becomes inconsistent.

**Observable behavior**:

- All coders eventually compile without hanging.
- No pthread_mutex deadlock errors in debug logs.
- Simulation completes or terminates via burnout, never via system hang.

### 2. Starvation Prevention

**Problem**: Under heavy contention, a coder might never acquire both dongles despite continued requests.

**Mitigation**:

- **FIFO scheduler**: Requests are served in arrival order. A request that has been waiting longest holds priority, preventing indefinite postponement.
- **EDF scheduler**: Requests are sorted by deadline (last_compile_start + time_to_burnout). A coder close to burnout is prioritized, guaranteeing progress or fair burnout.
- **Fair arbitration**: Scheduler grants both dongles atomically when available; no "stealing" of already-queued requests.

**Observable behavior**:

- Under feasible parameters, all coders reach compile quota.
- Under tight deadlines, burnout is fair (coder with earliest deadline burns out first).
- No unbounded waiting for any specific resource.

### 3. Dongle Cooldown Handling

**Problem**: Released dongles must not be immediately re-acquired; cooldown prevents state aliasing and gives fair turn-taking.

**Mitigation**:

- After a coder releases a dongle, the dongle's `available_at` timestamp is set to `current_time + dongle_cooldown`.
- Scheduler checks `available_at` before granting a dongle. If current time < `available_at`, the request is not satisfied; coder re-enqueues.
- Cooldown is enforced per-dongle, not per-coder, allowing different dongles to exit cooldown at different times.

**Observable behavior**:

- Timestamps show gaps between a dongle release and its next acquisition (≥ dongle_cooldown ms).
- Multiple coders' requests are interspersed without one coder dominating.

### 4. Precise Burnout Detection

**Problem**: Detecting burnout at exactly the deadline is hard due to OS scheduling jitter and thread wake-up delays.

**Mitigation**:

- Dedicated monitor thread periodically checks each coder's `time_since_last_compile` state.
- Monitor compares against `time_to_burnout` threshold.
- If threshold exceeded, monitor sets a global `simulation_stop` flag and logs burnout.
- Burnout log must appear within 10 ms of actual burnout time (tolerance for OS scheduling variance).

**Observable behavior**:

- Burnout message appears ≤ 10 ms after the deadline expires.
- All coders stop and threads cleanly exit after burnout is logged.
- No further state changes (compile, debug, refactor) after burnout.

### 5. Log Serialization

**Problem**: If multiple threads print simultaneously, lines interleave or partially print, creating garbled output.

**Mitigation**:

- All logging is protected by a single global `print_mutex`.
- Before any state-change message, a thread locks `print_mutex`, prints atomically, then unlocks.
- `pthread_mutex_lock()` ensures mutual exclusion; only one thread prints at a time.

**Observable behavior**:

- Each log line is complete and on its own line.
- No partial messages or character-level interleaving.
- Output can be parsed unambiguously by post-processing scripts.

---

## Thread Synchronization Mechanisms

### Mutex Usage: `pthread_mutex_t`

**Dongle state protection**:

- **Where**: Each dongle is protected by `mutex_dongle[i]`.
- **Why**: Two threads (coders) can request the same dongle simultaneously. Mutex ensures atomic read-modify-write of dongle's `available_at` and `owner` fields.
- **Code pattern**:
    ```c
    pthread_mutex_lock(&mutex_dongle[i]);
    if (dongle[i].available_at <= current_time && dongle[i].owner == -1) {
      dongle[i].owner = coder_id;
      dongle[i].available_at = current_time + dongle_cooldown;
    }
    pthread_mutex_unlock(&mutex_dongle[i]);
    ```

**Scheduler queue protection**:

- **Where**: The priority queue (heap) is protected by `mutex_scheduler`.
- **Why**: Multiple coders insert requests concurrently; monitor and scheduler threads may read/dequeue simultaneously.
- **Pattern**: All heap operations (insert, extract-min) are bracketed by `pthread_mutex_lock()` / `pthread_mutex_unlock()`.

**Monitor state protection**:

- **Where**: Global `simulation_stop` flag and each coder's `burnout_state` is protected by `mutex_monitor`.
- **Why**: Monitor thread and coder threads race to set/read burnout flags. Mutex prevents data races.

**Log output protection**:

- **Where**: The single `print_mutex`.
- **Why**: `printf()` is not thread-safe. Without mutex, simultaneously thrown messages from different threads interleave.
- **Pattern**:
    ```c
    pthread_mutex_lock(&print_mutex);
    printf("%lld %d has taken a dongle\n", current_ms, coder_id);
    pthread_mutex_unlock(&print_mutex);
    ```

### Condition Variable Usage: `pthread_cond_t`

**Scheduler notification** (optional but efficient):

- **Where**: `cond_scheduler` paired with `mutex_scheduler`.
- **Why**: Coder threads wait until a dongle pair becomes available. Instead of busy-polling, they sleep on the condition variable and wake when the monitor or another thread signals availability.
- **Pattern**:
    ```c
    pthread_mutex_lock(&mutex_scheduler);
    while (!is_request_satisfiable(request)) {
      pthread_cond_wait(&cond_scheduler, &mutex_scheduler);
    }
    // Process request
    pthread_mutex_unlock(&mutex_scheduler);
    ```

**Monitor notification** (optional):

- **Where**: `cond_monitor` paired with `mutex_monitor`.
- **Why**: Coder threads can wait for simulation stop without busy-checking; monitor signals when burnout occurs.

### Synchronization of Shared Resources

**Dongle state** (set of { available_at, owner }):

- Protected by per-dongle mutex.
- Coder atomically locks both left and right dongle mutexes in ID order before checking or updating state.
- Prevents race where one thread reads "left available," another thread acquires it, then first thread re-checks and sees stale data.

**Scheduler (priority queue)**:

- Protected by single `mutex_scheduler`.
- Insert (coder enqueues request) and extract-min (scheduler picks next coder) are atomic under lock.
- FIFO: queue keeps FIFO order; EDF: heap keeps min-deadline-first order.

**Monitor stop condition**:

- Protected by `mutex_monitor` and signaled via `cond_monitor`.
- Once monitor sets `simulation_stop = true`, all coder and monitor threads exit loops.
- Ensures clean termination without race conditions.

**Logging output**:

- Serialized by `print_mutex`.
- Guarantees one complete message per critical section.

### Race Condition Prevention Example

**Scenario**: Two coders race to acquire the same dongle pair (left and right).

**Without synchronization** (buggy):

```c
// Coder 1          vs.     Coder 2
if (left_free) {                if (left_free) {
  left_take;                      left_take;
  if (right_free) {              if (right_free) {
    right_take; // OOPS, same dongle!
```

**With synchronization** (correct):

```c
pthread_mutex_lock(&mutex_left);
pthread_mutex_lock(&mutex_right); // Lock in order; left < right
if (left->owner == -1 && left->available_at <= now) {
  left->owner = coder_id;
}
if (right->owner == -1 && right->available_at <= now) {
  right->owner = coder_id;
} else {
  left->owner = -1;  // Rollback if right unavailable
}
pthread_mutex_unlock(&mutex_right);
pthread_mutex_unlock(&mutex_left);
```

### Coder-Monitor Communication

1. **Monitor periodically checks**:

    ```c
    pthread_mutex_lock(&mutex_monitor);
    for (int i = 0; i < num_coders; i++) {
      time_since_last_compile = now - coder[i].last_compile_time;
      if (time_since_last_compile > time_to_burnout) {
        coder[i].burned_out = true;
        simulation_stop = true;
        pthread_cond_broadcast(&cond_monitor); // Wake all threads
      }
    }
    pthread_mutex_unlock(&mutex_monitor);
    ```

2. **Coders check stop condition**:
    ```c
    pthread_mutex_lock(&mutex_monitor);
    while (!simulation_stop && compile_count < quota) {
      pthread_mutex_unlock(&mutex_monitor);
      // Execute compile, debug, refactor
      pthread_mutex_lock(&mutex_monitor);
    }
    pthread_mutex_unlock(&mutex_monitor);
    ```

---

## Project Structure

```
coders/
  Makefile              # Build configuration
  include/
    coders.h            # Global declarations, struct definitions, extern declarations
  src/
    core/
      main.c            # Entry point, argument parsing, initialization, cleanup
      helpers.c         # Utility functions (time, printing, memory)
      parsing.c         # Argument validation and parsing
      launch_routines.c # Thread creation and main loop
    init/
      initialization_coders.c    # Coder thread initialization
      initialization_common.c    # Shared state setup
      initialization_dongles.c   # Dongle structures and mutexes
      initialization_monitor.c   # Monitor thread setup
    coder/
      coder_routine.c    # Main coder thread loop
      coder_actions.c    # Compile, debug, refactor logic
      coder_helpers.c    # Coder utility functions
      coder_utils.c      # Coder state management
    heap/
      heap.c             # Heap data structure (insert, delete, build)
      heap_helpers.c     # Heap utility functions
      heap_priority.c    # Priority comparators for FIFO and EDF
    monitor/
      monitor_routine.c  # Monitor thread loop (burnout detection)
```

---

## Testing

### Functional Checks

**Test 1: Basic compilation**

```bash
./codexion 2 3000 200 200 200 1 100 fifo
# Expected: Both coders compile once; no burnout.
```

**Test 2: EDF fairness**

```bash
./codexion 5 2000 300 300 300 2 100 edf
# Expected: All 5 coders compile 2 times before anyone burns out.
```

**Test 3: Dongle cooldown**

```bash
./codexion 2 5000 500 500 500 1 1000 fifo
# Expected: Gap of ~1000 ms between dongle release and next use.
```

**Test 4: Burnout detection**

```bash
./codexion 3 500 1000 1000 1000 10 1 fifo
# Expected: One coder burns out before reaching 10 compiles (burnout deadline exceeded).
```

**Test 5: Input validation**

```bash
./codexion -1 1000 200 200 200 1 100 fifo
# Expected: Error message and clean exit.

./codexion 5 1000 200 200 200 1 100 invalid
# Expected: Error message and clean exit.
```

### Memory Leak Checks

**Valgrind memcheck**:

```bash
valgrind --leak-check=full --show-leak-kinds=all ./codexion 2 2000 200 200 200 1 100 fifo
```

**Expected**: No "definitely lost," "indirectly lost," or "possibly lost" memory. All allocated memory freed.

### Thread Safety Checks

**Valgrind helgrind** (detects race conditions):

```bash
valgrind --tool=helgrind ./codexion 3 2000 300 300 300 1 100 edf
```

**Expected**: No race condition warnings. All shared memory accesses are protected by locks.

---

## Known Limitations

1. **OS Scheduling Variance**: Burnout detection has a 10 ms tolerance due to OS thread scheduling jitter. If a deadline expires slightly before the monitor wakes, the burnout message may lag by up to 10 ms.

2. **Single Core Bottleneck**: On single-CPU machines, excessive mutex contention can cause performance degradation. Multi-core systems are recommended for realistic concurrency behavior.

3. **Heap Size**: The priority queue heap is implemented as a dynamic array. If the queue size exceeds available memory, allocation fails. For typical tests (< 10000 concurrent requests), this is not a concern.

4. **Limited to POSIX Systems**: The program uses POSIX threading (`pthread_*`). It does not compile on Windows without a POSIX emulation layer (e.g., Cygwin, WSL2).

5. **No Thread Pooling**: One thread per coder. Under extreme coder counts (e.g., 1000+), system resource limits may be reached.
