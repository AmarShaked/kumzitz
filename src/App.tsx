import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/auth/ProfilePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<div className="p-8 text-center text-xl text-gray-400">רשימת שירים (בקרוב)</div>} />
        <Route path="/song/:id" element={<div>Song View (coming soon)</div>} />
        <Route
          path="/song/:id/edit"
          element={<ProtectedRoute><div>Edit Song (coming soon)</div></ProtectedRoute>}
        />
        <Route
          path="/new"
          element={<ProtectedRoute><div>New Song (coming soon)</div></ProtectedRoute>}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
      </Route>
    </Routes>
  );
}
