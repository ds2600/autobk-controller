import React, { useState, useEffect } from 'react';

const TimeDisplay = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const fetchTime = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/server-time`);
            const data = await response.json();
            setTime(data.time);
        };

        fetchTime();

        const intervalId = setInterval(fetchTime, 60 * 1000); // Update every minute

        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);

    return (
        <div className="fixed bottom-0 w-full text-center bg-white bg-opacity-50 text-slate-700 text-sm p-2">
            {time} UTC
        </div>
    );
};

export default TimeDisplay;