// src/components/dashboard/Dashboard.js
import React, { useState } from 'react';
import './Dashboard.css';
import Home from './component/Home';
import Expert from './component/Expert';
import Exercise from './component/Exercise';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Home');

    const renderContent = () => {
        switch (activeTab) {
            case 'Home':
                return <Home />;
            case 'Expert':
                return <Expert />;
            case 'Exercise':
                return <Exercise />;
            default:
                return <h2>Welcome</h2>;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h1>Mental Health</h1>
                <ul>
                    <li onClick={() => setActiveTab('Home')} className={activeTab === 'Home' ? 'active' : ''}>
                        Home
                    </li>
                    <li onClick={() => setActiveTab('Expert')} className={activeTab === 'Expert' ? 'active' : ''}>
                        Expert
                    </li>
                    <li onClick={() => setActiveTab('Exercise')} className={activeTab === 'Exercise' ? 'active' : ''}>
                        Exercise
                    </li>
                    <li onClick={() => alert("Logged out")}>Logout</li>
                </ul>
            </aside>
            <main className="main-content">
                <header className="header">
                    <h2>Mental Health</h2>
                    <nav>
                        <span onClick={() => setActiveTab('Home')} className={activeTab === 'Home' ? 'active' : ''}>
                            Home
                        </span>
                        <span onClick={() => setActiveTab('Expert')} className={activeTab === 'Expert' ? 'active' : ''}>
                            Expert
                        </span>
                        <span onClick={() => setActiveTab('Exercise')} className={activeTab === 'Exercise' ? 'active' : ''}>
                            Exercise
                        </span>
                    </nav>
                </header>
                <div className="content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
