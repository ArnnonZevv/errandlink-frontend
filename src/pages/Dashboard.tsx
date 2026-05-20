import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Errand } from '../api';
import { useAuth } from '../context/AuthContext';
import { Logo, Button, Badge, TrustBar, Alert, Spinner } from '../components/UI';

const ERRAND_EMOJIS: Record<string, string> = {
    grocery: '🛒', groceries: '🛒', food: '🍔',
    dog: '🐶', pet: '🐾', walk: '🚶',
    package: '📦', parcel: '📦', deliver: '📦',
    clean: '🧹', wash: '🧺', laundry: '🧺',
    repair: '🔧', fix: '🔧', assemble: '🔧',
    buy: '🛍️', pick: '📦', fetch: '🏃',
};

function getEmoji(title: string) {
    const lower = title.toLowerCase();
    for (const [key, emoji] of Object.entries(ERRAND_EMOJIS)) {
        if (lower.includes(key)) return emoji;
    }
    return '📋';
}

function statusColor(status: string): 'blue' | 'amber' | 'green' | 'red' | 'gray' {
    return status === 'OPEN' ? 'blue'
        : status === 'ACCEPTED' ? 'amber'
            : status === 'COMPLETED' ? 'green'
                : status === 'CANCELLED' ? 'red' : 'gray';
}

