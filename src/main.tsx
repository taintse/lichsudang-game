import { createRoot } from 'react-dom/client';
import { App } from './App';
import { sounds } from './audio/sound';
import './index.css';

import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/latin-700.css';
import '@fontsource/be-vietnam-pro/latin-800.css';
import '@fontsource/be-vietnam-pro/latin-900.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-700.css';
import '@fontsource/be-vietnam-pro/vietnamese-800.css';
import '@fontsource/be-vietnam-pro/vietnamese-900.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource/source-serif-4/latin-700.css';
import '@fontsource/source-serif-4/vietnamese-600.css';
import '@fontsource/source-serif-4/vietnamese-700.css';

window.addEventListener('pointerdown', () => sounds.unlock(), { passive: true });

const root = document.getElementById('root');
if (!root) throw new Error('Không tìm thấy #root');
createRoot(root).render(<App />);
