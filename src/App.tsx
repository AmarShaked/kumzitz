import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-heebo">
      <Routes>
        <Route path="/" element={<div className="p-8 text-center text-2xl">קומזיץ</div>} />
      </Routes>
    </div>
  );
}
