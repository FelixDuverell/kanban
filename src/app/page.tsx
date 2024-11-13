"use client";

import React, { useState } from 'react';
import KanbanBoard from './Components/KanbanBoard';
import styles from './page.module.css';

export default function Page() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginTab, setIsLoginTab] = useState(true);

    // State för Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State för Signup
    const [signupEmail, setSignupEmail] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5285/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginEmail, password: loginPassword }),
                // credentials: 'include',
            });
            if (response.ok) {
                // const data = await response.json();
                // localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                setError(null);
            } else {
                const message = await response.text();
                setError(message || 'Inloggning misslyckades');
            }
        } catch (error) {
            console.error('Inloggningsfel:', error);
            setError('Serverfel');
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5285/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: signupEmail, 
                    username: signupUsername, 
                    password: signupPassword 
                })
            });
            if (response.ok) {
                // const data = await response.json();
                // localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                setError(null);
            } else {
                const message = await response.text();
                setError(message || 'Registrering misslyckades');
            }
        } catch (error) {
            console.error('Registreringsfel:', error);
            setError('Serverfel');
        }
    };

    // Funktion för att hoppa över inloggningen
    const skipLogin = () => {
        setIsLoggedIn(true);
    };

    if (isLoggedIn) {
        return <KanbanBoard />;
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Kanban Board</h1>
            <div className={styles.formContainer}>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${isLoginTab ? styles.activeTab : ''}`}
                        onClick={() => setIsLoginTab(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`${styles.tab} ${!isLoginTab ? styles.activeTab : ''}`}
                        onClick={() => setIsLoginTab(false)}
                    >
                        Signup
                    </button>
                </div>
                <form onSubmit={isLoginTab ? handleLogin : handleSignup} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}
                    {isLoginTab ? (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className={styles.input}
                            />
                            <input
                                type="password"
                                placeholder="Lösenord"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className={styles.input}
                            />
                            <button type="submit" className={styles.btn}>
                                Logga in
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                className={styles.input}
                            />
                            <input
                                type="text"
                                placeholder="Användarnamn"
                                value={signupUsername}
                                onChange={(e) => setSignupUsername(e.target.value)}
                                className={styles.input}
                            />
                            <input
                                type="password"
                                placeholder="Lösenord"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className={styles.input}
                            />
                            <button type="submit" className={styles.btn}>
                                Registrera
                            </button>
                        </>
                    )}
                </form>
                {/* Ny knapp för att hoppa över inloggning */}
                <button onClick={skipLogin} className={styles.skipBtn}>
                    Fortsätt utan att logga in
                </button>
            </div>
        </div>
    );
}
