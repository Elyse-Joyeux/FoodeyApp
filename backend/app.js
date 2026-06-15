import cors from 'cors';
import crypto from 'node:crypto';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import {
  AccessUser,
  Attendance,
  Category,
  Inventory,
  Menu,
  NotificationModel,
  OrderModel,
  ReservationModel,
  Session,
  Staff,
  User,
} from './models.js';
import { seed } from './seed.js';
import { sanitizeBody } from './middleware/validate.js';
import { logger } from './middleware/logger.js';
import { apiLimiter, writeLimiter } from './middleware/rate_limiter.js';
import { errorHandler } from './middleware/error_handler.js';

const AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="32" fill="#f97316"/><circle cx="64" cy="48" r="22" fill="#1f1308"/><path d="M24 111c6-24 21-38 40-38s34 14 40 38" fill="#1f1308"/></svg>')}`;
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';
const PERMISSIONS = ['Dashboard', 'Reports', 'Inventory', 'Orders', 'Settings'];

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 8000);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB.');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from database.');
});

function out(doc) {
  const object = doc?.toObject ? doc.toObject() : { ...doc };
  object.id = String(object._id);
  delete object._id;
  delete object.password;
  delete object.resetPasswordToken;
  delete object.resetPasswordExpiresAt;
  return object;
}

function list(docs) {
  return docs.map(out);
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function setSessionCookie(res, sessionId, expiresAt) {
  const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `foodey_session=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=${sameSite}; Path=/; Expires=${expiresAt.toUTCString()}${secure}`,
  );
}

function clearSessionCookie(res) {
  const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `foodey_session=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${secure}`);
}

async function createSession(res, userId) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const session = await Session.create({ userId, expiresAt });
  setSessionCookie(res, session.id, expiresAt);
  return session;
}

async function permissionsFor(user) {
  const access = await accessForUser(user);
  if (!access) {
    return Object.fromEntries(PERMISSIONS.map((permission) => [permission, false]));
  }
  return {
    Dashboard: Boolean(access.permissions?.Dashboard),
    Reports: Boolean(access.permissions?.Reports),
    Inventory: Boolean(access.permissions?.Inventory),
    Orders: Boolean(access.permissions?.Orders),
    Settings: Boolean(access.permissions?.Settings),
  };
}

async function accessForUser(user) {
  if (!user.restaurantId) {
    user.restaurantId = user.email === 'admin@foodey.com' ? 'foodey-demo' : workspaceId();
    await user.save();
  }

  let access = await AccessUser.findOne({
    email: user.email.toLowerCase(),
    restaurantId: user.restaurantId,
  }).maxTimeMS(8000);

  if (!access) {
    const workspaceAccessCount = await AccessUser.countDocuments({ restaurantId: user.restaurantId }).maxTimeMS(8000);
    if (user.email === 'admin@foodey.com' || workspaceAccessCount === 0) {
      access = await AccessUser.create({
        restaurantId: user.restaurantId,
        name: user.fullName,
        email: user.email.toLowerCase(),
        role: 'Owner',
        permissions: Object.fromEntries(PERMISSIONS.map((permission) => [permission, true])),
      });
    }
  } else if (access.role === 'Admin') {
    access.role = 'Owner';
    await access.save();
  }

  return access;
}

async function publicUser(user) {
  if (!user) return null;
  const access = await accessForUser(user);
  return { ...out(user), role: access?.role || 'Team Member', permissions: await permissionsFor(user) };
}

async function findUserFromSession(req) {
  const sessionId = parseCookies(req).foodey_session;
  if (!sessionId) return null;

  const session = await Session.findById(sessionId).maxTimeMS(8000);
  if (!session || session.expiresAt <= new Date()) {
    if (session) await Session.findByIdAndDelete(sessionId);
    return null;
  }

  return User.findById(session.userId).maxTimeMS(8000);
}

async function requireAuth(req, _res, next) {
  const user = await findUserFromSession(req);
  if (!user) return next(httpError(401, 'Authentication required'));
  req.user = user;
  req.permissions = await permissionsFor(user);
  return next();
}

