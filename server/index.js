import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── CONFIG ───
const PORT = parseInt(process.env.PORT || '3002');
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'portfolio_analytics';

if (!MONGO_URI || !ADMIN_PASSWORD || !JWT_SECRET) {
  console.error('[Server] CRITICAL ERROR: Missing required environment variables in .env (MONGO_URI, ADMIN_PASSWORD, JWT_SECRET).');
  process.exit(1);
}

// ─── MONGODB ───
const client = new MongoClient(MONGO_URI);
let db;

async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[DB] Connected to MongoDB — ${DB_NAME}`);
  // Create indexes
  await db.collection('visits').createIndex({ sessionId: 1 }, { unique: true });
  await db.collection('visits').createIndex({ startTime: -1 });
  await db.collection('admin_login_attempts').createIndex({ ip: 1 }, { unique: true });
}

// ─── HELPERS ───
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
}

function isLocalhost(ip) {
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'].includes(ip);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ─── ANALYTICS ENDPOINTS ───

// Record a new visit
app.post('/api/analytics/visit', async (req, res) => {
  try {
    const { sessionId, browser, pages, referrer } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    const visit = {
      sessionId,
      ip,
      browser: browser || 'Unknown',
      userAgent,
      startTime: new Date(),
      endTime: null,
      duration: null,
      pages: pages || [],
      referrer: referrer || '',
    };

    await db.collection('visits').insertOne(visit);
    res.status(201).json({ success: true, sessionId });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate session, ignore
      return res.json({ success: true, sessionId: req.body.sessionId });
    }
    console.error('[Analytics] Error recording visit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visit duration on page unload
app.patch('/api/analytics/visit/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration, pages } = req.body;

    const update = {
      $set: {
        endTime: new Date(),
        ...(duration !== undefined && { duration }),
      },
    };
    if (pages) {
      update.$addToSet = { pages: { $each: pages } };
    }

    await db.collection('visits').updateOne({ sessionId }, update);
    res.json({ success: true });
  } catch (err) {
    console.error('[Analytics] Error updating visit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── ADMIN AUTH ───

// Check if IP is rate-limited or blocked
async function checkRateLimit(ip) {
  const record = await db.collection('admin_login_attempts').findOne({ ip });

  if (!record) return { allowed: true, attemptsRemaining: 3, currentSet: 1 };

  if (record.blocked) {
    return { allowed: false, blocked: true, message: 'IP permanently blocked after too many failed attempts.' };
  }

  // Check cooldown
  if (record.cooldownUntil && new Date() < new Date(record.cooldownUntil)) {
    const remaining = Math.ceil((new Date(record.cooldownUntil) - new Date()) / 1000);
    return {
      allowed: false,
      blocked: false,
      cooldown: true,
      cooldownRemaining: remaining,
      message: `Please wait ${remaining} seconds before trying again.`,
    };
  }

  // Count failed attempts in current set
  const failedInSet = (record.attempts || []).filter(
    (a) => !a.success && a.set === record.currentSet
  ).length;

  if (failedInSet >= 3) {
    // Move to next set
    const nextSet = (record.currentSet || 1) + 1;

    if (nextSet > 3) {
      // Block permanently
      await db.collection('admin_login_attempts').updateOne(
        { ip },
        { $set: { blocked: true, blockedAt: new Date() } }
      );
      return { allowed: false, blocked: true, message: 'IP permanently blocked after 9 failed attempts.' };
    }

    // Apply cooldown
    const cooldownMs = nextSet === 2 ? 2 * 60 * 1000 : 5 * 60 * 1000;
    const cooldownUntil = new Date(Date.now() + cooldownMs);

    await db.collection('admin_login_attempts').updateOne(
      { ip },
      { $set: { currentSet: nextSet, cooldownUntil } }
    );

    return {
      allowed: false,
      cooldown: true,
      cooldownRemaining: Math.ceil(cooldownMs / 1000),
      message: `Too many attempts. Cooldown for ${Math.ceil(cooldownMs / 60000)} minutes.`,
    };
  }

  return { allowed: true, attemptsRemaining: 3 - failedInSet, currentSet: record.currentSet || 1 };
}

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const ip = getClientIP(req);
    const { password } = req.body;

    // Rate limit check
    const rateCheck = await checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        ...rateCheck,
      });
    }

    const isCorrect = password === ADMIN_PASSWORD;

    // Record attempt
    await db.collection('admin_login_attempts').updateOne(
      { ip },
      {
        $push: {
          attempts: { timestamp: new Date(), success: isCorrect, set: rateCheck.currentSet },
        },
        $setOnInsert: { ip, blocked: false, blockedAt: null, currentSet: 1, cooldownUntil: null },
      },
      { upsert: true }
    );

    if (!isCorrect) {
      const remaining = rateCheck.attemptsRemaining - 1;
      return res.status(401).json({
        success: false,
        message: `Invalid password. ${remaining} attempt(s) remaining in this set.`,
        attemptsRemaining: remaining,
      });
    }

    // Success — clear attempts for this IP
    await db.collection('admin_login_attempts').updateOne(
      { ip },
      { $set: { attempts: [], currentSet: 1, cooldownUntil: null } }
    );

    // Generate JWT
    const token = jwt.sign({ ip, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('[Admin] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// JWT verification middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Verify token
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// Admin stats endpoint
app.get('/api/analytics/stats', requireAuth, async (req, res) => {
  try {
    // Total unique visitors (by IP)
    const totalVisitors = await db.collection('visits').distinct('ip');

    // Total visits
    const totalVisits = await db.collection('visits').countDocuments();

    // Average time spent
    const avgResult = await db.collection('visits').aggregate([
      { $match: { duration: { $ne: null, $gt: 0 } } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
    ]).toArray();
    const avgDuration = avgResult.length > 0 ? Math.round(avgResult[0].avgDuration) : 0;

    // Last 5 visits
    const lastVisits = await db.collection('visits')
      .find({})
      .sort({ startTime: -1 })
      .limit(5)
      .project({ _id: 0, sessionId: 1, ip: 1, browser: 1, startTime: 1, duration: 1, pages: 1 })
      .toArray();

    // Blocked IPs
    const blockedIPs = await db.collection('admin_login_attempts')
      .find({ blocked: true })
      .project({ _id: 0, ip: 1, blockedAt: 1 })
      .toArray();

    res.json({
      success: true,
      data: {
        totalVisitors: totalVisitors.length,
        totalVisits,
        avgDuration,
        lastVisits,
        blockedIPs,
      },
    });
  } catch (err) {
    console.error('[Admin] Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── START ───
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Analytics server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Failed to connect to MongoDB:', err);
    process.exit(1);
  });
