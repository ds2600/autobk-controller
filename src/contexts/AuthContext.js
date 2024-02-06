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

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserLevel(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userLevel, setUserLevel, userEmail, setUserEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};