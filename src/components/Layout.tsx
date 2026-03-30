import { Link, Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground font-heebo">
      <nav className="border-b border-border px-6 py-3 flex items-center justify-between print:hidden">
        <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80">
          קומזיץ
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/tuner" className="text-sm text-muted-foreground hover:text-foreground">
            כיוון גיטרה
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild>
                <Link to="/new">שיר חדש +</Link>
              </Button>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                {user?.username}
              </Link>
              <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                יציאה
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                התחברות
              </Link>
              <Button asChild>
                <Link to="/register">הרשמה</Link>
              </Button>
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
