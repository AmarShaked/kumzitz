import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/auth/ProfilePage';
import SongListPage from './features/songs/SongListPage';
import SongViewPage from './features/songs/SongViewPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SongListPage />} />
        <Route path="/song/:id" element={<SongViewPage />} />
        <Route
          path="/song/:id/edit"
          element={<ProtectedRoute><div>Edit Song (Task 10)</div></ProtectedRoute>}
        />
        <Route
          path="/new"
          element={<ProtectedRoute><div>New Song (Task 10)</div></ProtectedRoute>}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
