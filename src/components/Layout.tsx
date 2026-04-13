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
      <nav className="border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between print:hidden">
        <Link to="/" className="text-lg sm:text-xl font-bold text-primary hover:text-primary/80">
          קומזיץ
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/tuner" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            כיוון גיטרה
          </Link>
          <Link to="/chord-finder" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            זיהוי אקורד<sup className="text-[10px] ml-0.5 opacity-60">β</sup>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-8 w-8 sm:h-9 sm:w-9">
            {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          {isAuthenticated ? (
            <>
              <Button size="sm" asChild>
                <Link to="/new">שיר חדש +</Link>
              </Button>
              <Link to="/profile" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
                {user?.username}
              </Link>
              <button onClick={logout} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                יציאה
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                התחברות
              </Link>
              <Button size="sm" asChild>
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
