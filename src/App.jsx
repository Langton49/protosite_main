import React from 'react';
import EditorPage from './pages/EditorPage';
import Home from './pages/Home';
import "./styles/App.css";
import { Routes, Route } from 'react-router-dom';
import logo from './assets/protosite_logo.png';



function App() {

  return (
    <>
      <img src={logo} alt="Protosite Logo" className="logo" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </>
  )
}
export default App;
