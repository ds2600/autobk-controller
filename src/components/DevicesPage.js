// src/components/DevicesPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './common/Loading';
import Icon from './common/Icon';
import DeviceRow from './common/DeviceRow';
import { toast } from 'react-toastify';

function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

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
            toast.error(error);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
          });
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container w-full mx-auto mt-6 mb-6">
            <div className="pb-4">
            <button className="text-slate-800 hover:text-slate-500 focus:outline-none flex items-center">
                <Icon name="plus-circle" className="h-6 w-6 fill-current" />
                <span className="ml-2">Add Device</span>
            </button>
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
                                        <DeviceRow device={device} key={device.deviceId} />
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