import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Time = ({ time }) => {
    const tz = localStorage.getItem('userTimezone');

    return (
        <span>
            {new Date(time).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz })} {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz })}
        </span>
    );
}

export default Time;