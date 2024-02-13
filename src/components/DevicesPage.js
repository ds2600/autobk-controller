// src/components/DevicesPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './common/Loading';
import Icon from './common/Icon';
import DevicesToolbar from './Devices/DevicesToolbar';
import { toast } from 'react-toastify';
import SkeletonRow from './Devices/SkeletonRow';
import DevicesTable from './Devices/DevicesTable';

function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const token = localStorage.getItem('jwt');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/devices`, config)
          .then(response => {
            setDevices(response.data)
            
            setTimeout(() => {
                setLoading(false);
            }, 100);
          })
          .catch(error => {
            toast.error(error);
            setTimeout(() => {
                setLoading(false);
            }, 500);
          });
    }, [reload]);

    const reloadData = (rowOnly = false) => {
        if (!rowOnly) {
            setLoading(true);
        }
        setReload(prev => !prev);
    }

    const devicesTableProps = {
        pagination: true,
        defaultSortFieldId: 1,
        highlightOnHover: true,
        striped: true,
        
    }

    return (
        <div className="container w-full mx-auto mt-6 mb-6">
            <DevicesToolbar updateDevices={reloadData} />
            <div className="flex flex-row flex-col">
                <DevicesTable
                    refresh={reloadData}
                    loading={loading}
                    devices={devices} 
                    {...devicesTableProps}
                />
            </div>
        </div>
    )
}

export default DevicesPage;