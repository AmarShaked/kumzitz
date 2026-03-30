import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginError, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">התחברות</h1>
        {loginError && (
          <p className="text-destructive text-sm text-center">שם משתמש או סיסמה לא נכונים</p>
        )}
        <Input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={isLoggingIn} className="w-full">
          {isLoggingIn ? 'מתחבר...' : 'התחבר'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-primary hover:underline">הרשמה</Link>
        </p>
      </form>
    </div>
  );
}
