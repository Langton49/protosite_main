import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

const backendUrl = "http://localhost:3001";

function App() {
  const [projectData, setProjectData] = useState(null);
  const [logMessage, setLogMessage] = useState('Initializing...');
  const [serverUrl, setServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const webcontainerRef = useRef(null);

  const spinnerChars = ['\\', '|', '/', '-', '\\', '|'];

  const setupMessages = [
    "Websites with less content or a smaller scroll area will produce more accurate results",
    "Placeholders are used in place of images found in your website design",
    "Connect to GitHub back in Canva and export your favourite previews to a repository to work with.",
    "The AI may hallucinate text. ALWAYS check the content produced before deciding to deploy",
    "Live editing and conversation features coming soon..."
  ];

  // Spinner animation
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerChars.length);
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Message cycling
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % setupMessages.length);
    }, 3000); // Change message every 3 seconds

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

      {isLoading && (
        <div className="setup-messages">
          <div className="message-container">
            <div className="tip-icon">💡</div>
            <p className="setup-message">{setupMessages[messageIndex]}</p>
          </div>
        </div>
      )}

      <div className="iframe-container">
        {serverUrl && (
          <iframe
            src={serverUrl}
            className="preview-iframe"
            title="WebContainer Preview"
          />
        )}
      </div>

      <style jsx>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(to right, #ff416c, #3e0471);
          background-attachment: fixed;
          overscroll-behavior: none;
          color: #333;
        }

        /* Chrome, Edge, Safari */
        body::-webkit-scrollbar,
        .iframe-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        body::-webkit-scrollbar-track,
        .iframe-container::-webkit-scrollbar-track {
          background: transparent;
        }

        body::-webkit-scrollbar-thumb,
        .iframe-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        body::-webkit-scrollbar-thumb:hover,
        .iframe-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @keyframes glowPulse {
          0% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 64, 112, 0.4), 0 0 20px rgba(62, 4, 113, 0.4);
          }
          50% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 64, 112, 0.7), 0 0 40px rgba(62, 4, 113, 0.6);
          }
          100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 64, 112, 0.4), 0 0 20px rgba(62, 4, 113, 0.4);
          }
        }

        @keyframes messageSlide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        #root {
          min-height: 100vh;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .app {
          width: 100%;
          max-width: 960px;
          padding: 40px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          font-size: 3rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: white;
          animation: glowPulse 2.5s ease-in-out infinite;
        }

        .status {
          display: flex;
          align-items: center;
          font-size: 1.2rem;
          padding: 16px 24px;
          border-radius: 8px;
          min-height: 60px;
          margin-bottom: 30px;
          width: 100%;
          max-width: 600px;
          justify-content: center;
          background-color: #333;
        }

        .status.success {
          color: #52fe08;
          font-weight: 600;
        }

        .status.loading {
          color: #52fe08;
        }

        .spinner {
          font-family: monospace;
          margin-right: 10px;
          animation: pulse 0.6s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .log-text {
          font-weight: 500;
          color: #52fe08;
        }

        .setup-messages {
          width: 100%;
          max-width: 700px;
          margin-bottom: 30px;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px 24px;
          animation: messageSlide 3s ease-in-out infinite;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .tip-icon {
          font-size: 1.5rem;
          margin-right: 12px;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
        }

        .setup-message {
          color: white;
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          line-height: 1.4;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .iframe-container {
          width: 95vw;
          height: 80vh;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
        }

        .preview-iframe {
          width: 100%;
          height: 600px;
          border: none;
          display: block;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 2.2rem;
          }
          
          .setup-message {
            font-size: 0.9rem;
          }
          
          .message-container {
            padding: 16px 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;