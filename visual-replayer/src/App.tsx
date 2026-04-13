import { useLogStore } from './store/useLogStore';
import { CircularHub } from './components/CircularHub';
import { PlaybackControls } from './components/PlaybackControls';
import { HeapViewer } from './components/HeapViewer';
import { EventLog } from './components/EventLog';
import './App.css';

function App() {
  const { setLogs, metadata } = useLogStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setLogs(text);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Codexion Visual Replayer</h1>
      </header>
      
      {!metadata ? (
        <div className="upload-section">
          <input type="file" id="file-upload" onChange={handleFileChange} accept=".txt,.log" hidden />
          <label htmlFor="file-upload" className="upload-btn">
            Select Simulation Log
          </label>
          <p>Drag and drop or click to upload a .txt or .log file</p>
        </div>
      ) : (
        <main className="replayer-content">
          <PlaybackControls />
          <div className="simulation-workspace">
            <div className="hub-wrapper">
              <CircularHub />
            </div>
            <aside className="side-panel">
              <HeapViewer />
              <EventLog />
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
