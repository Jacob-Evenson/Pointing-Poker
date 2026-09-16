import React, { useEffect, useState } from 'react';

const SessionsTimer = () => {
    const [seconds, setSeconds] = useState(0);
    
    useEffect(() => {
        const interval = setInterval (() => {
            setSeconds((prevSeconds) => prevSeconds + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const second = seconds % 60;

    const formattedTime =
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(second).padStart(2, "0");

  return (
    <div>{formattedTime}</div>
  )
}

export default SessionsTimer