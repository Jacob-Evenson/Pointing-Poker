export const getVoteStats = (votes) => {
    const numbers = votes.filter((v) => typeof v === "number");

    if (numbers.length === 0) {
        return { low: null, high: null, average: null };
    }

    const low = Math.min(...numbers);
    const high = Math.max(...numbers);
    const total = numbers.reduce((sum, v) => sum + v, 0);
    const average = total / numbers.length;

    return { low, high, average };
};