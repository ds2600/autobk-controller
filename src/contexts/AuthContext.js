import React from 'react';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    const token = localStorage.getItem('jwt');
    
    return !!token;
  });

  const [userLevel, setUserLevel] = React.useState(() => {
    const userLevel = localStorage.getItem('userLevel');
    return userLevel;
  });

  const [userEmail, setUserEmail] = React.useState(() => {
    return localStorage.getItem('userEmail');
  });

  const [userTimezone, setUserTimezone] = React.useState(() => {
    return localStorage.getItem('userTimezone');
  });

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userTimezone');
    setIsLoggedIn(false);
    setUserLevel(null);
    setUserEmail(null);
    setUserTimezone(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userLevel, setUserLevel, userEmail, setUserEmail, userTimezone, setUserTimezone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};