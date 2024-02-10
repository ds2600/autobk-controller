// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import './App.css';

import SiteNavbar from './components/common/Navbar';

import LoginPage from './components/LoginPage';
import DevicesPage from './components/DevicesPage';
import AddDevicePage from './components/AddDevicePage';
import EditDevicePage from './components/EditDevicePage';
import AboutPage from './components/AboutPage';
import Loading from './components/common/Loading';
import DownloadRoute from './components/DownloadRoute';

function MainLayout({ children }) {
  return (
    <>
      <SiteNavbar />
      {children}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Navigate to="/devices" />} />
            <Route path="/login" element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <Navigate to="/devices" />;
                  } else {
                    return <LoginPage />;
                  }
                }}
              </AuthContext.Consumer>
          } />
            <Route path="/devices" element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <MainLayout><DevicesPage/></MainLayout>;
                  } else {
                    return <Navigate to="/login" />;
                  }
                }}
              </AuthContext.Consumer>
            }/>
            <Route path="/add-device"  element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <MainLayout><AddDevicePage/></MainLayout>;
                  } else {
                    return <Navigate to="/login" />;
                  }
                }}
              </AuthContext.Consumer>
            }/>
            <Route path="/devices/edit/:id" element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <MainLayout><EditDevicePage/></MainLayout>;
                  } else {
                    return <Navigate to="/login" />;
                  }
                }}
              </AuthContext.Consumer>
            }/>
            <Route path="/download/:fileId"  element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <DownloadRoute/>;
                  } else {
                    return <Navigate to="/login" />;
                  }
                }}
              </AuthContext.Consumer>
            }/>
            <Route path="/about"  element={
              <AuthContext.Consumer>
                {({ isLoggedIn }) => {
                  if (isLoggedIn) {
                    return <MainLayout><AboutPage/></MainLayout>;
                  } else {
                    return <Navigate to="/login" />;
                  }
                }}
              </AuthContext.Consumer>
            }/>
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
    </AuthProvider>
  );
}

export default App;
