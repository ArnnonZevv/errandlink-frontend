import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Logo, Button, Input, Card, Alert } from '../components/UI';
import { PasswordStrength, getStrength } from '../components/PasswordStrength';

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const strength = getStrength(password);
    const pwMatch = confirmPassword.length > 0 && password === confirmPassword;
    const pwMiss = confirmPassword.length > 0 && password !== confirmPassword;

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields.'); return;
        }
        if (strength.score < 3) { setError('Please choose a stronger password.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

        setError(''); setLoading(true);
        try {
            const res = await api.auth.register({ fullName, email, password, confirmPassword });
            if (res.success && res.data) {
                login(res.data.user, res.data.token);
                navigate('/dashboard');
            } else {
                setError(res.error?.message || 'Registration failed.');
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
            background: 'radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%), var(--bg)',
        }}>
            <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.5s ease both' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Logo size="lg" />
                    <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                        Your community errand network
                    </p>
                </div>

                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{
                            width: 52, height: 52,
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                            border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: 16,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, marginBottom: 16,
                        }}>📝</div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 24, fontWeight: 700,
                            color: 'var(--text-primary)', letterSpacing: '-0.4px',
                        }}>Create account</h1>
                        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                            Join the ErrandLink+ community
                        </p>
                    </div>

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Input
                            label="Full Name"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            autoComplete="name"
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                        />

                        {/* Password with strength */}
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <PasswordStrength password={password} />
                        </div>

                        {/* Confirm password */}
                        <div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={e => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                style={{
                                    borderColor: pwMiss ? 'var(--red)' : pwMatch ? 'var(--green)' : undefined,
                                }}
                            />
                            {pwMiss && (
                                <span style={{ fontSize: 12, color: 'var(--red)', marginTop: 4, display: 'block' }}>
                                    ⚠ Passwords do not match
                                </span>
                            )}
                            {pwMatch && (
                                <span style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, display: 'block' }}>
                                    ✓ Passwords match
                                </span>
                            )}
                        </div>

                        {error && <Alert type="error" message={error} />}

                        <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
                            Create Account
                        </Button>
                    </form>

                    <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}