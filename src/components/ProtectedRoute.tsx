import { Navigate } from 'react-router-dom';
import { pb } from '../services/pocketbase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
