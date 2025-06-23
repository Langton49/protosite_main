import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import './styles/App.css';

const backendUrl = "http://localhost:3001";

function App() {
  const [projectData, setProjectData] = useState(null);
  const [logMessage, setLogMessage] = useState('Initializing...');
  const [serverUrl, setServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const webcontainerRef = useRef(null);

  const spinnerChars = ['\\', '|', '/', '-', '\\', '|'];

  // Spinner animation
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerChars.length);
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchApp = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/project`);
      const data = await res.json();
      setProjectData(data.app);
    } catch (error) {
      setLogMessage('Failed to fetch project data.');
      setIsLoading(false);
      throw new Error(error)
    }
  };

  useEffect(() => {
    fetchApp();
  }, []);

  useEffect(() => {
    if (!projectData) return;

    const runWebContainer = async () => {
      if (webcontainerRef.current) return;

      try {
        setLogMessage('Booting WebContainer...');
        const webcontainerInstance = await WebContainer.boot();
        webcontainerRef.current = webcontainerInstance;

        setLogMessage('Mounting project files...');
        await webcontainerInstance.mount(projectData);

        setLogMessage('Installing dependencies...');
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        await installProcess.exit;

        setLogMessage('Starting development server...');
        const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);

        webcontainerInstance.on('server-ready', (port, url) => {
          setServerUrl(url);
          setLogMessage('Preview Ready');
          setIsLoading(false);
        });

      } catch (error) {
        setLogMessage(`[Error] ${error.message}`);
        setIsLoading(false);
      }
    };

    runWebContainer();

    return () => {
      if (webcontainerRef.current) {
        webcontainerRef.current = null;
      }
    };
  }, [projectData]);

  return (
    <div className="app">
      <h1 className="title">Protosite Preview</h1>

      <div className={`status ${serverUrl ? 'success' : 'loading'}`}>
        {isLoading && (
          <>
            <span className="spinner">{spinnerChars[spinnerIndex]}</span>
            <span className="log-text">{logMessage}</span>
          </>
        )}
        {!isLoading && <span>{logMessage}</span>}
      </div>

      <div className="iframe-container">
        {serverUrl && (
          <iframe
            src={serverUrl}
            className="preview-iframe"
            title="WebContainer Preview"
          />
        )}
      </div>
    </div>
  );
}

export default App;
