// ============================================
// LiveKit Connection Helper
// ============================================
// This file handles connecting to your self-hosted LiveKit server.
// It manages: joining a room, publishing your microphone,
// and listening to other participants' audio.

import {
    Room,
    RoomEvent,
    Track,
    createLocalAudioTrack
} from 'livekit-client';

// Your self-hosted LiveKit server URL (from .env)
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://livekit.yourdomain.com';

// Token server URL (Netlify Function)
const TOKEN_SERVER_URL = '/.netlify/functions';

// The current LiveKit Room instance
let currentRoom = null;

/**
 * Get a LiveKit token from our token server
 * @param {string} roomName - The room to join
 * @param {string} identity - The user's display name
 * @returns {string} JWT token
 */
async function getToken(roomName, identity) {
    // Note: We use the relative path to the Netlify Function
    const response = await fetch(
        `${TOKEN_SERVER_URL}/token?room=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}`
    );
    if (!response.ok) {
        throw new Error('Failed to get token from server');
    }
    const data = await response.json();
    return data.token;
}

/**
 * Connect to a LiveKit voice room
 * @param {string} roomName - The room to join
 * @param {string} identity - Your display name
 * @param {object} callbacks - Event callbacks
 * @param {Function} callbacks.onParticipantJoined - Called when someone joins
 * @param {Function} callbacks.onParticipantLeft - Called when someone leaves
 * @param {Function} callbacks.onTrackSubscribed - Called when you receive audio
 * @param {Function} callbacks.onActiveSpeakerChanged - Called when speaker changes
 * @returns {Room} The LiveKit room instance
 */
export async function connectToRoom(roomName, identity, callbacks = {}) {
    // Step 1: Get a token from our token server
    const token = await getToken(roomName, identity);

    // Step 2: Create a new Room instance
    const room = new Room({
        adaptiveStream: true,
        dynacast: true,
    });

    // Step 3: Set up event listeners

    // When a new audio track is received from another participant
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
            // Create an <audio> element and play it
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}`;
            document.body.appendChild(audioElement);
        }
        callbacks.onTrackSubscribed?.(track, participant);
    });

    // When a track is removed
    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        track.detach().forEach(el => el.remove());
    });

    // When a participant joins the room
    room.on(RoomEvent.ParticipantConnected, (participant) => {
        callbacks.onParticipantJoined?.(participant);
    });

    // When a participant leaves the room
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        // Remove their audio element
        const el = document.getElementById(`audio-${participant.identity}`);
        if (el) el.remove();
        callbacks.onParticipantLeft?.(participant);
    });

    // When active speakers change
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        callbacks.onActiveSpeakerChanged?.(speakers);
    });

    // When disconnected
    room.on(RoomEvent.Disconnected, () => {
        callbacks.onDisconnected?.();
    });

    // Step 4: Connect to the room
    await room.connect(LIVEKIT_URL, token);

    // Step 5: Enable microphone (start publishing audio)
    await room.localParticipant.setMicrophoneEnabled(true);

    currentRoom = room;
    return room;
}

/**
 * Toggle microphone on/off
 * @returns {boolean} New mute state (true = muted)
 */
export async function toggleMicrophone() {
    if (!currentRoom) return false;
    const isCurrentlyEnabled = currentRoom.localParticipant.isMicrophoneEnabled;
    await currentRoom.localParticipant.setMicrophoneEnabled(!isCurrentlyEnabled);
    return !(!isCurrentlyEnabled); // return true if now muted
}

/**
 * Check if microphone is currently muted
 */
export function isMicMuted() {
    if (!currentRoom) return true;
    return !currentRoom.localParticipant.isMicrophoneEnabled;
}

/**
 * Get all participants in the room (including local)
 */
export function getParticipants() {
    if (!currentRoom) return [];
    const participants = [currentRoom.localParticipant];
    currentRoom.remoteParticipants.forEach(p => participants.push(p));
    return participants;
}

/**
 * Leave the current room
 */
export async function leaveRoom() {
    if (currentRoom) {
        await currentRoom.disconnect();
        currentRoom = null;
    }
}

/**
 * Get the current room instance
 */
export function getCurrentRoom() {
    return currentRoom;
}
