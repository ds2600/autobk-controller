import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from './common/Loading';
import { toast } from 'react-toastify';
import Time from './common/Time';

const DevicePage = () => {
    const daysOfWeek = ['Disabled', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const { deviceId } = useParams();
    const [device, setDevice] = useState({});
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [formattedHour, setFormattedHour] = useState('');
    const [formattedLatestBackup, setFormattedLatestBackup] = useState('');
    const navigate = useNavigate();
    
    const token = localStorage.getItem('jwt');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    

    function formatHour(autoHour) {
        return new Date(autoHour * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: true });
    }

    function formatTime(completionTime) {
        return new Date(completionTime).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit', hour12: true });
    }
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/devices/${deviceId}`, config)
          .then(response => {
            setDevice(response.data)
            setTimeout(() => {
                setLoading(false);
            }, 1000);
          })
          .catch(error => {
            toast.error("Failed to load device");
            setTimeout(() => {
                setLoading(false);
            }, 1000);
          });
    }, [reload]);

    const reloadData = () => {
        setLoading(true);
        setReload(prev => !prev);
    }

    const handleBackupNowClick = () => {
        const time = new Date();
    
        axios.post(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/schedules/${deviceId}`, { scheduledTime: time }, config)
        .then((response) => {
            reloadData();
            toast.success('Backup scheduled');
        })
        .catch((error) => {
            toast.error('An error occurred while scheduling the backup: ' + error);          
        });
        
    }

    const downloadFile = async (fileId) => {
        try {
          const response = await axios({
            url: `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/download/${fileId}`,
            method: 'GET',
            responseType: 'blob',
            headers: { Authorization: `Bearer ${token}` }
          });
    
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          const contentDisposition = response.headers['content-disposition'];
          let fileName = 'file';
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
          }
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error('Error:', error);
          // handle any errors here
        }
      };
    
    if (loading) {
        return (
            <div className="m-10 p-10 flex items-center justify-center ">
                <Loading loading="true"/>
            </div>
        );
    }

    return (
        <div className="container w-full mx-auto mt-6 mb-6 text-slate-800">
            <div className="flex">
                <div className="w-1/2 pr-4">
                    <table className="table-auto w-full">
                        <tbody>
                            <tr>
                                <td className="text-center py-2 text-2xl font-bold" colSpan="2">{device.deviceInfo.name}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Device Type</td>
                                <td className="text-left pl-4 py-2">{device.deviceInfo.type}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Management IP</td>
                                <td className="text-left pl-4 py-2">{device.deviceInfo.ip}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Backup Day</td>
                                <td className="text-left pl-4 py-2">
                                    {device.deviceInfo.autoWeeks === 0 ? 'Daily' : daysOfWeek[device.deviceInfo.autoDay]}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Backup Hour</td>
                                <td className="text-left pl-4 py-2">{device ? formatHour(device.deviceInfo.autoHour) : ''}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Latest Backup</td>
                                <td className="text-left pl-4 py-2">{device && device.backups && device.backups[0] ? <Time time={device.backups[0].completionTime} /> : 'None'}</td>
                            </tr>
                            <tr>
                                <td className="text-right pr-4 py-2 text-slate-700 font-bold">Next Scheduled Backup</td>
                                <td className="text-left pl-4 py-2">{device && device.scheduledBackups && device.scheduledBackups[0] ? <Time time={device.scheduledBackups[0].scheduledTime} /> : 'None'}</td>
                            </tr>
                            {/* Add more rows as needed */}
                            <tr>
                                <td colSpan="2" className="text-center py-2">
                                    <button onClick={() => handleBackupNowClick()} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-2">Backup Now</button>
                                    <button onClick={() => navigate(`/devices/${device.deviceInfo.deviceId}/edit`) } className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded m-2">Edit</button>
                                    <button className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded m-2">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="w-1/2 pl-4">
                    <h2 className="text-xl font-bold mb-2 py-2">Backups:</h2>
                    {device.backups.length > 0 ? (
                        device.backups.map((backup, index) => (
                            <li key={index} className="mb-1">
                                <Link className="text-blue-500 hover:text-blue-700" onClick={() => downloadFile(backup.fileId)}>{backup.fileName.split('/').pop()}</Link>
                            </li>
                        ))
                    ) : (
                        <p>No backups</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DevicePage;