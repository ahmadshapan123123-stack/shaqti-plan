import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type StoredUser = User & { passwordHash: string };

type Session = {
  userId: string;
  rememberMe: boolean;
  expiresAt: string; // ISO date
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => void;
  clearError: () => void;
};

// ─── Helpers ─────────────────────────────────────────────
const USERS_KEY = 'shaqti_users';
const SESSION_KEY = 'shaqti_session';

const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;

const hashPassword = async (password: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(36)}`;
};

const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const saveSession = (session: Session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const stripPassword = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ─── Store ───────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  register: async (name, email, password) => {
    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      set({ error: 'هذا الإيميل مسجل بالفعل' });
      return false;
    }

    if (password.length < 4) {
      set({ error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' });
      return false;
    }

    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
      id: generateId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const session: Session = {
      userId: newUser.id,
      rememberMe: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    saveSession(session);

    set({ user: stripPassword(newUser), error: null });
    return true;
  },

  login: async (email, password, rememberMe) => {
    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    const found = users.find(
      (u) => u.email === normalizedEmail && u.passwordHash === passwordHash
    );

    if (!found) {
      set({ error: 'الإيميل أو كلمة المرور غير صحيحة' });
      return false;
    }

    const session: Session = {
      userId: found.id,
      rememberMe,
      expiresAt: rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
    };
    saveSession(session);

    set({ user: stripPassword(found), error: null });
    return true;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ user: null, error: null });
  },

  restoreSession: () => {
    const session = getSession();
    if (!session) {
      set({ user: null, loading: false });
      return;
    }

    const users = getStoredUsers();
    const found = users.find((u) => u.id === session.userId);
    if (!found) {
      localStorage.removeItem(SESSION_KEY);
      set({ user: null, loading: false });
      return;
    }

    set({ user: stripPassword(found), loading: false });
  },

  clearError: () => set({ error: null }),
}));
