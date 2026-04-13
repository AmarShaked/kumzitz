import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/auth/ProfilePage';
import SongListPage from './features/songs/SongListPage';
import SongViewPage from './features/songs/SongViewPage';
import EditorPage from './features/editor/EditorPage';
import TunerPage from './features/tuner/TunerPage';
import ChordFinderPage from './features/chord-finder/ChordFinderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SongListPage />} />
        <Route path="/song/:id" element={<SongViewPage />} />
        <Route path="/song/:id/edit" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/tuner" element={<TunerPage />} />
        <Route path="/chord-finder" element={<ChordFinderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
