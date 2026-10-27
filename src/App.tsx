import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Boot } from './components/chrome';
import { HomeScreen } from './screens/HomeScreen';
import { PlayScreen } from './screens/PlayScreen';

const HostScreen = lazy(() => import('./screens/HostScreen').then((mod) => ({ default: mod.HostScreen })));
const SoloScreen = lazy(() => import('./screens/SoloScreen').then((mod) => ({ default: mod.SoloScreen })));

export function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Boot label="Đang tải…" />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/host" element={<HostScreen />} />
          <Route path="/thu" element={<SoloScreen />} />
          <Route path="/play" element={<PlayScreen />} />
          <Route path="/join/:code" element={<PlayScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
