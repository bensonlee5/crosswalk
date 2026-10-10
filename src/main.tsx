import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
import '../app/game-painted.css';
import '../app/turn-clock.css';
import '../app/life-story.css';
import '../app/encounter-story.css';
import '../components/account-panel.css';
import '../app/image-choices.css';
import '../app/navigation-motion.css';
import '../app/isometric.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Home /></React.StrictMode>);
