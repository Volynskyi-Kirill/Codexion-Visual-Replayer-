import { useLogStore } from './store/useLogStore';
import { CircularHub } from './components/CircularHub';
import { PlaybackControls } from './components/PlaybackControls';
import { HeapViewer } from './components/HeapViewer';
import { EventLog } from './components/EventLog';
import { SimulationInfo } from './components/SimulationInfo';
import { SimulationForm } from './components/SimulationForm';
import './App.css';

function App() {
    const { metadata, reset } = useLogStore();

    return (
        <div className='app-container'>
            <header>
                <h1>Codexion Visual Replayer</h1>
                {metadata && (
                    <button className='back-btn' onClick={reset}>
                        New Simulation
                    </button>
                )}
            </header>

            {!metadata ? (
                <div className='setup-section'>
                    <h2>Configure Simulation</h2>
                    <SimulationForm />
                </div>
            ) : (
                <main className='replayer-content'>
                    <PlaybackControls />
                    <div className='workspace-frame'>
                        <aside className='simulation-events-panel'>
                            <EventLog />
                        </aside>
                        <div className='simulation-workspace'>
                            <div className='hub-wrapper'>
                                <CircularHub />
                            </div>
                            <aside className='side-panel'>
                                <HeapViewer />
                            </aside>
                        </div>
                    </div>
                    {metadata && <SimulationInfo metadata={metadata} />}
                </main>
            )}
        </div>
    );
}

export default App;
