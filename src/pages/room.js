// ============================================
// Room Page — Voice Chat
// ============================================
// The main voice chat UI.
// Shows participants and handles audio.

import { connectToRoom, leaveRoom, toggleMicrophone, isMicMuted, getParticipants, getCurrentRoom } from '../livekit.js';
import { database, ref, update, get } from '../firebase.js';

/**
 * Render the Room
 * @param {string} roomId - The Firebase ID for the room
 * @param {string} roomName - The display name of the room
 * @param {Function} onLeaveRoom - Called when user clicks "Leave"
 */
export async function renderRoom(roomId, roomName, onLeaveRoom) {
    const app = document.getElementById('app');

    // --- Update Firebase Participant Count (+1) ---
    // We only update if it's a real room (not the static OYO/Gaali ones)
    if (roomId !== 'oyo-room-permanent' && roomId !== 'gaali-room-permanent') {
        const roomRef = ref(database, `rooms/${roomId}`);
        get(roomRef).then((snapshot) => {
            if (snapshot.exists()) {
                const currentCount = snapshot.val().participants || 0;
                update(roomRef, { participants: currentCount + 1 });
            }
        });
    }

    // Clear previous page
    app.innerHTML = '';

    // Create UI Structure
    const container = document.createElement('div');
    container.className = 'room-layout fade-in';

    container.innerHTML = `
        <header class="room-header glass-card">
            <h3>🎙️ ${roomName}</h3>
            <span id="connection-status" class="status-badge connecting">Connecting...</span>
        </header>

        <div id="participants-grid" class="participants-grid">
            <!-- Avatars appear here -->
        </div>

        <div class="controls-bar">
            <button id="mic-btn" class="control-btn" title="Toggle Mic">
                <span id="mic-icon">🎤</span>
            </button>
            <button id="ludo-btn" class="control-btn" title="Play Ludo">
                <span>🎲</span>
            </button>
            <button id="leave-btn" class="control-btn end-call" title="Leave">
                <span>📞</span>
            </button>
        </div>
    `;

    app.appendChild(container);

    // --- Connect to LiveKit ---
    const statusLabel = document.getElementById('connection-status');
    const participantsGrid = document.getElementById('participants-grid');

    // Generate a random identity for now (e.g. User-1234)
    const identity = `User-${Math.floor(Math.random() * 10000)}`;

    try {
        await connectToRoom(
            roomName, // We use roomName as room identifier in LiveKit
            identity,
            {
                onParticipantJoined: (p) => renderParticipant(p),
                onParticipantLeft: (p) => removeParticipant(p.identity),
                onTrackSubscribed: (track, p) => renderParticipant(p), // Re-render to show speaking status
                onActiveSpeakerChanged: (speakers) => updateActiveSpeakers(speakers),
                onDisconnected: () => handleDisconnect(onLeaveRoom)
            }
        );

        statusLabel.textContent = 'Connected ✅';
        statusLabel.className = 'status-badge connected';

        // Initial render of participants
        const participants = getParticipants();
        participants.forEach(p => renderParticipant(p));

    } catch (error) {
        console.error('Failed to connect:', error);
        statusLabel.textContent = 'Error ❌';
        statusLabel.className = 'status-badge error';
        alert(`Failed to connect to room: ${error.message}`);
        onLeaveRoom();
        return;
    }

    // --- Event Listeners ---

    // Toggle Mic
    document.getElementById('mic-btn').addEventListener('click', async () => {
        const isMuted = await toggleMicrophone();
        const icon = document.getElementById('mic-icon');
        const btn = document.getElementById('mic-btn');

        if (isMuted) {
            icon.textContent = '🔇';
            btn.classList.add('muted');
        } else {
            icon.textContent = '🎤';
            btn.classList.remove('muted');
        }

        // Update my own tile
        const myTile = document.getElementById(`tile-${identity}`);
        if (myTile) {
            const micStatus = myTile.querySelector('.mic-status');
            if (micStatus) micStatus.textContent = isMuted ? '🔇' : '🎤';
        }
    });

    // Ludo Prank Button
    document.getElementById('ludo-btn').addEventListener('click', () => {
        triggerPrank();
    });

    // Leave Room
    document.getElementById('leave-btn').addEventListener('click', () => {
        handleLeave();
    });

    function handleLeave() {
        leaveRoom();

        // --- Update Firebase Participant Count (-1) ---
        if (roomId !== 'oyo-room-permanent' && roomId !== 'gaali-room-permanent') {
            const roomRef = ref(database, `rooms/${roomId}`);
            get(roomRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const currentCount = snapshot.val().participants || 0;
                    // Ensure we don't go below 0
                    const newCount = Math.max(0, currentCount - 1);
                    update(roomRef, { participants: newCount });
                }
            });
        }

        onLeaveRoom();
    }

    // --- Helper Functions ---

    function triggerPrank() {
        const overlay = document.createElement('div');
        overlay.className = 'prank-overlay';
        overlay.innerHTML = `
            <div class="prank-content">
                <div class="prank-emoji">😡</div>
                <h1>Baap ka raaj hai?</h1>
                <h2>Har time Ludo?!</h2>
                <p>Padhai likhai karo IAS YAS bano!</p>
            </div>
        `;
        document.body.appendChild(overlay);

        // Remove after 4 seconds
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 4000);
    }

    function renderParticipant(participant) {
        // Check if tile already exists
        let tile = document.getElementById(`tile-${participant.identity}`);

        if (!tile) {
            tile = document.createElement('div');
            tile.id = `tile-${participant.identity}`;
            tile.className = 'participant-tile glass-card';
            participantsGrid.appendChild(tile);
        }

        const isMuted = !participant.isMicrophoneEnabled;
        const isSpeaking = participant.isSpeaking;

        tile.className = `participant-tile glass-card ${isSpeaking ? 'speaking' : ''}`;

        tile.innerHTML = `
            <div class="avatar">${participant.identity.substring(0, 2).toUpperCase()}</div>
            <div class="participant-name">${participant.identity}</div>
            <div class="mic-status">${isMuted ? '🔇' : '🎤'}</div>
        `;
    }

    function removeParticipant(identity) {
        const tile = document.getElementById(`tile-${identity}`);
        if (tile) tile.remove();
    }

    function updateActiveSpeakers(speakers) {
        // Reset all speaking borders
        document.querySelectorAll('.participant-tile').forEach(tile => {
            tile.classList.remove('speaking');
        });

        // Highlight active speakers
        speakers.forEach(speaker => {
            const tile = document.getElementById(`tile-${speaker.identity}`);
            if (tile) tile.classList.add('speaking');
        });
    }

    function handleDisconnect(callback) {
        alert('Disconnected from room');
        callback();
    }
}

/**
 * Cleanup function
 */
export function cleanupRoom() {
    leaveRoom();
}
