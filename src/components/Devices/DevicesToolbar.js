// src/components/common/DevicesToolbar.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { Button } from 'flowbite-react';

function DevicesToolbar({ updateDevices }) {
    const navigate = useNavigate();

    const handleRefreshClick = () => {
        updateDevices();
    }

    return (
        <div className="pb-4 flex justify-between">
            <div className="flex">
            
                <button 
                    className="text-slate-800 hover:text-slate-500 focus:outline-none flex items-center mr-4"
                    onClick={() => handleRefreshClick()}    
                >
                    <Icon name="refresh-cw" className="h-6 w-6 fill-current" />
                    <span className="ml-2">Refresh</span>
                </button>
                <button 
                    className="text-slate-800 hover:text-slate-500 focus:outline-none flex items-center mr-4"
                    onClick={() => navigate('/add-device')}    
                >
                    <Icon name="plus-circle" className="h-6 w-6 fill-current" />
                    <span className="ml-2">Add Device</span>
                </button>
            </div>
        </div>
    );
}

export default DevicesToolbar;