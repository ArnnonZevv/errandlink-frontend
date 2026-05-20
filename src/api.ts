const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

export interface User {
    id: string;
    email: string;
    fullName: string;
    username: string | null;
    trustPoints: number;
    role: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Errand {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
    rewardType: string;
    requesterId: string;
    helperId: string | null;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: { code: string; message: string } | null;
    timestamp: string;
}

function getToken(): string | null {
    return localStorage.getItem('el_token');
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    const data = await res.json();
    return data;
}

export const api = {
    auth: {
        register: (body: {
            fullName: string;
            email: string;
            password: string;
            confirmPassword: string;
        }) =>
            request<AuthResponse>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(body),
            }),

        login: (body: { email: string; password: string }) =>
            request<AuthResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(body),
            }),

        logout: () =>
            request<string>('/api/auth/logout', { method: 'POST' }),
    },

    errands: {
        list: (status = 'OPEN') =>
            request<Errand[]>(`/api/errands?status=${status}`),

        create: (body: { title: string; description: string; rewardType: string }) =>
            request<Errand>('/api/errands', {
                method: 'POST',
                body: JSON.stringify(body),
            }),

        accept: (id: string) =>
            request<Errand>(`/api/errands/${id}/accept`, { method: 'PUT' }),

        complete: (id: string) =>
            request<Errand>(`/api/errands/${id}/complete`, { method: 'PUT' }),

        cancel: (id: string) =>
            request<Errand>(`/api/errands/${id}/cancel`, { method: 'PUT' }),
    },

    users: {
        profile: () => request<User>('/api/users/profile'),
        trustHistory: () => request<any[]>('/api/users/trust-history'),
    },
};