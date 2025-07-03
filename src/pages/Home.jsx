import { useEffect, useState } from "react";
import "../styles/Home.css";

function Home() {
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        setFadeIn(true)
    }, []);

    return (
        <div className={`home ${fadeIn ? 'fade-in' : ''}`}>
            <h1>Welcome to Protosite</h1>
            <p>
                Protosite is a Canva app that allows users to create a React app from their website designs. Utilizing AI,
                Protosite generates a Vite app that is beginner-friendly, well documented, and ready for deployment with GitHub.
            </p>
        </div>
    );
}

export default Home;