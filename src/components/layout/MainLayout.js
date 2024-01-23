// src/components/layout/MainLayout.js

import React from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <Sidebar />
      </div>
      <div>{children}</div>
    </>
  );
};

export default MainLayout;
