import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import { BarLoader } from 'react-spinners';

const LoginForm = () => {
    const { setIsLoggedIn, setUserLevel, setUserEmail, setUserTimezone } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        setLoading(true);
        event.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                setLoading(false);
                toast.error("Login failed. Please check your email and password.");
            } else {
                const { token, userLevel, userEmail, userTimezone } = await response.json();

                localStorage.setItem('jwt', token);
                localStorage.setItem('userLevel', userLevel);
                localStorage.setItem('userEmail', userEmail);
                localStorage.setItem('userTimezone', userTimezone);

                setIsLoggedIn(true);
                setUserLevel(userLevel);
                setUserEmail(userEmail);
                setUserTimezone(userTimezone);
                setLoading(false);
                toast.success("Login successful.");
                <Navigate to="/login" />
            }

            
        } catch (error) {
            setLoading(false);
            toast.error("Login failed. Please check your email and password.");
        }

    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-10 bg-white rounded-lg shadow-xl">
            <div className="flex flex-col items-center">
            <div className="mb-6">
                <img src="/AutoBk.svg" alt="AutoBk Controller" className="h-48" /> 
            </div>
            <div className="mb-2">
                <BarLoader
                    color="#334155" 
                    loading={loading}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
            <form onSubmit={handleSubmit} className="w-80">
                <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
                </div>
                <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
                </div>
                <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Sign In
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
};

export default LoginForm;
