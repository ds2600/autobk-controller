// src/components/AddDevicePage.js

'use client';

import React, { useEffect, useState } from 'react';
import { 
    Button,
    Label,
    TextInput,
    Select,
    Alert
} from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from './common/Icon';
import Loading from './common/Loading';
import { toast } from 'react-toastify';

function AddDevicePage() {
    const [loading, setLoading] = useState(true);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [alert, setAlert] = useState({active: false, message: ''});
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const [changesMade, setChangesMade] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/device-types`)
            .then(response => {
                setDeviceTypes(response.data)
                setLoading(false);
            })
            .catch(error => {
                toast.error("Failed to load Device Types: " + error);
                setLoading(false);
            });

    }, []);

    function isValidIP(ip) {
        const ipFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipFormat.test(ip);
    }

    function handleSave() {
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;
        const mgmtIP = document.getElementById('mgmtIP').value;
        const autoDay = document.getElementById('autoDay').value;
        const autoHour = document.getElementById('autoHour').value;
        const autoWeeks = document.getElementById('autoWeeks').value;

        if (!name || !mgmtIP) {
            setAlert({active: true, message: 'Name and Management IP are required', color: 'red'});
            return;
        } else if (!isValidIP(mgmtIP)) {
            setAlert({active: true, message: 'Invalid Management IP', color: 'red'});
            return;
        } else {
            setAlert({active: false, message: ''});
        }

        const data = {
            name: name,
            type: type,
            ip: mgmtIP,
            autoDay: autoDay,
            autoHour: autoHour,
            autoWeeks: autoWeeks
        };

        axios.post(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/devices`, data, config)
            .then(response => {
                toast.success(`${response.data.name} added successfully`);
                navigate('/devices');
            })
            .catch(error => {
                toast.error("Failed to add device: " + error);
            });
    }



    if (loading) {
        return <Loading/>;
    }

    return (
        <>
            <div className="container max-w-lg mx-auto mt-6 mb-6">
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Device</h1>
            </div>
            { alert.active && (
                <div id="alert-border-2" className={`mt-6 flex items-center p-4 mb-2 text-${alert.color}-800 border-t-4 border-${alert.color}-300 bg-${alert.color}-50 dark:text-${alert.color}-400 dark:bg-gray-800 dark:border-${alert.color}-800`} role="alert">
                    <Icon name="info" />
                    <div class="ms-3 text-sm font-medium">
                        { alert.message }
                    </div>
                </div>
            )}
            <form className="bg-white-200 shadow-md rounded px-8 pt-2 pb-8 mb-4">
                <div className="max-w-md">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="name">
                            Device Name
                        </Label>
                    </div>
                    <TextInput 
                        id="name" 
                        placeholder="Device Name"
                        required 
                    />
                </div>
                <div className="max-w-md">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="type">Device Type</Label>
                    </div>
                    <Select id="type">
                        {deviceTypes.map((deviceType, index) => (
                            deviceType.dbValue !== 'OneNetLog' && (
                                <option key={index} value={deviceType.dbValue}>{deviceType.readableValue}</option>
                            )
                            
                        ))}
                    </Select>
                </div>
                <div className="max-w-md">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="mgmtIP">
                            Management IP
                        </Label>
                    </div>
                    <TextInput 
                        id="mgmtIP" 
                        placeholder="Management IP"
                        required 
                    />
                </div>
                <div className="max-w-md">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="autoDay">Backup Day</Label>
                    </div>
                    <Select id="autoDay">
                        <option value="0">Disabled</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="7">Sunday</option>
                    </Select>
                </div>
                <div className="max-w-md">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="autoHour">Backup Hour</Label>
                    </div>
                    <Select id="autoHour">
                        <option value="0">Midnight</option>
                        <option value="1">1 AM</option>
                        <option value="2">2 AM</option>
                        <option value="3">3 AM</option>
                        <option value="4">4 AM</option>
                        <option value="5">5 AM</option>
                        <option value="6">6 AM</option>
                        <option value="7">7 AM</option>
                        <option value="8">8 AM</option>
                        <option value="9">9 AM</option> 
                        <option value="10">10 AM</option>
                        <option value="11">11 AM</option>
                        <option value="12">12 AM</option>
                        <option value="13">1 PM</option>
                        <option value="14">2 PM</option>
                        <option value="15">3 PM</option>
                        <option value="16">4 PM</option>
                        <option value="17">5 PM</option>
                        <option value="18">6 PM</option>
                        <option value="19">7 PM</option>
                        <option value="20">8 PM</option>
                        <option value="21">9 PM</option>
                        <option value="22">10 PM</option>
                        <option value="23">11 PM</option>
                    </Select>
                </div>
                <div className="max-w-md mb-6">
                    <div className="mb-2 pt-2 block">
                        <Label htmlFor="autoWeeks">Backup Interval (Weeks)</Label>
                    </div>
                    <Select id="autoWeeks">
                        <option value="0">Disabled</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="7">Sunday</option>
                    </Select>
                </div>
                <div className="flex justify-between w-full">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleSave() } 
                            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded m-2">
                            Save
                        </button>

                        <button
                            onClick={() => navigate('/devices')}
                            className="bg-yellow-400 hover:bg-yellow-600 text-white py-2 px-4 rounded m-2">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
            </div>
        </>
    )
}

export default AddDevicePage;