import React, { useState, useEffect } from 'react';

const LogViewer = () => {
    const [selectedTab, setSelectedTab] = useState('log1');
    const [logContent, setLogContent] = useState('');

    useEffect(() => {
        const fetchLog = async () => {
            // Replace this with the actual API call to fetch the log file
            const response = await fetch(`/api/logs/${selectedTab}`);
            const data = await response.text();
            setLogContent(data);
        };

        fetchLog();
    }, [selectedTab]);

    return (
        <div>
            <div className="flex space-x-4">
                <button onClick={() => setSelectedTab('log1')} className={selectedTab === 'log1' ? 'bg-blue-500 text-white' : ''}>Log 1</button>
                <button onClick={() => setSelectedTab('log2')} className={selectedTab === 'log2' ? 'bg-blue-500 text-white' : ''}>Log 2</button>
                <button onClick={() => setSelectedTab('log3')} className={selectedTab === 'log3' ? 'bg-blue-500 text-white' : ''}>Log 3</button>
            </div>
            <textarea readOnly value={logContent} className="w-full h-64 mt-4"/>
        </div>
    );
};

export default LogViewer;