import React, { useState, useEffect } from 'react'

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

    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
    const remainingSeconds = String(seconds % 60).padStart(2, '0')

    return (
        <div className="timer-controls">
            <p className="timer-value">{minutes}:{remainingSeconds}</p>
            <button type="button" onClick={handleButtonClick}>
                {running ? "Pause" : "Start"}
            </button>
            <button type="button" onClick={handleResetClick}>
                Reset
            </button>
        </div>
    );
}

export default SessionTimer;