function requirePermission(permission) {
  return (req, _res, next) => {
    if (req.permissions?.[permission]) return next();
    return next(httpError(403, `You do not have permission to access ${permission}.`));
  };
}

function requireMongo(_req, _res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(httpError(503, 'Database is unavailable. Check MONGO_URL and restart the server.'));
  }
  return next();
}

function validate(schema) {
  return (req, _res, next) => {
    const body = sanitizeBody({ ...(req.body || {}) });
    const errors = [];
    const cleaned = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = body[field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if ((value === undefined || value === null || value === '') && !rule.required) continue;
      if (rule.type === 'number') {
        const number = Number(value);
        if (!Number.isFinite(number)) errors.push(`${field} must be a number`);
        else cleaned[field] = number;
      } else if (rule.type === 'array') {
        if (!Array.isArray(value)) errors.push(`${field} must be an array`);
        else cleaned[field] = value;
      } else if (rule.type === 'object') {
        if (!value || typeof value !== 'object' || Array.isArray(value)) errors.push(`${field} must be an object`);
        else cleaned[field] = value;
      } else {
        cleaned[field] = String(value).trim();
      }
      if (rule.min && typeof cleaned[field] === 'string' && cleaned[field].length < rule.min) {
        errors.push(`${field} must be at least ${rule.min} characters`);
      }
      if (rule.email && typeof cleaned[field] === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned[field])) {
        errors.push(`${field} must be a valid email`);
      }
      if (rule.enum && cleaned[field] !== undefined && !rule.enum.includes(cleaned[field])) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    if (errors.length) return next(httpError(400, errors.join('; ')));
    req.body = { ...body, ...cleaned };
    return next();
  };
}

function hasListQuery(req) {
  return ['page', 'limit', 'search', 'sort', 'order', 'sortBy'].some((key) => req.query[key] !== undefined);
}

async function queryList(req, model, searchFields, defaultSort = 'createdAt', baseFilter = {}) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
  const sortBy = String(req.query.sortBy || req.query.sort || defaultSort);
  const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
  const search = String(req.query.search || '').trim();
  const filter = {
    ...baseFilter,
    ...(search ? { $or: searchFields.map((field) => ({ [field]: { $regex: search, $options: 'i' } })) } : {}),
  };

  const [items, total] = await Promise.all([
    model.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit),
    model.countDocuments(filter),
  ]);

  if (!hasListQuery(req)) return list(items);
  return {
    items: list(items),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendResetEmail({ to, link }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`Password reset link for ${to}: ${link}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Reset your Foodey password',
    text: `Use this secure link to reset your Foodey password: ${link}`,
    html: `<p>Use this secure link to reset your Foodey password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`,
  });
}

async function sendOtpEmail({ to, code }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`Foodey OTP for ${to}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Your Foodey login code',
    text: `Your Foodey one-time login code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Foodey one-time login code is:</p><h2>${code}</h2><p>It expires in 10 minutes.</p>`,
  });
}

async function sendWelcomeEmail({ to, name, restaurantName }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = `Welcome to Foodey, ${name}`;
  const text = `Welcome to Foodey. Your restaurant workspace "${restaurantName}" is ready. Sign in here: ${appUrl}/login`;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`Welcome email fallback for ${to}: ${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;background:#070a12;color:#f8fafc;padding:28px">
        <div style="max-width:560px;margin:auto;background:#111827;border:1px solid #263244;border-radius:18px;padding:28px">
          <h1 style="color:#f59e0b;margin-top:0">Welcome to Foodey</h1>
          <p>Hi ${name},</p>
          <p>Your restaurant workspace <strong>${restaurantName}</strong> is ready.</p>
          <p>You can now manage staff, orders, inventory, reports, reservations, and team access from your dashboard.</p>
          <p><a href="${appUrl}/login" style="display:inline-block;background:#f59e0b;color:#111827;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">Open Foodey</a></p>
          <p style="color:#94a3b8">Thanks for choosing Foodey.</p>
        </div>
      </div>
    `,
  });
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function isStrongPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

