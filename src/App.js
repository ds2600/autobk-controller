// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import DevicesPage from './components/DevicesPage';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './components/LoginPage';

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/devices" element={
            <MainLayout><DevicesPage /></MainLayout> 
          } />
        {/* Redirect to /devices as a default route */}
        <Route path="/" element={ <Navigate to="/devices"/> }/>
        </Routes>
      </Router>
  );
}

export default App;
