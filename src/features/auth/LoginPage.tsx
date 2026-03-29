import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

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
          <p className="text-red-400 text-sm text-center">שם משתמש או סיסמה לא נכונים</p>
        )}
        <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={isLoggingIn}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
          {isLoggingIn ? 'מתחבר...' : 'התחבר'}
        </button>
        <p className="text-center text-sm text-gray-400">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">הרשמה</Link>
        </p>
      </form>
    </div>
  );
}
