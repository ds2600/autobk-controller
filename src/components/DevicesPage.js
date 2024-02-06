// src/components/DevicesPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './common/Loading';
import Icon from './common/Icon';
import DeviceRow from './Devices/DeviceRow';
import DevicesToolbar from './Devices/DevicesToolbar';
import { toast } from 'react-toastify';
import DevicesFooter from './Devices/DevicesFooter';
import SkeletonRow from './Devices/SkeletonRow';

function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const token = localStorage.getItem('jwt');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    
    useEffect(() => {
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
    }, [reload]);

    const reloadData = (rowOnly = false) => {
        if (!rowOnly) {
            setLoading(true);
        }
        setReload(prev => !prev);
        setCurrentPage(1);
    }

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(event.target.value);
        setCurrentPage(1);
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    }

    const devicesToShow = devices.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="container w-full mx-auto mt-6 mb-6">
            <DevicesToolbar handleRowsPerPageChange={handleRowsPerPageChange} updateDevices={reloadData} handlePageChange={handlePageChange} currentPage={currentPage} rowsPerPage={rowsPerPage} devicesLength={devices.length}/>
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
                                    { loading ? (
                                    <>
                                        {[...Array(10)].map((_, i) => (
                                            <SkeletonRow key={i} colspan={6} />
                                        ))}
                                    </>
                                    ) : (
                                        devicesToShow.map(device => (
                                            <DeviceRow config={config} device={device} updateDevices={reloadData} key={device.deviceId} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <DevicesFooter handleRowsPerPageChange={handleRowsPerPageChange} handlePageChange={handlePageChange} currentPage={currentPage} rowsPerPage={rowsPerPage} devicesLength={devices.length}/>
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DevicesPage;