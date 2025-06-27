import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import DogsPage from './pages/DogsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import OwnersPage from './pages/OwnersPage';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/dogs" element={<DogsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="/" element={<DogsPage />} />
      </Routes>
    </Router>
  );
}

export default App;