function workspaceId() {
  return crypto.randomBytes(12).toString('hex');
}

function scoped(req, extra = {}) {
  return { ...extra, restaurantId: req.user.restaurantId };
}

function isProtectedAccessRow(row, req) {
  return row.role === 'Owner' || row.email === req.user.email;
}

function ownerPayload(user) {
  return {
    ...out(user),
    role: 'Owner',
    permissions: Object.fromEntries(PERMISSIONS.map((permission) => [permission, true])),
  };
}

async function connectMongo() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error('MONGO_URL or MONGODB_URI is required.');
  }

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 12000 });
  await seed();
}

function formatMoney(value) {
  return `$ ${Math.round(value).toLocaleString('en-US')}`;
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function dashboardData() {
  const { start, end } = todayRange();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [daily, monthly, reservations, popular] = await Promise.all([
    OrderModel.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, sales: { $sum: '$subTotal' }, count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$subTotal' } } },
    ]),
    ReservationModel.countDocuments({ status: 'Confirmed' }),
    OrderModel.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
      { $sort: { qty: -1, revenue: -1 } },
      { $limit: 6 },
    ]),
  ]);

  const menuByName = new Map((await Menu.find()).map((item) => [item.name, item]));
  const popularDishes = popular.map((item) => {
    const menuItem = menuByName.get(item._id);
    return {
      name: item._id,
      serving: `${item.qty} ordered`,
      price: menuItem?.price || Math.round(item.revenue / Math.max(1, item.qty)),
      inStock: menuItem?.availability !== 'Out of Stock',
      image: menuItem?.image || DISH_IMG,
    };
  });

  if (popularDishes.length === 0) {
    const fallback = await Menu.find().limit(6);
    popularDishes.push(...fallback.map((item) => ({
      name: item.name,
      serving: 'Menu favorite',
      price: item.price,
      inStock: item.availability !== 'Out of Stock',
      image: item.image,
    })));
  }

  return {
    stats: {
      dailySales: formatMoney(daily[0]?.sales || 0),
      monthlyRevenue: formatMoney(monthly[0]?.revenue || 0),
      tablesOccupancy: `${reservations} Tables`,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    popularDishes,
  };
}

async function reservationReport() {
  const [reservations, breakdown, revenue, orderStatuses, topDishes] = await Promise.all([
    ReservationModel.find().sort({ createdAt: -1 }),
    ReservationModel.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, value: { $sum: '$subTotal' } } }]),
    OrderModel.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    OrderModel.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const statuses = ['Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled'];
  const breakdownMap = new Map(breakdown.map((item) => [item._id, item.value]));

  return {
    summary: {
      total: reservations.length,
      revenue: revenue[0]?.value || 0,
      orderStatuses: orderStatuses.map((item) => ({ label: item._id || 'Unknown', value: item.value })),
      topDishes: topDishes.map((item) => ({ name: item._id, qty: item.qty, revenue: item.revenue })),
      breakdown: statuses.map((label) => ({ label, value: breakdownMap.get(label) || 0 })),
    },
    reservations: list(reservations),
  };
}

