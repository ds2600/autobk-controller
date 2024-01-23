// components/common/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            {/* Navigation links */}
            <NavLink to="/devices">Devices</NavLink>
            {/* ...other links... */}
        </aside>
    );
};

export default Sidebar;
