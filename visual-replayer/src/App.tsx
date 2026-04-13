import { useState } from 'react';
import { useLogStore } from './store/useLogStore';
import { CircularHub } from './components/CircularHub';
import { PlaybackControls } from './components/PlaybackControls';
import { HeapViewer } from './components/HeapViewer';
import { EventLog } from './components/EventLog';
import { SimulationInfo } from './components/SimulationInfo';
import { SimulationForm } from './components/SimulationForm';
import { FAQ } from './components/FAQ';
import { HelpCircle } from 'lucide-react';
import './App.css';

function App() {
    const { metadata, reset } = useLogStore();
    const [isFAQOpen, setIsFAQOpen] = useState(false);

    return (
        <div className='app-container'>
            <header>
                <div className='header-left'>
                    <h1>Codexion Visual Replayer</h1>
                </div>
                <div className='header-right'>
                    <button className='icon-btn' onClick={() => setIsFAQOpen(true)} title='Help & FAQ'>
                        <HelpCircle size={20} />
                    </button>
                    {metadata && (
                        <button className='back-btn' onClick={reset}>
                            New Simulation
                        </button>
                    )}
                </div>
            </header>

            {isFAQOpen && <FAQ onClose={() => setIsFAQOpen(false)} />}

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
