import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, registerError, isRegistering } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ email, password, username });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">הרשמה</h1>
        {registerError && (
          <p className="text-destructive text-sm text-center">שגיאה בהרשמה, נסה שוב</p>
        )}
        <Input type="text" placeholder="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <Input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <Button type="submit" disabled={isRegistering} className="w-full">
          {isRegistering ? 'נרשם...' : 'הרשם'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-primary hover:underline">התחברות</Link>
        </p>
      </form>
    </div>
  );
}
