// ============================================
// Lobby Page — The Meeting Place
// ============================================
// This is where users see all available rooms.
// They can create new rooms or join existing ones.
// It syncs with Firebase in real-time!

import { database, ref, push, onValue, set, remove } from '../firebase.js';

/**
 * Render the Lobby
 * @param {Function} onJoinRoom - Called when user clicks "Join"
 * @param {Function} onLogout - Called when user clicks "Logout"
 */
export function renderLobby(onJoinRoom, onLogout) {
    const app = document.getElementById('app');

    // Clear landing page content
    app.innerHTML = '';

    // Create container
    const container = document.createElement('div');
    container.className = 'lobby-container';

    // Build HTML (Header + Grid)
    container.innerHTML = `
        <header class="lobby-header glass-card">
            <h2>🏠 Lobby</h2>
            <div style="display: flex; gap: 10px;">
                <button id="create-room-btn" class="btn">➕ New Room</button>
                <button id="logout-btn" class="btn secondary">Logout</button>
            </div>
        </header>
        
        <div id="rooms-grid" class="rooms-grid fade-in">
            <!-- Rooms will appear here automatically via Firebase -->
            <div class="empty-state">
                <p>Loading rooms...</p>
            </div>
        </div>
        
        <!-- Hidden Modal for Creating Room -->
        <dialog id="create-modal" class="glass-card" style="margin: auto; border: none; outline: none;">
            <h3>Create a Room</h3>
            <form id="create-form">
                <input type="text" id="room-name-input" placeholder="Room Name (e.g. Chill Chat)" required />
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="cancel-create" class="btn secondary">Cancel</button>
                    <button type="submit" class="btn">Create</button>
                </div>
            </form>
        </dialog>
    `;

    app.appendChild(container);

    // --- Event Listeners ---

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('ybk_authenticated');
        onLogout();
    });

    // Create Room Modal
    const modal = document.getElementById('create-modal');
    document.getElementById('create-room-btn').addEventListener('click', () => modal.showModal());
    document.getElementById('cancel-create').addEventListener('click', () => modal.close());

    // Handle Creating New Room
    document.getElementById('create-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('room-name-input');
        const roomName = input.value.trim();

        if (roomName) {
            // Push new room to Firebase
            const roomsRef = ref(database, 'rooms');
            const newRoomRef = push(roomsRef);
            set(newRoomRef, {
                name: roomName,
                createdAt: Date.now(),
                participants: 0
            });

            modal.close();
            input.value = ''; // Clear input
        }
    });

    // --- Real-time Sync (Firebase) ---
    const roomsRef = ref(database, 'rooms');

    onValue(roomsRef, (snapshot) => {
        const roomsGrid = document.getElementById('rooms-grid');
        roomsGrid.innerHTML = ''; // Clear current list

        // --- PERMANENT ROOMS ---

        // 1. OYO Room (Love Birds)
        const oyoCard = document.createElement('div');
        oyoCard.className = 'room-card glass-card oyo-room';
        oyoCard.innerHTML = `
            <h3>💘 OYO Room</h3>
            <p style="font-size: 0.9rem; opacity: 0.8;">For Love Birds only</p>
            <div class="participant-count">
                <span>👩‍❤️‍💋‍👨</span> Private
            </div>
            <button class="btn join-btn" style="background: #ff4757;">Join OYO →</button>
        `;
        roomsGrid.appendChild(oyoCard);
        oyoCard.querySelector('.join-btn').addEventListener('click', () => {
            onJoinRoom('oyo-room-permanent', '💘 OYO Room');
        });

        // 2. Gaali Room (Abusing)
        const gaaliCard = document.createElement('div');
        gaaliCard.className = 'room-card glass-card gaali-room';
        gaaliCard.innerHTML = `
            <h3>🤬 Gaali Room</h3>
            <p style="font-size: 0.9rem; opacity: 0.8;">Abuse Allowed 18+</p>
            <div class="participant-count">
                <span>🔥</span> No Rules
            </div>
            <button class="btn join-btn" style="background: #2f3542;">Join Fight →</button>
        `;
        roomsGrid.appendChild(gaaliCard);
        gaaliCard.querySelector('.join-btn').addEventListener('click', () => {
            onJoinRoom('gaali-room-permanent', '🤬 Gaali Room');
        });

        // --- FIREBASE ROOMS & CLEANUP ---

        const data = snapshot.val();

        if (data) {
            const now = Date.now();
            const TWO_MINUTES_MS = 2 * 60 * 1000;

            Object.keys(data).forEach((key) => {
                const room = data[key];

                // --- AUTO-DELETE LOGIC ---
                // If room is empty AND created > 2 mins ago -> Delete it
                const createdAt = room.createdAt || 0;
                const participants = room.participants || 0;
                const isOld = (now - createdAt) > TWO_MINUTES_MS;

                if (participants === 0 && isOld) {
                    // Delete strictly if it's not our permanent rooms (just in case they got into DB)
                    if (key !== 'oyo-room-permanent' && key !== 'gaali-room-permanent') {
                        remove(ref(database, `rooms/${key}`));
                        return; // Skip rendering this room
                    }
                }

                // --- RENDER CARD ---
                const card = document.createElement('div');
                card.className = 'room-card glass-card';

                // Cleaned up innerHTML:
                card.innerHTML = `
                    <h3>${room.name}</h3>
                    <div class="participant-count">
                        <span>👥</span> ${participants} online
                    </div>
                    <button class="btn join-btn" data-id="${key}" data-name="${room.name}">Join Room →</button>
                `;

                roomsGrid.appendChild(card);

                // Add click listener to the Join button
                card.querySelector('.join-btn').addEventListener('click', () => {
                    onJoinRoom(key, room.name);
                });
            });
        }
    });
}

/**
 * Cleanup function (optional, if we need to detach listeners)
 */
export function cleanupLobby() {
    // Firebase listener cleans up automatically on page refresh, 
    // but in a real SPA we'd detach the 'onValue' listener here.
}
