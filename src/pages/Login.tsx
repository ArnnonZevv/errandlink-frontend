import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Logo, Button, Input, Card, Alert } from '../components/UI';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
        setError(''); setLoading(true);
        try {
            const res = await api.auth.login({ email, password });
            if (res.success && res.data) {
                login(res.data.user, res.data.token);
                navigate('/dashboard');
            } else {
                setError(res.error?.message || 'Login failed.');
            }
        } catch {
            setError('Cannot connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
            background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), var(--bg)',
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.5s ease both' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Logo size="lg" />
                    <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                        Your community errand network
                    </p>
                </div>

                <Card>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{
                            width: 52, height: 52,
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.1))',
                            border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: 16,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, marginBottom: 16,
                        }}>🔐</div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 24, fontWeight: 700,
                            color: 'var(--text-primary)', letterSpacing: '-0.4px',
                        }}>Welcome back</h1>
                        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                            Sign in to your ErrandLink+ account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        {error && <Alert type="error" message={error} />}

                        <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
                            Sign In
                        </Button>
                    </form>

                    <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            Sign up
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}