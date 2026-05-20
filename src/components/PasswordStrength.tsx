import React from 'react';

const WEAK = new Set([
    'password', 'password1', 'password123', '123456', '12345678', 'qwerty',
    'qwerty123', 'asdfgh', '111111', '000000', 'iloveyou', 'welcome', 'letmein',
    'monkey', 'dragon', 'master', 'admin', 'admin123', 'abc123', 'errandlink',
]);

export function getStrength(pw: string) {
    if (!pw) return { score: 0, label: '', color: '', issues: [] };
    const issues: string[] = [];
    if (pw.length < 8) issues.push('At least 8 characters');
    if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
    if (!/[a-z]/.test(pw)) issues.push('One lowercase letter');
    if (!/[0-9]/.test(pw)) issues.push('One number');
    if (!/[^A-Za-z0-9]/.test(pw)) issues.push('One special character');
    if (WEAK.has(pw.toLowerCase())) issues.push('Too common');
    if (/^(.)\1+$/.test(pw)) issues.push('Avoid repeated characters');

    const score = issues.length === 0 ? 4 : issues.length <= 1 ? 3 : issues.length <= 3 ? 2 : 1;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
    return { score, label: labels[score], color: colors[score], issues };
}

export function PasswordStrength({ password }: { password: string }) {
    const { score, label, color, issues } = getStrength(password);
    if (!password) return null;

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i <= score ? color : 'var(--bg-elevated)',
                        transition: 'background 0.2s',
                    }} />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {issues.slice(0, 3).map(issue => (
                        <span key={issue} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            · {issue}
                        </span>
                    ))}
                    {score === 4 && (
                        <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Strong password</span>
                    )}
                </div>
                {label && (
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
                )}
            </div>
        </div>
    );
}