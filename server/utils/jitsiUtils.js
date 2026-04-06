const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Jitsi Configuration
 */
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.skilldad.com';
const JITSI_APP_ID = process.env.JITSI_APP_ID || 'skilldad_platform';
const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET;

/**
 * Mock Mode Configuration
 * Enable mock mode if credentials are missing
 */
const JITSI_MOCK_MODE = process.env.JITSI_MOCK_MODE === 'true' || !JITSI_APP_SECRET;

/**
 * Generate a unique room name for a live session
 * @param {string} sessionId - Application session ID
 * @returns {string} Sanitized room name
 */
const generateRoomName = (sessionId) => {
    // Basic sanitization to ensure room name is Jitsi-friendly
    const sanitizedId = sessionId.replace(/[^a-zA-Z0-9]/g, '_');
    return `SkillDad_${sanitizedId}`;
};

/**
 * Generate a secure JWT for a user to join a Jitsi meeting
 * @param {Object} userData - Information about the user
 * @param {string} roomName - The name of the Jitsi room
 * @param {boolean} isInstructor - Whether the user is an instructor (Owner)
 * @returns {string} Signed JWT
 */
const generateJitsiToken = (userData, roomName, isInstructor = false) => {
    if (JITSI_MOCK_MODE) {
        console.log('[Jitsi] Mock JWT generated (No secret found or mock mode enabled)');
        return 'MOCK_TOKEN_' + Date.now();
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (3 * 60 * 60); // Token valid for 3 hours

    const payload = {
        aud: 'jitsi',
        iss: JITSI_APP_ID,
        sub: JITSI_DOMAIN,
        room: roomName,
        iat: iat,
        exp: exp,
        context: {
            user: {
                name: userData.name || 'User',
                email: userData.email,
                avatar: userData.avatar || '',
                affiliation: isInstructor ? 'owner' : 'member'
            },
            features: {
                recording: isInstructor,
                livestreaming: isInstructor,
                'screen-sharing': true
            }
        }
    };

    try {
        return jwt.sign(payload, JITSI_APP_SECRET, { algorithm: 'HS256' });
    } catch (error) {
        console.error('[Jitsi] Failed to sign JWT:', error.message);
        throw new Error('Jitsi security token generation failed');
    }
};

/**
 * Creates the metadata needed for a Jitsi meeting record
 * @param {string} topic - Session topic
 * @param {string} sessionId - Internal session ID
 * @returns {Object} Jitsi meeting data
 */
const createJitsiMeeting = (topic, sessionId) => {
    const roomName = generateRoomName(sessionId);
    
    // For Jitsi, the "Join URL" is usually just the URL + room name
    // If you use a token, the frontend component will append it.
    const joinUrl = `https://${JITSI_DOMAIN}/${roomName}`;

    return {
        roomName,
        domain: JITSI_DOMAIN,
        appId: JITSI_APP_ID,
        joinUrl,
        provider: 'jitsi',
        createdAt: new Date()
    };
};

module.exports = {
    generateRoomName,
    generateJitsiToken,
    createJitsiMeeting,
    JITSI_MOCK_MODE
};
