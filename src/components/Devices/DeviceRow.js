import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SkeletonRow from './SkeletonRow';

function DeviceRow({ config, device, updateDevices }) {
    const [allowEdit, setAllowEdit] = useState(false);
    const [rowLoading, setRowLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (device.type === "OneNetLog") {
            setAllowEdit(false);
        } else {
            setAllowEdit(true);
        }
    }, [device.type]);

    const handleEditClick = (deviceId) => {
        navigate(`/devices/edit/${deviceId}`);
    };

    const handleBackupNowClick = () => {
        setRowLoading(true);
        const time = new Date();
    
        axios.post(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/schedules/${device.deviceId}`, { scheduledTime: time }, config)
        .then((response) => {
            updateDevices(true);
            setTimeout(() => {
                setRowLoading(false);
            }, 300);
            toast.success('Backup scheduled');
        })
        .catch((error) => {
            setRowLoading(false);
            toast.error('An error occurred while scheduling the backup: ' + error);          
        });
        
    }

    if (rowLoading) {
        return <SkeletonRow colspan="6" />;
    }

    return (
        <tr className="bg-white border-b">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{device.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.ip}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.latestBackup ? new Date(device.latestBackup.completionTime).toLocaleString() : "No latest backup"}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.nextSchedule ? new Date(device.nextSchedule.scheduledTime).toLocaleString() : "No scheduled backups"}</td>
            <td className="px-6 py-4">
                <div className="flex flex-wrap items-start gap-2">
                {allowEdit && (
                    <Button 
                        onClick={() => handleEditClick(device.deviceId)}
                        color="dark"
                        size="xs"
                        className="p-2 hover:bg-slate-700">
                            Edit
                    </Button>
                )}
                    <Button 
                        onClick={() => handleBackupNowClick(device.deviceId)}
                        color="dark" 
                        size="xs" 
                        className="p-2 hover:bg-slate-700">
                            Backup Now
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export default DeviceRow;