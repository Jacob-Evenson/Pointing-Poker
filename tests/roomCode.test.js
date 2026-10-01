import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateRoomCode, generateUniqueRoomCode } from '../src/components/roomCode.js';

describe('generateRoomCode', () => {
    it('generates a code that is exactly 6 digits', () => {
        const code = generateRoomCode();
        expect(code).toMatch(/^\d{6}$/);
    });

    it('generates a code as a string (preserves leading zeros)', () => {
        const code = generateRoomCode();
        expect(typeof code).toBe('string');
    });

    it('generates different codes across multiple calls (not hardcoded)', () => {
        const codes = new Set(Array.from({ length: 20 }, () => generateRoomCode()));
        expect(codes.size).toBeGreaterThan(1);
    });
});

describe('generateUniqueRoomCode', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns a 6-digit code', () => {
        const code = generateUniqueRoomCode(['111111', '222222']);
        expect(code).toMatch(/^\d{6}$/);
    });

    it('does not return a code that already exists', () => {
        const existingIds = ['111111', '222222', '333333'];
        const code = generateUniqueRoomCode(existingIds);
        expect(existingIds).not.toContain(code);
    });

    it('accepts existing IDs as an array or a Set', () => {
        const asArray = generateUniqueRoomCode(['111111']);
        const asSet = generateUniqueRoomCode(new Set(['111111']));
        expect(asArray).toMatch(/^\d{6}$/);
        expect(asSet).toMatch(/^\d{6}$/);
    });

    it('regenerates when the first attempt collides with an existing code', () => {
        const spy = vi.spyOn(Math, 'random');
        spy
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.5);

        const existingIds = ['100000'];
        const code = generateUniqueRoomCode(existingIds);

        expect(code).not.toBe('100000');
        expect(code).toMatch(/^\d{6}$/);
    });

    it('throws after exceeding maxAttempts if every generated code collides', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        expect(() => generateUniqueRoomCode(['100000'], 5)).toThrow(
            'Failed to generate a unique room code after multiple attempts'
        );
    });
});