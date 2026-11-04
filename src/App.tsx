import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SongListPage from './features/songs/SongListPage';
import SongViewPage from './features/songs/SongViewPage';
import AddSongPage from './features/songs/AddSongPage';
import EditorPage from './features/editor/EditorPage';
import TunerPage from './features/tuner/TunerPage';
import ChordFinderPage from './features/chord-finder/ChordFinderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SongListPage />} />
        <Route path="/song/:id" element={<SongViewPage />} />
        <Route path="/add" element={<AddSongPage />} />
        <Route path="/song/:id/edit" element={<EditorPage />} />
        <Route path="/new" element={<EditorPage />} />
        <Route path="/tuner" element={<TunerPage />} />
        <Route path="/chord-finder" element={<ChordFinderPage />} />
      </Route>
    </Routes>
  );
}
