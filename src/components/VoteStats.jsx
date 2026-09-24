import { getVoteStats } from './voteStats.js'

const VoteStats = ({ votes }) => {
    const stats = getVoteStats(votes);

    if (stats.low === null) {
        return <p>No votes yet</p>;
    }

    return (
        <div>
            <p>Low: {stats.low}</p>
            <p>Average: {stats.average.toFixed(1)}</p>
            <p>High: {stats.high}</p>
        </div>
    );
}

export default VoteStats;