import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EditorPage from './pages/EditorPage.jsx';


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="editor" element={<EditorPage />} />
    </Routes>
  );
}

export default App;