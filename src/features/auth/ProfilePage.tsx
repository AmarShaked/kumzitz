import { useAuth } from './hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-md p-8 space-y-6">
      <h1 className="text-2xl font-bold">פרופיל</h1>
      <div className="space-y-2 rounded-lg bg-gray-800 p-6">
        <p><span className="text-gray-400">שם משתמש: </span><span className="font-medium">{user?.username}</span></p>
        <p><span className="text-gray-400">אימייל: </span><span className="font-medium">{user?.email}</span></p>
      </div>
      <button onClick={logout} className="rounded-lg bg-red-600 px-6 py-2 font-medium hover:bg-red-700">התנתק</button>
    </div>
  );
}
