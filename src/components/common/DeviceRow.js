import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function DeviceRow({ device }) {
    const [allowEdit, setAllowEdit] = useState(false);
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
        toast.info("Backup scheduled");
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