import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Logo, Button, Input, Alert, TrustBar, Spinner } from '../components/UI';
import { PasswordStrength, getStrength } from '../components/PasswordStrength';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  bio: string;
  profileImage: string | null;
  trustPoints: number;
  role: string;
}

type Section = 'profile' | 'password';

async function fetchProfile(token: string): Promise<ProfileData> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.success) return data.data;
  throw new Error(data.error?.message || 'Failed to fetch profile');
}

async function saveProfile(token: string, body: Partial<ProfileData>) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function savePassword(token: string, body: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  const res = await fetch(`${API_BASE}/api/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [section, setSection]       = useState<Section>('profile');

  // Profile edit state
  const [fullName, setFullName]     = useState('');
  const [bio, setBio]               = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imgHover, setImgHover]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwMsg, setPwMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pwStrength = getStrength(newPw);
  const pwMatch    = confirmPw.length > 0 && newPw === confirmPw;
  const pwMiss     = confirmPw.length > 0 && newPw !== confirmPw;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile(token)
      .then(data => {
        setProfile(data);
        setFullName(data.fullName);
        setBio(data.bio || '');
        setPreviewImg(data.profileImage || null);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please upload an image file.' }); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image must be smaller than 2MB.' }); return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewImg(reader.result as string);
    reader.readAsDataURL(file);
    setProfileMsg(null);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setProfileMsg({ type: 'error', text: 'Full name cannot be empty.' }); return; }
    if (!token) return;
    setSaving(true); setProfileMsg(null);
    try {
      const res = await saveProfile(token, {
        fullName: fullName.trim(),
        bio,
        profileImage: previewImg,
      } as any);
      if (res.success) {
        setProfile(res.data);
        // Update auth context with new name
        if (user) login({ ...user, fullName: fullName.trim() }, token);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: res.error?.message || 'Could not save profile.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'Please fill in all fields.' }); return;
    }
    if (pwStrength.score < 3) {
      setPwMsg({ type: 'error', text: 'Please choose a stronger password.' }); return;
    }
    if (!pwMatch) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return;
    }
    if (!token) return;
    setPwSaving(true); setPwMsg(null);
    try {
      const res = await savePassword(token, {
        currentPassword: currentPw,
        newPassword: newPw,
        confirmNewPassword: confirmPw,
      });
      if (res.success) {
        setPwMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        setPwMsg({ type: 'error', text: res.error?.message || 'Could not update password.' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPwSaving(false);
    }
  }

  const initials = (profile?.fullName || user?.fullName || '?')[0].toUpperCase();

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <Spinner size={40} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(11,17,32,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo size="md" />
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            fontSize: 12, color: 'var(--accent)', fontWeight: 600,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 99, padding: '5px 14px',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >← Dashboard</button>
      </nav>

      <div style={{
        maxWidth: 520, margin: '0 auto', padding: '28px 16px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>

        {/* ── Profile Header Card ── */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-glow)',
          animation: 'fadeUp 0.4s ease both',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(34,197,94,0.05))',
            pointerEvents: 'none',
          }} />

          {/* Avatar */}
          <div style={{ position: 'relative', cursor: 'pointer', zIndex: 1 }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
          >
            <div style={{
              width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
              border: '3px solid rgba(59,130,246,0.4)',
              boxShadow: '0 0 0 4px rgba(59,130,246,0.1), 0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
              transform: imgHover ? 'scale(1.05)' : 'scale(1)',
              position: 'relative',
            }}>
              {previewImg ? (
                <img src={previewImg} alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 800, color: '#fff',
                  fontFamily: 'var(--font-display)',
                }}>{initials}</div>
              )}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: imgHover ? 1 : 0,
                transition: 'opacity 0.2s',
                fontSize: 22,
              }}>📷</div>
            </div>

            {/* Camera badge */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 28, height: 28,
              background: 'var(--accent)', borderRadius: '50%',
              border: '2px solid var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}>📷</div>
          </div>

          <input
            ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImageChange}
          />

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
            }}>{profile?.fullName || user?.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              {profile?.email}
            </div>
            {profile?.bio && (
              <div style={{
                fontSize: 13, color: 'var(--text-secondary)',
                marginTop: 8, fontStyle: 'italic',
                maxWidth: 320, lineHeight: 1.5,
              }}>"{profile.bio}"</div>
            )}
          </div>

          {/* Trust bar */}
          <div style={{ width: '100%', zIndex: 1 }}>
            <TrustBar points={profile?.trustPoints ?? 0} />
          </div>

          {/* Role badge */}
          <div style={{
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 99, padding: '4px 14px',
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
          }}>
            {profile?.role ?? 'REQUESTER'}
          </div>

          {/* Section tabs */}
          <div style={{
            display: 'flex', gap: 8, width: '100%',
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            padding: 5, marginTop: 4,
          }}>
            {([
              { id: 'profile',  label: '👤 Edit Profile'    },
              { id: 'password', label: '🔒 Change Password'  },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setSection(t.id)} style={{
                flex: 1, padding: '9px',
                borderRadius: 10, border: 'none',
                background: section === t.id
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                  : 'transparent',
                color: section === t.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ── Edit Profile Section ── */}
        {section === 'profile' && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '24px',
            animation: 'fadeUp 0.3s ease both',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              marginBottom: 20, color: 'var(--text-primary)',
            }}>Profile Information</h2>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Display Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
              />

              {/* Bio textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell your neighbors about yourself..."
                  maxLength={160}
                  rows={3}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '11px 14px',
                    color: 'var(--text-primary)',
                    fontSize: 14, resize: 'none', outline: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                  {bio.length}/160
                </span>
              </div>

              {/* Photo upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>Profile Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', transition: 'border-color 0.18s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {previewImg ? (
                    <img src={previewImg} alt="preview" style={{
                      width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                    }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--bg)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>📷</div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {previewImg ? 'Click to change photo' : 'Click to upload photo'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      JPG, PNG or GIF · Max 2MB
                    </div>
                  </div>
                </div>
                {previewImg && (
                  <button
                    type="button"
                    onClick={() => setPreviewImg(null)}
                    style={{
                      fontSize: 12, color: 'var(--red)', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      padding: 0, fontFamily: 'var(--font-body)',
                    }}
                  >✕ Remove photo</button>
                )}
              </div>

              {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}

              <Button type="submit" fullWidth loading={saving}>
                Save Profile
              </Button>
            </form>
          </div>
        )}

        {/* ── Change Password Section ── */}
        {section === 'password' && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '24px',
            animation: 'fadeUp 0.3s ease both',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              marginBottom: 20, color: 'var(--text-primary)',
            }}>Change Password</h2>

            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Current Password"
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <div>
                <Input
                  label="New Password"
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <PasswordStrength password={newPw} />
              </div>

              <div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
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

              {/* Tips */}
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '12px 14px',
                fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7,
              }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Tips:</strong> At least 8 characters,
                mix of uppercase and lowercase, include numbers or symbols.
              </div>

              {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}

              <Button type="submit" fullWidth loading={pwSaving}>
                Update Password
              </Button>
            </form>
          </div>
        )}

        {/* ── Danger Zone ── */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 'var(--radius-xl)', padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Sign Out
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Sign out of your ErrandLink+ account
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '9px 18px', fontSize: 13 }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}