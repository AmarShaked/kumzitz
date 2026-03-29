import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-heebo">
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between print:hidden">
        <Link to="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
          קומזיץ
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700">
                שיר חדש +
              </Link>
              <Link to="/profile" className="text-sm text-gray-300 hover:text-gray-100">
                {user?.username}
              </Link>
              <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-200">
                יציאה
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-gray-100">
                התחברות
              </Link>
              <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700">
                הרשמה
              </Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