export function run() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(logger);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '8mb' }));
  app.use('/api', apiLimiter);
  app.use('/foodey-service/api', apiLimiter);

  app.get('/', (_req, res) => res.send('Foodey service is running'));

  const apiRouter = express.Router();
  apiRouter.get('/health', (_req, res) => {
    res.json({
      ok: mongoose.connection.readyState === 1,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  });

  apiRouter.use(requireMongo);

  apiRouter.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return writeLimiter(req, res, next);
    }
    return next();
  });

  apiRouter.post('/auth/signup', validate({
    fullName: { required: true },
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    restaurantName: { required: true },
    restaurantType: {},
    employeeCount: { type: 'number' },
    chefCount: { type: 'number' },
    serviceStyle: {},
    managerName: {},
    managerEmail: { email: true },
    chefName: {},
    chefEmail: { email: true },
  }), asyncRoute(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (!isStrongPassword(req.body.password)) {
      throw httpError(400, 'Password must include uppercase, lowercase, number, and symbol characters.');
    }
    const existing = await User.findOne({ email }).maxTimeMS(8000);
    if (existing) throw httpError(409, 'A user with that email already exists');
    const restaurantId = workspaceId();

    const user = await User.create({
      fullName: req.body.fullName,
      email,
      password: await bcrypt.hash(req.body.password, 12),
      restaurantId,
      restaurantName: req.body.restaurantName,
      restaurantType: req.body.restaurantType || '',
      employeeCount: req.body.employeeCount || 0,
      chefCount: req.body.chefCount || 0,
      serviceStyle: req.body.serviceStyle || '',
    });
    await AccessUser.create({
      restaurantId,
      name: req.body.fullName,
      email,
      role: 'Owner',
      permissions: Object.fromEntries(PERMISSIONS.map((permission) => [permission, true])),
    });
    const staffToCreate = [
      req.body.managerName && {
        restaurantId,
        name: req.body.managerName,
        role: 'Manager',
        email: req.body.managerEmail || '',
        phone: '',
        age: 30,
        salary: 0,
        timings: '9am to 10pm',
        avatar: AVATAR,
        dob: '',
        address: '',
        shiftStart: '9am',
        shiftEnd: '10pm',
      },
      req.body.chefName && {
        restaurantId,
        name: req.body.chefName,
        role: 'Chef',
        email: req.body.chefEmail || '',
        phone: '',
        age: 30,
        salary: 0,
        timings: '9am to 10pm',
        avatar: AVATAR,
        dob: '',
        address: '',
        shiftStart: '9am',
        shiftEnd: '10pm',
      },
    ].filter(Boolean);
    if (staffToCreate.length) await Staff.insertMany(staffToCreate);
    await createSession(res, user.id);
    sendWelcomeEmail({ to: user.email, name: user.fullName, restaurantName: user.restaurantName })
      .catch((error) => console.error('Welcome email failed:', error.message));
    res.status(201).json(ownerPayload(user));
  }));

  apiRouter.post('/auth/login', validate({
    email: { required: true, email: true },
    password: { required: true },
  }), asyncRoute(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).maxTimeMS(8000);
    if (!user) throw httpError(401, 'Invalid credentials');

    const hashed = user.password?.startsWith('$2');
    const matches = hashed
      ? await bcrypt.compare(req.body.password, user.password)
      : user.password === req.body.password;
    if (!matches) throw httpError(401, 'Invalid credentials');

    if (!hashed) {
      user.password = await bcrypt.hash(req.body.password, 12);
      await user.save();
    }

    await createSession(res, user.id);
    res.json(await publicUser(user));
  }));

  apiRouter.post('/auth/request-otp', validate({
    email: { required: true, email: true },
  }), asyncRoute(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).maxTimeMS(8000);
    if (user) {
      const code = String(crypto.randomInt(100000, 999999));
      user.otpCodeHash = hashToken(code);
      user.otpExpiresAt = new Date(Date.now() + 1000 * 60 * 10);
      await user.save();
      await sendOtpEmail({ to: user.email, code });
    }
    res.json({ ok: true, message: 'If that account exists, an OTP code has been sent.' });
  }));

  apiRouter.post('/auth/verify-otp', validate({
    email: { required: true, email: true },
    code: { required: true, min: 6 },
  }), asyncRoute(async (req, res) => {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
      otpCodeHash: hashToken(req.body.code),
      otpExpiresAt: { $gt: new Date() },
    }).maxTimeMS(8000);
    if (!user) throw httpError(401, 'Invalid or expired OTP code');

    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    await createSession(res, user.id);
    res.json(await publicUser(user));
  }));

  apiRouter.get('/auth/me', asyncRoute(async (req, res) => {
    res.json(await publicUser(await findUserFromSession(req)));
  }));

  apiRouter.post('/auth/logout', asyncRoute(async (req, res) => {
    const sessionId = parseCookies(req).foodey_session;
    if (sessionId) await Session.findByIdAndDelete(sessionId);
    clearSessionCookie(res);
    res.json({ ok: true });
  }));

  apiRouter.post('/auth/forgot-password', validate({
    email: { required: true, email: true },
  }), asyncRoute(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).maxTimeMS(8000);
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashToken(token);
      user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await user.save();

      const origin = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
      await sendResetEmail({ to: user.email, link: `${origin}/forgot-password?token=${token}` });
    }
    res.json({ ok: true, message: 'If that account exists, a reset link has been generated.' });
  }));

  apiRouter.post('/auth/reset-password', validate({
    token: { required: true },
    password: { required: true, min: 8 },
  }), asyncRoute(async (req, res) => {
    const user = await User.findOne({
      resetPasswordToken: hashToken(req.body.token),
      resetPasswordExpiresAt: { $gt: new Date() },
    }).maxTimeMS(8000);
    if (!user) throw httpError(400, 'Reset link is invalid or expired');
    if (!isStrongPassword(req.body.password)) {
      throw httpError(400, 'Password must include uppercase, lowercase, number, and symbol characters.');
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    res.json({ ok: true });
  }));

  apiRouter.use(asyncRoute(requireAuth));

  apiRouter.put('/profile', validate({
    fullName: {},
    email: { email: true },
    restaurantName: {},
    avatar: {},
  }), asyncRoute(async (req, res) => {
    const updates = {};
    for (const field of ['fullName', 'email', 'restaurantName', 'avatar']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: req.user.id } }).maxTimeMS(8000);
      if (existing) throw httpError(409, 'A user with that email already exists');
      updates.email = updates.email.toLowerCase();
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (updates.fullName || updates.email) {
      await AccessUser.findOneAndUpdate(
        { email: req.user.email.toLowerCase(), restaurantId: req.user.restaurantId },
        { name: updates.fullName || user.fullName, email: updates.email || user.email },
      );
    }
    res.json(await publicUser(user));
  }));

  apiRouter.get('/staff', requirePermission('Settings'), asyncRoute(async (req, res) => {
    res.json(await queryList(req, Staff, ['name', 'email', 'role', 'phone'], 'name', scoped(req)));
  }));
  apiRouter.get('/staff/:id', requirePermission('Settings'), asyncRoute(async (req, res) => {
    const member = await Staff.findOne(scoped(req, { _id: req.params.id }));
    res.json(member ? out(member) : null);
  }));
  apiRouter.post('/staff', requirePermission('Settings'), validate({
    name: { required: true },
    email: { required: true, email: true },
    role: { required: true },
    phone: {},
    age: { type: 'number' },
    salary: { type: 'number' },
    timings: {},
    avatar: {},
    dob: {},
    address: {},
    shiftStart: {},
    shiftEnd: {},
  }), asyncRoute(async (req, res) => {
    const body = req.body;
    const doc = await Staff.create({
      restaurantId: req.user.restaurantId,
      name: body.name,
      role: body.role,
      email: body.email,
      phone: body.phone || '',
      age: body.age || 30,
      salary: body.salary || 0,
      timings: body.timings || `${body.shiftStart || '9am'} to ${body.shiftEnd || '10pm'}`,
      avatar: body.avatar || AVATAR,
      dob: body.dob || '',
      address: body.address || '',
      shiftStart: body.shiftStart || '9am',
      shiftEnd: body.shiftEnd || '10pm',
    });
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/staff/:id', requirePermission('Settings'), validate({
    name: {},
    email: { email: true },
    role: {},
    phone: {},
    age: { type: 'number' },
    salary: { type: 'number' },
    timings: {},
    avatar: {},
    dob: {},
    address: {},
    shiftStart: {},
    shiftEnd: {},
  }), asyncRoute(async (req, res) => {
    const doc = await Staff.findOneAndUpdate(scoped(req, { _id: req.params.id }), req.body, { new: true, runValidators: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/staff/:id', requirePermission('Settings'), asyncRoute(async (req, res) => {
    await Staff.findOneAndDelete(scoped(req, { _id: req.params.id }));
    res.json({ ok: true });
  }));

  apiRouter.get('/attendance', requirePermission('Settings'), asyncRoute(async (_req, res) => res.json(list(await Attendance.find().sort({ createdAt: -1 })))));
  apiRouter.put('/attendance/:id', requirePermission('Settings'), validate({
    status: { required: true, enum: ['Present', 'Absent', 'Half Shift', 'Leave', ''] },
  }), asyncRoute(async (req, res) => {
    const doc = await Attendance.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(doc ? out(doc) : null);
  }));

  apiRouter.get('/categories', requirePermission('Inventory'), asyncRoute(async (_req, res) => res.json(list(await Category.find().sort({ name: 1 })))));
  apiRouter.post('/categories', requirePermission('Inventory'), validate({
    name: { required: true },
    items: { type: 'number' },
    icon: {},
  }), asyncRoute(async (req, res) => {
    const doc = await Category.create({ name: req.body.name, items: req.body.items || 0, icon: req.body.icon || 'grid' });
    res.status(201).json(out(doc));
  }));
  apiRouter.delete('/categories/:id', requirePermission('Inventory'), asyncRoute(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/menu', requirePermission('Inventory'), asyncRoute(async (req, res) => {
    res.json(await queryList(req, Menu, ['name', 'description', 'category', 'menu'], 'name'));
  }));
  apiRouter.post('/menu', requirePermission('Inventory'), validate({
    name: { required: true },
    description: {},
    image: {},
    stock: {},
    category: { required: true },
    price: { required: true, type: 'number' },
    availability: { required: true, enum: ['In Stock', 'Out of Stock'] },
    menu: {},
  }), asyncRoute(async (req, res) => {
    const doc = await Menu.create({
      itemId: `#${crypto.randomInt(10000000, 99999999)}`,
      name: req.body.name,
      description: req.body.description || '',
      image: req.body.image || DISH_IMG,
      stock: req.body.stock || '0 items',
      category: req.body.category,
      price: req.body.price,
      availability: req.body.availability,
      menu: req.body.menu || 'Normal menu',
    });
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/menu/:id', requirePermission('Inventory'), validate({
    name: {},
    description: {},
    image: {},
    stock: {},
    category: {},
    price: { type: 'number' },
    availability: { enum: ['In Stock', 'Out of Stock'] },
    menu: {},
  }), asyncRoute(async (req, res) => {
    const doc = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/menu/:id', requirePermission('Inventory'), asyncRoute(async (req, res) => {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/inventory', requirePermission('Inventory'), asyncRoute(async (req, res) => {
    res.json(await queryList(req, Inventory, ['name', 'category', 'status'], 'name'));
  }));
  apiRouter.post('/inventory', requirePermission('Inventory'), validate({
    name: { required: true },
    image: {},
    stockInfo: {},
    status: { required: true, enum: ['Active', 'Inactive', 'Draft'] },
    category: { required: true },
    price: { required: true, type: 'number' },
  }), asyncRoute(async (req, res) => {
    const doc = await Inventory.create({
      name: req.body.name,
      image: req.body.image || DISH_IMG,
      stockInfo: req.body.stockInfo || 'Stocked product : 0 In Stock',
      status: req.body.status,
      category: req.body.category,
      price: req.body.price,
    });
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/inventory/:id', requirePermission('Inventory'), validate({
    name: {},
    image: {},
    stockInfo: {},
    status: { enum: ['Active', 'Inactive', 'Draft'] },
    category: {},
    price: { type: 'number' },
  }), asyncRoute(async (req, res) => {
    const doc = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/inventory/:id', requirePermission('Inventory'), asyncRoute(async (req, res) => {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/orders', requirePermission('Orders'), asyncRoute(async (req, res) => {
    res.json(await queryList(req, OrderModel, ['customer', 'orderId', 'status'], 'createdAt'));
  }));
  apiRouter.post('/orders', requirePermission('Orders'), validate({
    customer: { required: true },
    orderId: {},
    status: { required: true, enum: ['Ready', 'In Process', 'Completed', 'Cancelled'] },
    subStatus: {},
    date: {},
    time: {},
    items: { required: true, type: 'array' },
    subTotal: { type: 'number' },
  }), asyncRoute(async (req, res) => {
    const count = await OrderModel.countDocuments();
    const items = req.body.items.map((item) => ({
      qty: Number(item.qty) || 1,
      name: String(item.name || '').trim(),
      price: Number(item.price) || 0,
    })).filter((item) => item.name);
    if (!items.length) throw httpError(400, 'items must include at least one dish');

    const subTotal = req.body.subTotal ?? items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const doc = await OrderModel.create({
      number: String(count + 1).padStart(2, '0'),
      customer: req.body.customer,
      orderId: req.body.orderId || `#${crypto.randomInt(1000, 9999)}`,
      status: req.body.status,
      subStatus: req.body.subStatus || 'Cooking Now',
      date: req.body.date || new Date().toLocaleDateString('en-GB'),
      time: req.body.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      items,
      subTotal,
    });
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/orders/:id', requirePermission('Orders'), validate({
    customer: {},
    orderId: {},
    status: { enum: ['Ready', 'In Process', 'Completed', 'Cancelled'] },
    subStatus: {},
    date: {},
    time: {},
    items: { type: 'array' },
    subTotal: { type: 'number' },
  }), asyncRoute(async (req, res) => {
    const body = { ...req.body };
    if (Array.isArray(body.items)) {
      body.items = body.items.map((item) => ({ qty: Number(item.qty) || 1, name: String(item.name || '').trim(), price: Number(item.price) || 0 })).filter((item) => item.name);
      body.subTotal = body.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    }
    const doc = await OrderModel.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/orders/:id', requirePermission('Orders'), asyncRoute(async (req, res) => {
    await OrderModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/reservations', requirePermission('Orders'), asyncRoute(async (req, res) => {
    res.json(await queryList(req, ReservationModel, ['customer', 'email', 'phone', 'status'], 'createdAt'));
  }));
  apiRouter.post('/reservations', requirePermission('Orders'), validate({
    email: { required: true, email: true },
    customer: { required: true },
    phone: { required: true },
    date: { required: true },
    checkIn: { required: true },
    checkOut: { required: true },
    total: { required: true, type: 'number' },
    status: { required: true, enum: ['Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled', 'Avoided'] },
  }), asyncRoute(async (req, res) => {
    const doc = await ReservationModel.create(req.body);
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/reservations/:id', requirePermission('Orders'), validate({
    email: { email: true },
    customer: {},
    phone: {},
    date: {},
    checkIn: {},
    checkOut: {},
    total: { type: 'number' },
    status: { enum: ['Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled', 'Avoided'] },
  }), asyncRoute(async (req, res) => {
    const doc = await ReservationModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/reservations/:id', requirePermission('Orders'), asyncRoute(async (req, res) => {
    await ReservationModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/notifications', requirePermission('Dashboard'), asyncRoute(async (_req, res) => res.json(list(await NotificationModel.find().sort({ createdAt: -1 })))));
  apiRouter.delete('/notifications/:id', requirePermission('Dashboard'), asyncRoute(async (req, res) => {
    await NotificationModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));
  apiRouter.post('/notifications/mark-all-read', requirePermission('Dashboard'), asyncRoute(async (_req, res) => {
    await NotificationModel.updateMany({}, { read: true });
    res.json(list(await NotificationModel.find().sort({ createdAt: -1 })));
  }));

  apiRouter.get('/access-users', requirePermission('Settings'), asyncRoute(async (req, res) => {
    const workspaceUsers = await User.find(scoped(req)).select('email').maxTimeMS(8000);
    const activeEmails = workspaceUsers.map((user) => user.email.toLowerCase());
    await AccessUser.deleteMany({
      restaurantId: req.user.restaurantId,
      email: { $nin: activeEmails },
    });
    const rows = await AccessUser.find(scoped(req, { email: { $in: activeEmails } })).sort({ role: 1, name: 1 }).maxTimeMS(8000);
    res.json(list(rows).map((row) => ({
      ...row,
      protected: row.role === 'Owner' || row.email === req.user.email,
    })));
  }));
  apiRouter.post('/access-users', requirePermission('Settings'), validate({
    name: { required: true },
    email: { required: true, email: true },
    role: { required: true },
    password: { required: true, min: 8 },
    permissions: { type: 'object' },
  }), asyncRoute(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (req.body.password && !isStrongPassword(req.body.password)) {
      throw httpError(400, 'Password must include uppercase, lowercase, number, and symbol characters.');
    }
    const permissions = { Dashboard: true, Reports: false, Inventory: false, Orders: false, Settings: false, ...(req.body.permissions || {}) };
    const doc = await AccessUser.create({
      restaurantId: req.user.restaurantId,
      name: req.body.name,
      email,
      role: req.body.role,
      permissions,
    });
    if (req.body.password) {
      const existing = await User.findOne({ email }).maxTimeMS(8000);
      if (!existing) {
        await User.create({
          fullName: req.body.name,
          email,
          password: await bcrypt.hash(req.body.password, 12),
          restaurantId: req.user.restaurantId,
          restaurantName: req.user.restaurantName,
        });
      }
    }
    res.status(201).json(out(doc));
  }));
  apiRouter.put('/access-users/:id/permission', requirePermission('Settings'), validate({
    perm: { required: true, enum: PERMISSIONS },
    value: { required: true },
  }), asyncRoute(async (req, res) => {
    const user = await AccessUser.findOne(scoped(req, { _id: req.params.id }));
    if (!user) return res.json(null);
    if (isProtectedAccessRow(user, req)) throw httpError(403, 'Owner and current-user access cannot be changed here.');
    user.permissions = { ...user.permissions, [req.body.perm]: req.body.value === true || req.body.value === 'true' };
    user.markModified('permissions');
    await user.save();
    return res.json(out(user));
  }));
  apiRouter.delete('/access-users/:id', requirePermission('Settings'), asyncRoute(async (req, res) => {
    const row = await AccessUser.findOne(scoped(req, { _id: req.params.id }));
    if (!row) return res.json({ ok: true });
    if (isProtectedAccessRow(row, req)) throw httpError(403, 'Owner and current-user access cannot be removed.');
    await AccessUser.findByIdAndDelete(row.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/dashboard', requirePermission('Dashboard'), asyncRoute(async (_req, res) => {
    res.json(await dashboardData());
  }));

  apiRouter.get('/reports/reservations', requirePermission('Reports'), asyncRoute(async (_req, res) => {
    res.json(await reservationReport());
  }));

  apiRouter.get('/reports/reservations/export', requirePermission('Reports'), asyncRoute(async (_req, res) => {
    const reservations = await ReservationModel.find().sort({ createdAt: -1 });
    const rows = [
      ['Reservation ID', 'Customer Name', 'Email', 'Phone Number', 'Reservation Date', 'Check In', 'Check Out', 'Status', 'Total'],
      ...reservations.map((item) => [
        item.id,
        item.customer,
        item.email,
        item.phone,
        item.date,
        item.checkIn,
        item.checkOut,
        item.status,
        item.total,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="foodey-reservations-report.csv"');
    res.send(csv);
  }));

  app.use('/foodey-service/api', apiRouter);
  app.use('/api', apiRouter);
  app.use(errorHandler);

  const server = app.listen(port, () => {
    console.log(`Foodey service ready at http://localhost:${port}`);
  });

  connectMongo().catch((error) => {
    console.error('Failed to establish initial database connection:', error.message);
  });

  return {
    port,
    stop: async () => {
      await mongoose.disconnect();
      server.closeAllConnections();
      server.close();
    },
  };
}
