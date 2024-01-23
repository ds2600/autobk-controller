// components/DevicesPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve the token from local storage
        const token = localStorage.getItem('token');

        // Set up axios headers
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/devices`, config)
            .then(response => setDevices(response.data))
            .catch(error =>  {
                console.error('Error fetching devices: ', error);
            });
        }, [navigate]);

    return (
        <div className="container mx-auto mt-10">
            <div className="flex flex-col">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.ip}</td>
                                            {/* You'll need to adjust these fields based on how you're fetching the data */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Latest Backup */}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Next Scheduled Backup */}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {/* Action buttons */}
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
    );
};

export default DevicesPage;
