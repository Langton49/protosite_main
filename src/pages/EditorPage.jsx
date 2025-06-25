import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import '../styles/EditorPage.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const spinnerChars = ['\\', '|', '/', '-', '\\', '|'];
const setupMessages = [
    "Websites with less content or a smaller scroll area will produce more accurate results.",
    "Placeholders are used in place of images found in your website design.",
    "Connect to GitHub back in Canva and export your favourite previews to a repository to work with.",
    "The AI may hallucinate text. ALWAYS check the content produced before deployment.",
    "Live editing and conversation features coming soon..."
];

const EditorPage = () => {
    const [projectData, setProjectData] = useState(null);
    const [logMessage, setLogMessage] = useState('Initializing...');
    const [serverUrl, setServerUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [spinnerIndex, setSpinnerIndex] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const webcontainerRef = useRef(null);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        // Keep spinner running while loading and no serverUrl
        if (!isLoading || serverUrl) return;

        const interval = setInterval(() => {
            setSpinnerIndex((prev) => (prev + 1) % spinnerChars.length);
        }, 150);

        return () => clearInterval(interval);
    }, [isLoading, serverUrl]);

    /* Change setup message every 3 seconds by updating index and looping through setupMessages. */
    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % setupMessages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isLoading]);

    /* API call to Protosite backend to get generated project data.*/
    const fetchApp = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/project`);
            const data = await res.json();
            if (!data?.success) {
                setLogMessage('No project found.');
                setIsLoading(false);
                return;
            }
            setProjectData(data.app);
        } catch (error) {
            setLogMessage('Encountered an error while fetching the project data. Try again later.');
            setIsLoading(false);
            throw new Error(error)
        }
    };

    /* Call API immediately on mount.*/
    useEffect(() => {
        setFadeIn(true);
        fetchApp();
    }, []);

    /* Start WebContainer, mount project files, install dependencies and run preview.
    
    TODO: Run build as well. */
    useEffect(() => {
        if (!projectData) return;

        const runWebContainer = async () => {

            if (webcontainerRef.current) return; // If WebContainer is already running, do not re-initialize it.

            try {
                setLogMessage('Booting WebContainer...'); // Sets progress message while WebContainer is booting.
                const webcontainerInstance = await WebContainer.boot();
                webcontainerRef.current = webcontainerInstance;

                setLogMessage('Mounting project files...');
                await webcontainerInstance.mount(projectData);

                setLogMessage('Installing dependencies...');
                const installProcess = await webcontainerInstance.spawn('npm', ['install']); // Run 'npm install' to install dependencies.
                await installProcess.exit;

                setLogMessage('Starting development server...');
                const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']); // Run 'npm run dev' to start the development server.

                // If 'npm run dev' succeeds, retrieve the URL to display in an iframe.'
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

        runWebContainer(); // Start the WebContainer and run the project.

        return () => {
            if (webcontainerRef.current) {
                webcontainerRef.current = null;
            }
        };
    }, [projectData]);

    return (
        <div className={`app ${fadeIn ? 'fade-in' : ''}`}>
            {!serverUrl && (
                <div className="header">
                    <h1 className="title">Protosite Preview</h1>
                </div>
            )}

            {!serverUrl && (
                <div className={`status ${serverUrl ? 'success' : 'loading'}`}>
                    {isLoading ? (
                        <>
                            <span className="spinner">{spinnerChars[spinnerIndex]}</span>
                            <span className="log-text">{logMessage}</span>
                        </>
                    ) : (
                        <span className="log-text">{logMessage}</span>
                    )}
                </div>
            )}
            {isLoading && (
                <div className="setup-messages">
                    <div className="message-container">
                        {console.log(`Current message index: ${messageIndex}`)}
                        <p className="setup-message">{setupMessages[messageIndex]}</p>
                    </div>
                </div>
            )}

            {serverUrl && (
                <div className="iframe-container">
                    <iframe
                        src={serverUrl}
                        className="preview-iframe"
                        title="WebContainer Preview"
                    />
                </div>
            )}
        </div>
    );
};

export default EditorPage;