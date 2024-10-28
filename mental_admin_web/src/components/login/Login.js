import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
                email,
                password,
            });

            setMessage('Login successful');
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (err) {
            if (err.response && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Something went wrong. Please try again later.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-form">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="login-button" type="submit">Sign in</button>

                        {/* Hiển thị lỗi nếu có */}
                        {error && <p className="error">{error}</p>}

                        {/* Hiển thị thông báo thành công */}
                        {message && <p className="message">{message}</p>}

                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </form>

                    <p className="register-text">
                        Don’t have an account yet? <a href="#">Register for free</a>
                    </p>
                </div>

                <div className="login-image">
                    <img src="/images/login_item.png" alt="login item" />
                </div>
            </div>
        </div>
    );
};

export default Login;
