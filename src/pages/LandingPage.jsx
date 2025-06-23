import React from 'react';

const LandingPage = () => {
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Welcome to The Protosite Editor</h1>
                <p>Making design to production easier.</p>
                <a href="/signup" style={styles.button}>Find In Canva</a>
            </header>
            <section style={styles.section}>
                <h2>Features</h2>
                <ul>
                    <li>Ease of Use</li>
                    <li>Beginner Friendly</li>
                    <li>Collaboration</li>
                </ul>
            </section>
            <footer style={styles.footer}>
                &copy; {new Date().getFullYear()} Protosite
            </footer>
        </div>
    );
};

const styles = {

};

export default LandingPage;