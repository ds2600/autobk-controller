// src/components/DevicesPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Loading from './common/Loading';

function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJMZXZlbCI6IkFkbWluaXN0cmF0b3IiLCJpYXQiOjE3MDcwODI3NDUsImV4cCI6MTcwNzY4NzU0NX0.TSb3oMBWxA5tEYi_tnO5VqMopbeMTpUC6fHxMZYE4iU';
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/devices`, config)
          .then(response => {
            setDevices(response.data)
            setTimeout(() => {
                setLoading(false);
            }, 1000);
          })
          .catch(error => {
            console.error(error)
            setTimeout(() => {
                setLoading(false);
            }, 1000);
          });
    }, []);

    const handleEditClick = (deviceId) => {
        navigate(`/devices/edit/${deviceId}`);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container w-full mx-auto mt-6 mb-6">
            <div className="flex flex-row flex-col pb-4">
            <Button 
                color="dark" 
                size="xs" 
                className="p-2 hover:bg-slate-700">
                    Add Device
            </Button>
            </div>
            <div className="flex flex-row flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="border-b bg-gray-800">
                                    <tr>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Name
                                        </th>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Type
                                        </th>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Mgmt IP
                                        </th>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Latest Backup
                                        </th>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Next Backup
                                        </th>
                                        <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.map(device => (
                                        <tr className="bg-white border-b">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{device.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.ip}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.latestBackup ? new Date(device.latestBackup.completionTime).toLocaleString() : "No latest backup"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.nextSchedule ? new Date(device.nextSchedule.scheduledTime).toLocaleString() : "No scheduled backups"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-start gap-2">
                                                    <Button 
                                                        onClick={() => handleEditClick(device.deviceId)}
                                                        color="dark"
                                                        size="xs"
                                                        className="p-2 hover:bg-slate-700">
                                                            Edit
                                                    </Button>
                                                    <Button 
                                                        color="dark" 
                                                        size="xs" 
                                                        className="p-2 hover:bg-slate-700">
                                                            Backup Now
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DevicesPage;