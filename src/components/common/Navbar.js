// components/common/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const SiteNavbar = () => {

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
    return (
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
                <button className="text-white px-2 hover:text-gray-300 focus:outline-none">
                    <Icon name="tool" className="h-6 w-6 fill-current" />
                </button>

                <div className="relative" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
                    <button className="text-white hover:text-gray-300 focus:outline-none flex items-center">
                    <Icon name="user" className="h-6 w-6 fill-current" />
                    <span className="ml-2">Username</span>
                    </button>
                    {isDropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <ul className="py-2">
                        <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">Profile</a></li>
                        <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">Logout</a></li>
                        </ul>
                    </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default SiteNavbar;
