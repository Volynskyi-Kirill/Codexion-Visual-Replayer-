import React from 'react';
import { HelpCircle, Terminal, Cpu, Clock, Layers, Zap } from 'lucide-react';

interface FAQItemProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ icon, title, children }) => (
  <div className="faq-item">
    <div className="faq-header">
      <div className="faq-icon-wrapper">{icon}</div>
      <h3>{title}</h3>
    </div>
    <div className="faq-content">{children}</div>
  </div>
);

export const FAQ: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="faq-overlay" onClick={onClose}>
      <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
        <header className="faq-modal-header">
          <div className="title-with-icon">
            <HelpCircle size={24} className="text-blue-500" />
            <h2>Documentation & FAQ</h2>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="faq-scroll-area">
          <FAQItem icon={<Cpu size={20} />} title="What is Codexion?">
            <p>
              Codexion is a multi-threaded concurrency simulation that models a shared workspace 
              where multiple <strong>coders</strong> compete for limited <strong>USB dongles</strong> 
              to compile quantum code. It demonstrates core concurrent programming concepts like 
              thread synchronization, mutual exclusion, and fair resource allocation.
            </p>
          </FAQItem>

          <FAQItem icon={<Terminal size={20} />} title="How the Simulation Works?">
            <p>
              Coders cycle through three distinct phases:
            </p>
            <ul>
              <li><strong>Compile:</strong> Requires holding two adjacent dongles simultaneously.</li>
              <li><strong>Debug:</strong> A non-critical thinking phase (no dongles needed).</li>
              <li><strong>Refactor:</strong> Preparing for the next compile (no dongles needed).</li>
            </ul>
            <p>
              The simulation is a <strong>C binary</strong> running on the backend, communicating 
              its internal state changes via <strong>JSON logs</strong> over a <strong>WebSocket</strong> stream.
            </p>
          </FAQItem>

          <FAQItem icon={<Clock size={20} />} title="Burnout & Deadlines">
            <p>
              Every coder has a <strong>time_to_burnout</strong> deadline. If a coder fails to start 
              compiling within this window (since the start or last successful compilation), they 
              burn out, and the simulation ends immediately. Managing this pressure is the core 
              challenge of the arbitration policy.
            </p>
          </FAQItem>

          <FAQItem icon={<Layers size={20} />} title="Scheduling Policies">
            <p>
              Two algorithms manage dongle contention:
            </p>
            <ul>
              <li><strong>FIFO (First-In-First-Out):</strong> Requests are served strictly in order of arrival. Simple and fair, but can lead to burnout under high pressure.</li>
              <li><strong>EDF (Earliest Deadline First):</strong> Prioritizes coders closest to their burnout deadline. Dynamically re-orders the queue to ensure survival of the most "stressed" coders.</li>
            </ul>
          </FAQItem>

          <FAQItem icon={<Zap size={20} />} title="Live Mode vs Replay">
            <p>
              <strong>Live Mode:</strong> When you start a simulation, the Go backend spawns the C process 
              and pipes its output line-by-line. The visualizer "follows" the live time to show you 
              what is happening <em>right now</em>.
            </p>
            <p>
              <strong>Replay:</strong> Once events are received, they are indexed by timestamp. You can 
              pause, scrub the timeline, change playback speed, or jump between specific events 
              to analyze race conditions or scheduling behavior in detail.
            </p>
          </FAQItem>

          <FAQItem icon={<Layers size={20} />} title="Visual Elements">
            <ul>
              <li><strong>Circular Hub:</strong> Shows coders (nodes) and dongles (between coders). Glow effects indicate active compilation.</li>
              <li><strong>Heap Viewer:</strong> Visualizes the internal priority queue of each dongle, showing which coder IDs are waiting and their relative priority.</li>
              <li><strong>Event Log:</strong> A chronological stream of all system state changes.</li>
            </ul>
          </FAQItem>
        </div>

        <footer className="faq-footer">
          <p>Built with React 19, Go (Gin/Gorilla), and POSIX Threads in C.</p>
        </footer>
      </div>
    </div>
  );
};
