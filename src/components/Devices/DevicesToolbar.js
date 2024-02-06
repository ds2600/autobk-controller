// src/components/common/DevicesToolbar.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { Button } from 'flowbite-react';
import PageButtons from './PageButtons';

function DevicesToolbar({ handleRowsPerPageChange, updateDevices, handlePageChange, currentPage, rowsPerPage, devicesLength}) {
    const navigate = useNavigate();

    const handleRefreshClick = () => {
        updateDevices();
    }

    return (
        <div className="pb-4 flex justify-between">
            <div className="flex">
            
                <label className="mr-4">
                    <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        {[10, 20, 30, 50].map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                        <option value={devicesLength}>All</option>
                    </select>
                </label>
            
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
            <PageButtons handlePageChange={handlePageChange} currentPage={currentPage} devicesLength={devicesLength} rowsPerPage={rowsPerPage}/>
        </div>
    );
}

export default DevicesToolbar;