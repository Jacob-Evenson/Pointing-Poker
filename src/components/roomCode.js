export function generateRoomCode() {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
}

export function generateUniqueRoomCode(existingIds, maxAttempts = 10) {
    const existingSet = existingIds instanceof Set ? existingIds : new Set(existingIds);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateRoomCode();
        if (!existingSet.has(code)) {
            return code;
        }
    }

    throw new Error('Failed to generate a unique room code after multiple attempts');
}