type Tab = 'browse' | 'mytasks' | 'history';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState<Tab>('browse');
    const [errands, setErrands] = useState<Errand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);

    // Post errand modal state
    const [showPost, setShowPost] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postDesc, setPostDesc] = useState('');
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState('');

    useEffect(() => { fetchErrands(); }, [tab]);

    async function fetchErrands() {
        setLoading(true); setError('');
        try {
            const statusMap: Record<Tab, string> = {
                browse: 'OPEN', mytasks: 'ACCEPTED', history: 'COMPLETED',
            };
            const res = await api.errands.list(statusMap[tab]);
            if (res.success && res.data) setErrands(res.data);
            else setError('Could not load errands.');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleAccept(id: string) {
        setActionId(id);
        try {
            const res = await api.errands.accept(id);
            if (res.success) fetchErrands();
            else setError(res.error?.message || 'Could not accept errand.');
        } catch { setError('Network error.'); }
        finally { setActionId(null); }
    }

    async function handlePost(e: React.FormEvent) {
        e.preventDefault();
        if (!postTitle.trim()) { setPostError('Title is required.'); return; }
        setPostLoading(true); setPostError('');
        try {
            const res = await api.errands.create({
                title: postTitle, description: postDesc, rewardType: 'TRUST_POINTS',
            });
            if (res.success) {
                setShowPost(false); setPostTitle(''); setPostDesc('');
                if (tab === 'browse') fetchErrands();
            } else {
                setPostError(res.error?.message || 'Could not post errand.');
            }
        } catch { setPostError('Network error.'); }
        finally { setPostLoading(false); }
    }

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const initials = user?.fullName?.[0]?.toUpperCase() ?? '?';
    const displayName = user?.fullName || user?.email || 'User';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>

            {/* ── Top Nav ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(11,17,32,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                padding: '0 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 60,
            }}>
                <Logo size="md" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                        fontSize: 12, color: 'var(--text-secondary)',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 99, padding: '4px 12px',
                    }}>📍 Cebu City</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            fontSize: 12, color: 'var(--text-secondary)',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            borderRadius: 99, padding: '4px 12px', cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                        }}
                    >Sign out</button>
                </div>
            </nav>

            <div style={{
                maxWidth: 560, margin: '0 auto', padding: '24px 16px',
                display: 'flex', flexDirection: 'column', gap: 16,
            }}>

                {/* ── Profile Card ── */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)', padding: '24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    boxShadow: 'var(--shadow-glow)',
                    animation: 'fadeUp 0.4s ease both',
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 800, color: '#fff',
                        fontFamily: 'var(--font-display)',
                        border: '3px solid rgba(59,130,246,0.3)',
                        boxShadow: '0 0 0 4px rgba(59,130,246,0.1)',
                    }}>{initials}</div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                        }}>{displayName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {user?.role === 'HELPER' ? '⭐ Helper' : '👤 Requester'} · Cebu City
                        </div>
                    </div>

                    {/* Trust bar */}
                    <div style={{ width: '100%', marginTop: 4 }}>
                        <TrustBar points={user?.trustPoints ?? 0} />
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 4 }}>
                        {[
                            { label: 'Trust Points', value: `${user?.trustPoints ?? 0} pts` },
                            { label: 'Role', value: user?.role ?? 'REQUESTER' },
                            { label: 'Status', value: '🟢 Active' },
                        ].map(s => (
                            <div key={s.label} style={{
                                flex: 1, background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)', borderRadius: 12,
                                padding: '12px 8px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={{
                    display: 'flex', gap: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: 6,
                }}>
                    {([
                        { id: 'browse', label: '🔍 Browse' },
                        { id: 'mytasks', label: '📋 My Tasks' },
                        { id: 'history', label: '🕐 History' },
                    ] as const).map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            flex: 1, padding: '8px',
                            borderRadius: 8, border: 'none',
                            background: tab === t.id ? 'var(--accent)' : 'transparent',
                            color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'var(--font-body)',
                            transition: 'all 0.15s',
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* ── Errand List ── */}
                {error && <Alert type="error" message={error} />}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                        <Spinner size={32} />
                    </div>
                ) : errands.length === 0 ? (
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '40px 24px',
                        textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14,
                    }}>
                        {tab === 'browse' && '🔍 No open errands nearby. Be the first to post one!'}
                        {tab === 'mytasks' && "📋 You haven't accepted any tasks yet."}
                        {tab === 'history' && '🕐 Your completed errands will appear here.'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {errands.map((errand, i) => (
                            <div key={errand.id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                                display: 'flex', alignItems: 'center', gap: 14,
                                animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
                                transition: 'border-color 0.18s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            >
                                {/* Emoji */}
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                    background: 'var(--bg-elevated)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22,
                                }}>{getEmoji(errand.title)}</div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>{errand.title}</div>
                                    {errand.description && (
                                        <div style={{
                                            fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>{errand.description}</div>
                                    )}
                                    <div style={{ marginTop: 6 }}>
                                        <Badge color={statusColor(errand.status)}>{errand.status}</Badge>
                                    </div>
                                </div>

                                {/* Action */}
                                {tab === 'browse' && errand.requesterId !== user?.id && (
                                    <Button
                                        variant="primary"
                                        loading={actionId === errand.id}
                                        onClick={() => handleAccept(errand.id)}
                                        style={{ padding: '8px 16px', fontSize: 12, flexShrink: 0 }}
                                    >
                                        Help
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Post Task FAB ── */}
            <div style={{
                position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 200,
            }}>
                <Button
                    onClick={() => setShowPost(true)}
                    style={{
                        padding: '14px 32px', fontSize: 14, fontWeight: 700,
                        borderRadius: 99,
                        boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
                        animation: 'pulse-glow 3s ease infinite',
                    }}
                >
                    + Post a Task
                </Button>
            </div>

            {/* ── Post Task Modal ── */}
            {showPost && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 300,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16, animation: 'fadeIn 0.2s ease',
                }} onClick={e => { if (e.target === e.currentTarget) setShowPost(false); }}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)', padding: '28px 24px',
                        width: '100%', maxWidth: 440,
                        animation: 'fadeUp 0.3s ease',
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: 20,
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                            }}>Post a Task</h2>
                            <button onClick={() => setShowPost(false)} style={{
                                color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                borderRadius: 8, width: 32, height: 32,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>×</button>
                        </div>

                        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                    display: 'block', marginBottom: 6,
                                }}>Task Title *</label>
                                <input
                                    placeholder="e.g. Buy groceries from SM"
                                    value={postTitle}
                                    onChange={e => setPostTitle(e.target.value)}
                                    style={{
                                        width: '100%', background: 'var(--bg-elevated)',
                                        border: '1.5px solid var(--border)', borderRadius: 8,
                                        padding: '11px 14px', color: 'var(--text-primary)',
                                        fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                    display: 'block', marginBottom: 6,
                                }}>Description</label>
                                <textarea
                                    placeholder="Add details about the task..."
                                    value={postDesc}
                                    onChange={e => setPostDesc(e.target.value)}
                                    rows={3}
                                    style={{
                                        width: '100%', background: 'var(--bg-elevated)',
                                        border: '1.5px solid var(--border)', borderRadius: 8,
                                        padding: '11px 14px', color: 'var(--text-primary)',
                                        fontSize: 14, outline: 'none', resize: 'none',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                />
                            </div>

                            {postError && <Alert type="error" message={postError} />}

                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <Button
                                    type="button" variant="ghost" fullWidth
                                    onClick={() => setShowPost(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" fullWidth loading={postLoading}>
                                    Post Task
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}