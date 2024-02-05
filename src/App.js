// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

import SiteNavbar from './components/common/Navbar';

import IndexPage from './components/IndexPage';
import LoginPage from './components/LoginPage';
import DevicesPage from './components/DevicesPage';
import EditDevicePage from './components/EditDevicePage';
import AboutPage from './components/AboutPage';
import Loading from './components/common/Loading';


function App() {
  // Check authentication status and user level here

  return (
    <Router>
      <div>
        <SiteNavbar />
        <Routes>
          <Route path="/" element={<IndexPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/devices" element={<DevicesPage/>} />
          <Route path="/devices/edit/:id" element={<EditDevicePage/>} />
          <Route path="/about" element={<AboutPage/>} />
          <Route path="/loading" element={<Loading/>} />
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={5000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          pauseOnHover
          theme='colored'  
        />
      </div>
    </Router>
  );
}

export default App;
