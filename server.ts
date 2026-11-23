import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import {
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  getApp as getAdminApp,
} from 'firebase-admin/app';
import { getAuth as getAdminAuth, DecodedIdToken } from 'firebase-admin/auth';

const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = fs.existsSync(firebaseConfigPath)
  ? JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'))
  : {};

const adminApp =
  firebaseConfig.projectId && firebaseConfig.projectId !== 'remixed-project-id'
    ? getAdminApps().length
      ? getAdminApp()
      : initializeAdminApp({ projectId: firebaseConfig.projectId })
    : null;

const adminAuth = adminApp ? getAdminAuth(adminApp) : null;

const dbPath = path.resolve(process.cwd(), 'trinetra.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    profile_visibility TEXT DEFAULT 'public',
    allow_custom_amount INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payment_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    application_type TEXT NOT NULL,
    application_label TEXT,
    upi_id TEXT NOT NULL,
    is_enabled INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Ensure firebase_uid column exists on users table
const userColumns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
if (!userColumns.some((col) => col.name === 'firebase_uid')) {
  db.exec('ALTER TABLE users ADD COLUMN firebase_uid TEXT');
  db.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL'
  );
}

// Seed a demo user if none exists
const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const { count } = userCountStmt.get() as { count: number };

if (count === 0) {
  const demoUserId = uuidv4();
  const demoPasswordHash = bcrypt.hashSync('password123', 10);
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, username, password_hash, avatar_url, bio, profile_visibility, allow_custom_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertUser.run(
    demoUserId,
    'Aarav Sharma',
    'aarav@trinetra.me',
    'aarav',
    demoPasswordHash,
    '',
    'Product designer & independent consultant. Select your preferred UPI app below to initiate a direct payment.',
    'public',
    1
  );

  const insertConn = db.prepare(`
    INSERT INTO payment_connections (id, user_id, application_type, application_label, upi_id, is_enabled, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertConn.run(uuidv4(), demoUserId, 'gpay', 'Google Pay', 'aarav@okaxis', 1, 0);
  insertConn.run(uuidv4(), demoUserId, 'phonepe', 'PhonePe', 'aarav@ybl', 1, 1);
  insertConn.run(uuidv4(), demoUserId, 'paytm', 'Paytm UPI', 'aarav@paytm', 1, 2);
  insertConn.run(uuidv4(), demoUserId, 'bhim', 'BHIM UPI', '9876543210@upi', 1, 3);
  insertConn.run(uuidv4(), demoUserId, 'amazonpay', 'Amazon Pay', 'aarav@apl', 1, 4);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

const RESERVED_USERNAMES = new Set([
  'admin',
  'root',
  'support',
  'trinetra',
  'api',
  'login',
  'register',
  'dashboard',
  'settings',
]);

const ALLOWED_APP_TYPES = new Set([
  'gpay',
  'phonepe',
  'paytm',
  'bhim',
  'amazonpay',
  'other',
]);

const VPA_REGEX = /^[\w.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/;

function isSecureRequest(req: express.Request): boolean {
  const protoHeader = req.headers['x-forwarded-proto'];
  const forwardedHttps =
    typeof protoHeader === 'string' &&
    protoHeader.split(',')[0].trim().toLowerCase() === 'https';
  return Boolean(req.secure || forwardedHttps);
}

function getSessionCookieOptions(req: express.Request): express.CookieOptions {
  const https = isSecureRequest(req);
  return {
    httpOnly: true,
    secure: https,
    sameSite: https ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(https ? { partitioned: true } : {}),
  } as express.CookieOptions;
}

function setSessionCookie(req: express.Request, res: express.Response, token: string) {
  res.cookie('trinetra_session', token, getSessionCookieOptions(req));
}

function clearSessionCookie(req: express.Request, res: express.Response) {
  const opts = getSessionCookieOptions(req);
  const { maxAge: _omit, ...clearOpts } = opts;
  res.clearCookie('trinetra_session', clearOpts);
}

function extractBearerToken(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  return '';
}

function extractCookieToken(req: express.Request): string {
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const rawCookie of cookies) {
      const trimmed = rawCookie.trim();
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const name = trimmed.slice(0, eqIndex).trim();
      if (name === 'trinetra_session') {
        const val = trimmed.slice(eqIndex + 1).trim();
        try {
          return decodeURIComponent(val);
        } catch {
          return val;
        }
      }
    }
  }
  return '';
}

function extractSessionToken(req: express.Request): string {
  return extractBearerToken(req) || extractCookieToken(req);
}

function isJwtFormat(token: string): boolean {
  return token.split('.').length === 3;
}

function toPublicUserShape(user: any) {
  return {
    id: user.id,
    firebase_uid: user.firebase_uid || undefined,
    full_name: user.full_name,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url,
    bio: user.bio,
    profile_visibility: user.profile_visibility,
    allow_custom_amount: user.allow_custom_amount,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

const resolveOrCreateFirebaseUser = db.transaction((decoded: DecodedIdToken) => {
  const uid = decoded.uid;
  const email = decoded.email ? decoded.email.trim().toLowerCase() : '';
  const displayName = decoded.name ? decoded.name.trim() : '';
  const picture = decoded.picture ? decoded.picture.trim() : '';

  let user = db
    .prepare('SELECT * FROM users WHERE firebase_uid = ? OR id = ?')
    .get(uid, uid) as any;

  if (!user && email) {
    const byEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (byEmail) {
      db.prepare(
        'UPDATE users SET firebase_uid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(uid, byEmail.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(byEmail.id) as any;
    }
  }

  if (!user) {
    const resolvedEmail = email || `${uid}@firebase.trinetra.local`;
    const randomPasswordHash = bcrypt.hashSync(uuidv4(), 10);
    let baseUsername = (email ? email.split('@')[0] : `user_${uid.slice(0, 6)}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    if (baseUsername.length < 3 || RESERVED_USERNAMES.has(baseUsername)) {
      baseUsername = `user_${uid.slice(0, 6).toLowerCase()}`;
    }

    let username = baseUsername;
    let counter = 1;
    while (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    db.prepare(`
      INSERT INTO users (id, firebase_uid, full_name, email, username, password_hash, avatar_url, bio, profile_visibility, allow_custom_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', 1)
    `).run(
      uid,
      uid,
      displayName || username,
      resolvedEmail,
      username,
      randomPasswordHash,
      picture || '',
      'Hello! Connect with me via UPI.'
    );

    const insertConn = db.prepare(`
      INSERT INTO payment_connections (id, user_id, application_type, application_label, upi_id, is_enabled, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertConn.run(uuidv4(), uid, 'gpay', 'Google Pay', `${username}@okaxis`, 1, 0);
    insertConn.run(uuidv4(), uid, 'phonepe', 'PhonePe', `${username}@ybl`, 1, 1);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid) as any;
  }

  return user;
});

// Auth middleware: verifies Firebase ID tokens via Firebase Admin SDK (Authorization: Bearer)
// or validates server-issued session tokens (Bearer / HttpOnly cookie)
async function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const bearerToken = extractBearerToken(req);
  const cookieToken = extractCookieToken(req);

  if (bearerToken && isJwtFormat(bearerToken)) {
    if (!adminAuth) {
      return res.status(500).json({ error: 'Firebase Admin authentication is not configured' });
    }
    try {
      const decoded = await adminAuth.verifyIdToken(bearerToken);
      const dbUser = resolveOrCreateFirebaseUser(decoded);
      (req as any).firebaseUid = decoded.uid;
      (req as any).authType = 'firebase';
      (req as any).user = {
        ...toPublicUserShape(dbUser),
        uid: decoded.uid,
      };
      return next();
    } catch (err: any) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase token' });
    }
  }

  const sessionToken = bearerToken || cookieToken;
  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized: No session token provided' });
  }

  const sessionStmt = db.prepare(`
    SELECT s.*, u.id as u_id, u.firebase_uid as u_firebase_uid, u.full_name, u.email, u.username, u.avatar_url, u.bio, u.profile_visibility, u.allow_custom_amount, u.created_at as u_created_at, u.updated_at as u_updated_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND datetime(s.expires_at) > datetime('now')
  `);

  const session = sessionStmt.get(sessionToken) as any;
  if (!session) {
    clearSessionCookie(req, res);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  (req as any).sessionToken = sessionToken;
  (req as any).authType = 'session';
  (req as any).user = {
    id: session.u_id,
    firebase_uid: session.u_firebase_uid || undefined,
    uid: session.u_firebase_uid || session.u_id,
    full_name: session.full_name,
    email: session.email,
    username: session.username,
    avatar_url: session.avatar_url,
    bio: session.bio,
    profile_visibility: session.profile_visibility,
    allow_custom_amount: session.allow_custom_amount,
    created_at: session.u_created_at,
    updated_at: session.u_updated_at,
  };

  next();
}

// ==================== AUTH API ROUTES ====================

app.post('/api/auth/register', (req, res) => {
  try {
    const { full_name, email, username, password } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters' });
    }
    if (RESERVED_USERNAMES.has(cleanUsername)) {
      return res.status(400).json({ error: 'This username is reserved' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(cleanEmail, cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'Email or username already registered' });
    }

    const userId = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const defaultAvatar = '';

    const insert = db.prepare(`
      INSERT INTO users (id, full_name, email, username, password_hash, avatar_url, bio, profile_visibility, allow_custom_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'public', 1)
    `);

    insert.run(userId, full_name.trim(), cleanEmail, cleanUsername, passwordHash, defaultAvatar, `Hello! Connect with me via UPI.`);

    // Add starter payment connections
    const insertConn = db.prepare(`
      INSERT INTO payment_connections (id, user_id, application_type, application_label, upi_id, is_enabled, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertConn.run(uuidv4(), userId, 'gpay', 'Google Pay', `${cleanUsername}@okaxis`, 1, 0);
    insertConn.run(uuidv4(), userId, 'phonepe', 'PhonePe', `${cleanUsername}@ybl`, 1, 1);

    // Create session
    const sessionToken = uuidv4() + uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, session_token, expires_at) VALUES (?, ?, ?, ?)').run(uuidv4(), userId, sessionToken, expiresAt);

    setSessionCookie(req, res, sessionToken);

    const userObj = {
      id: userId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      username: cleanUsername,
      avatar_url: defaultAvatar,
      bio: `Hello! Connect with me via UPI.`,
      profile_visibility: 'public',
      allow_custom_amount: 1
    };

    res.json({ token: sessionToken, user: userObj });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const cleanLogin = login.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(cleanLogin, cleanLogin) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const sessionToken = uuidv4() + uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, session_token, expires_at) VALUES (?, ?, ?, ?)').run(uuidv4(), user.id, sessionToken, expiresAt);

    setSessionCookie(req, res, sessionToken);

    const userObj = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      profile_visibility: user.profile_visibility,
      allow_custom_amount: user.allow_custom_amount
    };

    res.json({ token: sessionToken, user: userObj });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    if (!adminAuth) {
      return res.status(500).json({ error: 'Firebase Admin authentication is not configured' });
    }

    const bearerToken = extractBearerToken(req);
    const idToken = bearerToken || (typeof req.body?.credential === 'string' ? req.body.credential.trim() : '');
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized: No Firebase ID token provided' });
    }

    let decoded: DecodedIdToken;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired Firebase Google ID token' });
    }

    const user = resolveOrCreateFirebaseUser(decoded);

    res.json({
      user: toPublicUserShape(user),
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const token = extractSessionToken(req);
    if (token && !isJwtFormat(token)) {
      db.prepare('DELETE FROM sessions WHERE session_token = ?').run(token);
    }
    clearSessionCookie(req, res);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(cleanEmail) as any;

    if (user) {
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      db.prepare('INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(
        uuidv4(),
        user.id,
        token,
        expiresAt
      );
      return res.json({
        success: true,
        message: 'If an account matches this email, recovery instructions have been issued.',
        demo_reset_token: token
      });
    }

    res.json({
      success: true,
      message: 'If an account matches this email, recovery instructions have been issued.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const resetRow = db.prepare(`
      SELECT * FROM password_resets
      WHERE token = ? AND used_at IS NULL AND datetime(expires_at) > datetime('now')
    `).get(token) as any;

    if (!resetRow) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, resetRow.user_id);
    db.prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(resetRow.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(resetRow.user_id);

    res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/public/check-username/:username', (req, res) => {
  try {
    const clean = req.params.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3 || RESERVED_USERNAMES.has(clean)) {
      return res.json({ available: false, reason: RESERVED_USERNAMES.has(clean) ? 'Reserved username' : 'Minimum 3 characters' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(clean) as any;
    res.json({ available: !existing, username: clean });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USER PROFILE API ROUTES ====================

app.put('/api/user/profile', authenticate, (req: any, res) => {
  try {
    const { full_name, username, bio, avatar_url, profile_visibility, allow_custom_amount } = req.body;
    const userId = req.user.id;

    let cleanUsername = req.user.username;
    if (username !== undefined) {
      cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      if (RESERVED_USERNAMES.has(cleanUsername)) {
        return res.status(400).json({ error: 'This username is reserved' });
      }
      // Check if username taken by another user
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(cleanUsername, userId);
      if (existing) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    if (
      profile_visibility !== undefined &&
      profile_visibility !== 'public' &&
      profile_visibility !== 'unpublished'
    ) {
      return res.status(400).json({ error: 'Invalid profile visibility option' });
    }

    db.prepare(`
      UPDATE users 
      SET full_name = COALESCE(?, full_name),
          username = COALESCE(?, username),
          bio = COALESCE(?, bio),
          avatar_url = COALESCE(?, avatar_url),
          profile_visibility = COALESCE(?, profile_visibility),
          allow_custom_amount = COALESCE(?, allow_custom_amount),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name !== undefined ? String(full_name).trim() : undefined,
      cleanUsername,
      bio !== undefined ? String(bio).trim() : undefined,
      avatar_url !== undefined ? String(avatar_url).trim() : undefined,
      profile_visibility,
      allow_custom_amount !== undefined ? (allow_custom_amount ? 1 : 0) : undefined,
      userId
    );

    const updatedUser = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId);
    res.json({ user: toPublicUserShape(updatedUser) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/password', authenticate, (req: any, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id) as any;
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

    // Invalidate all other sessions for this user while preserving the current session
    if (req.sessionToken) {
      db.prepare('DELETE FROM sessions WHERE user_id = ? AND session_token != ?').run(req.user.id, req.sessionToken);
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user/account', authenticate, (req: any, res) => {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM payment_connections WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    clearSessionCookie(req, res);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAYMENT CONNECTIONS API ROUTES ====================

app.get('/api/payment-connections', authenticate, (req: any, res) => {
  try {
    const connections = db.prepare('SELECT * FROM payment_connections WHERE user_id = ? ORDER BY display_order ASC, created_at ASC').all(req.user.id);
    res.json({ connections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payment-connections', authenticate, (req: any, res) => {
  try {
    const { application_type, application_label, upi_id, is_enabled } = req.body;
    if (!application_type || !upi_id) {
      return res.status(400).json({ error: 'Application type and UPI ID are required' });
    }

    const normalizedType = String(application_type).trim().toLowerCase();
    if (!ALLOWED_APP_TYPES.has(normalizedType)) {
      return res.status(400).json({ error: 'Unsupported payment application type' });
    }

    const cleanUpiId = String(upi_id).trim();
    if (cleanUpiId.length > 100 || !VPA_REGEX.test(cleanUpiId)) {
      return res.status(400).json({ error: 'Invalid UPI ID format (e.g. name@okaxis or 9876543210@paytm)' });
    }

    const cleanLabel = application_label ? String(application_label).trim().slice(0, 60) : normalizedType;
    if (!cleanLabel) {
      return res.status(400).json({ error: 'Display label is required' });
    }

    const id = uuidv4();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM payment_connections WHERE user_id = ?').get(req.user.id) as any;
    const displayOrder = countRow ? countRow.count : 0;

    db.prepare(`
      INSERT INTO payment_connections (id, user_id, application_type, application_label, upi_id, is_enabled, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, normalizedType, cleanLabel, cleanUpiId, is_enabled !== undefined ? (is_enabled ? 1 : 0) : 1, displayOrder);

    const newConn = db.prepare('SELECT * FROM payment_connections WHERE id = ?').get(id);
    res.status(201).json({ connection: newConn });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payment-connections/:id', authenticate, (req: any, res) => {
  try {
    const { id } = req.params;
    const { application_type, application_label, upi_id, is_enabled } = req.body;

    // Verify existence & ownership
    const existing = db.prepare('SELECT * FROM payment_connections WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Payment connection not found' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this payment connection' });
    }

    let normalizedType: string | undefined;
    if (application_type !== undefined) {
      normalizedType = String(application_type).trim().toLowerCase();
      if (!ALLOWED_APP_TYPES.has(normalizedType)) {
        return res.status(400).json({ error: 'Unsupported payment application type' });
      }
    }

    let cleanUpiId: string | undefined;
    if (upi_id !== undefined) {
      cleanUpiId = String(upi_id).trim();
      if (cleanUpiId.length > 100 || !VPA_REGEX.test(cleanUpiId)) {
        return res.status(400).json({ error: 'Invalid UPI ID format' });
      }
    }

    const cleanLabel = application_label !== undefined ? String(application_label).trim().slice(0, 60) : undefined;
    if (application_label !== undefined && !cleanLabel) {
      return res.status(400).json({ error: 'Display label cannot be empty' });
    }

    db.prepare(`
      UPDATE payment_connections
      SET application_type = COALESCE(?, application_type),
          application_label = COALESCE(?, application_label),
          upi_id = COALESCE(?, upi_id),
          is_enabled = COALESCE(?, is_enabled),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(normalizedType, cleanLabel, cleanUpiId, is_enabled !== undefined ? (is_enabled ? 1 : 0) : undefined, id, req.user.id);

    const updated = db.prepare('SELECT * FROM payment_connections WHERE id = ?').get(id);
    res.json({ connection: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/payment-connections/:id', authenticate, (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, user_id FROM payment_connections WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Payment connection not found' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to remove this payment connection' });
    }

    db.prepare('DELETE FROM payment_connections WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PUBLIC PROFILE API ROUTE ====================

app.use('/api/public', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/api/public/profile/:username', (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.trim().toLowerCase();

    const user = db.prepare(`
      SELECT id, full_name, username, avatar_url, bio, profile_visibility, allow_custom_amount, created_at
      FROM users WHERE username = ?
    `).get(cleanUsername) as any;

    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (user.profile_visibility === 'unpublished') {
      return res.status(403).json({ error: 'This profile is currently unpublished or private', unpublished: true });
    }

    const connections = db.prepare(`
      SELECT id, application_type, application_label, upi_id, display_order
      FROM payment_connections
      WHERE user_id = ? AND is_enabled = 1
      ORDER BY display_order ASC, created_at ASC
    `).all(user.id);

    res.json({
      profile: {
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
        allow_custom_amount: user.allow_custom_amount === 1,
        created_at: user.created_at
      },
      connections
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`TRINETRA server running on http://localhost:${port}`);
  });
}

startServer();
