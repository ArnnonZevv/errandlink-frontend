import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
    return (
        <span style={{
            display: 'inline-block',
            width: size, height: size,
            border: `2px solid rgba(255,255,255,0.2)`,
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        }} />
    );
}

// ── Logo ──────────────────────────────────────────────────
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 18, md: 24, lg: 32 };
    const fs = sizes[size];
    return (
        <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: fs,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
            userSelect: 'none',
        }}>
            Errand<span style={{ color: 'var(--accent)' }}>Link</span>
            <span style={{
                fontSize: fs * 0.55,
                fontWeight: 800,
                color: '#fff',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                borderRadius: 5,
                padding: '1px 5px',
                marginLeft: 3,
                verticalAlign: 'middle',
                letterSpacing: 0,
            }}>+</span>
        </span>
    );
}

// ── Button ────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    loading?: boolean;
    fullWidth?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary', loading, fullWidth, children, disabled, style, ...rest
}: ButtonProps) {
    const base: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '12px 20px',
        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
        borderRadius: 'var(--radius-md)', border: 'none',
        transition: 'all 0.18s ease',
        width: fullWidth ? '100%' : undefined,
        opacity: (disabled || loading) ? 0.65 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        letterSpacing: '0.01em',
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: '#fff',
            boxShadow: '0 4px 20px var(--accent-glow)',
        },
        secondary: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
        },
        danger: {
            background: 'var(--red-bg)',
            color: 'var(--red)',
            border: '1px solid rgba(239,68,68,0.2)',
        },
    };

    return (
        <button
            disabled={disabled || loading}
            style={{ ...base, ...variants[variant], ...style }}
            {...rest}
        >
            {loading ? <Spinner size={16} /> : children}
        </button>
    );
}

// ── Input ─────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Input({ label, error, hint, style, ...rest }: InputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <label style={{
                    fontSize: 12, fontWeight: 600,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    background: 'var(--bg-elevated)',
                    border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '11px 14px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    width: '100%',
                    transition: 'border-color 0.18s',
                    ...style,
                }}
                onFocus={e => {
                    e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)';
                }}
                {...rest}
            />
            {error && (
                <span style={{ fontSize: 12, color: 'var(--red)' }}>⚠ {error}</span>
            )}
            {hint && !error && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>
            )}
        </div>
    );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-md)',
            ...style,
        }}>
            {children}
        </div>
    );
}

// ── Alert ─────────────────────────────────────────────────
export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
    const isError = type === 'error';
    return (
        <div style={{
            background: isError ? 'var(--red-bg)' : 'var(--green-bg)',
            border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: 13,
            color: isError ? 'var(--red)' : 'var(--green)',
            display: 'flex', alignItems: 'center', gap: 8,
        }}>
            <span>{isError ? '⚠' : '✓'}</span>
            {message}
        </div>
    );
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }: { children: ReactNode; color?: 'blue' | 'green' | 'amber' | 'red' | 'gray' }) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
        green: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
        amber: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
        red: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
        gray: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
    };
    const c = colors[color];
    return (
        <span style={{
            background: c.bg, color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: 99, padding: '3px 10px',
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.03em', whiteSpace: 'nowrap',
        }}>
            {children}
        </span>
    );
}

// ── TrustBar ──────────────────────────────────────────────
export function TrustBar({ points, max = 500 }: { points: number; max?: number }) {
    const pct = Math.min(100, (points / max) * 100);
    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6,
            }}>
                <span>Trust Points</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{points} / {max}</span>
            </div>
            <div style={{
                height: 6, background: 'var(--bg-elevated)',
                borderRadius: 99, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', width: `${pct}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--green))',
                    borderRadius: 99, transition: 'width 0.6s ease',
                }} />
            </div>
        </div>
    );
}

// ── Divider ───────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            {label && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>}
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
    );
}