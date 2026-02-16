// ============================================
// Main App Router
// ============================================
// This is the entry point of our app.
// It handles switching between pages:
//   Landing → Lobby → Room → back to Lobby

import '../style.css';
import { renderLanding } from './pages/landing.js';
import { renderLobby, cleanupLobby } from './pages/lobby.js';
import { renderRoom, cleanupRoom } from './pages/room.js';

// --- Page Router ---
// This simple router swaps page content based on which page we want to show.

/**
 * Navigate to a specific page
 * @param {string} page - 'landing', 'lobby', or 'room'
 * @param {object} params - Additional parameters (e.g., roomId, roomName)
 */
function navigate(page, params = {}) {
    switch (page) {
        case 'landing':
            renderLanding(() => {
                // On success → go to lobby
                navigate('lobby');
            });
            break;

        case 'lobby':
            renderLobby(
                // On join room
                (roomId, roomName) => {
                    navigate('room', { roomId, roomName });
                },
                // On logout
                () => {
                    navigate('landing');
                }
            );
            break;

        case 'room':
            renderRoom(
                params.roomId,
                params.roomName,
                // On leave room → back to lobby
                () => {
                    navigate('lobby');
                }
            );
            break;

        default:
            navigate('landing');
    }
}

// --- App Start ---
// Check if user is already authenticated (from this browser session)
function init() {
    const isAuthenticated = sessionStorage.getItem('ybk_authenticated') === 'true';

    if (isAuthenticated) {
        navigate('lobby');
    } else {
        navigate('landing');
    }
}

// Start the app!
init();
