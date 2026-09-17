import { useState, useEffect } from 'react'

const SessionTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (running === false) {
            return;
        }

        const interval = setInterval(() => {
            setSeconds((currentSeconds) => {
                return currentSeconds + 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [running]);

    const handleButtonClick = () => {
        if (running === true) {
            setRunning(false);
        } else {
            setRunning(true);
        }
    };

    const handleResetClick = () => {
        setSeconds(0);
        setRunning(false);
    };

    return (
        <div>
            <p>Seconds: {seconds}</p>
            <button onClick={handleButtonClick}>
                {running ? "Pause" : "Start"}
            </button>
            <br />
            <button onClick={handleResetClick}>
                Reset
            </button>
        </div>
    );
}

export default SessionTimer;