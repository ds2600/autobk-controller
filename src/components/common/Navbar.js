// components/common/Navbar.js
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const SiteNavbar = () => {

    const { userEmail, userLevel, logout } = useContext(AuthContext);
    const [isProcessRunning, setIsProcessRunning] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const showDropdown = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setIsDropdownVisible(true);
    };

    const hideDropdown = () => {
        setHoverTimeout(
        setTimeout(() => {
            setIsDropdownVisible(false);
        }, 100) 
        );
    };

    useEffect(() => {
        const invervalId = setInterval(async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/running`);
                setIsProcessRunning(response.data.running);
            } catch (error) {
                toast.error('An error occurred while checking the process');
            }
        }, 120000);

        return () => clearInterval(invervalId);
    }, []);
    return (
        <>
            <nav className="bg-slate-800 p-4 flex justify-between items-stretch">
            <div className="flex items-center mr-4">
                <img src="/AutoBk.svg" alt="AutoBk Controller" className="h-10" />
                <div className="flex flex-col ml-2 items-center">
                    <span className="text-white text-2xl">AutoBk</span>
                    <span className="text-white uppercase text-xs tracking-widest" style={{ letterSpacing: '0.1em' }}>Controller</span>
                </div>
            </div>

            <ul className="flex items-stretch">
                <li className="flex items-center ">
                <Link to="/devices" className="text-white hover:text-gray-300 px-4 flex items-center">Devices</Link>
                </li>
                <li className="flex items-center ">
                <Link to="#" className="text-white hover:text-gray-300 px-4 flex items-center">Backups</Link>
                </li>
                <li className="flex items-center ">
                <Link to="#" className="text-white hover:text-gray-300 px-4 flex items-center">Reports</Link>
                </li>
                <li className="flex items-center ">
                <Link to="/about" className="text-white hover:text-gray-300 px-4 flex items-center">About</Link>
                </li>
            </ul>
    
            <div className="flex-grow"></div>
    
            <div className="relative flex items-center">
                
                <button className="px-2 focus:outline-none">
                <Icon 
                    name={isProcessRunning ? 'play-circle' : 'x-octagon'} 
                    className={`h-6 w-6 fill-current ${isProcessRunning ? 'text-green-500' : 'text-red-500'}`}
                />
                </button>

                <div className="relative" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
                    <button className="text-white hover:text-gray-300 focus:outline-none flex items-center">
                        <Icon name="user" className="h-6 w-6 fill-current" />
                        <span className="ml-2">{ userEmail }</span>
                    </button>
                    {isDropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <ul className="py-2">
                            <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-slate-300 hover:text-slate-800">Profile</a></li>
                            <li><a href="#" onClick={logout} className="block px-4 py-2 text-gray-800 hover:bg-slate-300 hover:text-slate-800">Logout</a></li>
                            <li><div className="border-t border-gray-300 my-2"></div></li>
                            {userLevel === 'Administrator' && (
                                <li>
                                    <a href="/app-settings" className="block px-4 py-2 text-gray-800 hover:bg-slate-300 hover:text-slate-800">
                                        App Settings
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                    )}
                </div>
            </div>
        </nav>
        {!isProcessRunning && (
        <div className="bg-red-500 p-2 flex justify-center items-center">
                <Icon 
                    name='x-octagon'
                    className={`fill-current`}
                />
                <span className="ml-2">AutoBk Service is not running</span>
        </div>
        )}
    </>
    );
};

export default SiteNavbar;
