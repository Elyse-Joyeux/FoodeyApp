import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import {
  AccessUser,
  Attendance,
  Category,
  Inventory,
  Menu,
  NotificationModel,
  OrderModel,
  ReservationModel,
  Staff,
  User,
} from './models.js';
import { seed } from './seed.js';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&fit=crop&crop=faces';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

// Disable buffered commands to fail fast if disconnected
mongoose.set('bufferCommands', false);

// Setup mongoose connection event logging
mongoose.connection.on('connected', () => {
  console.log('Mongoose successfully connected to MongoDB Atlas.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from database.');
});

function out(doc) {
  const object = doc.toObject ? doc.toObject() : { ...doc };
  object.id = object._id;
  delete object._id;
  return object;
}

function list(docs) {
  return docs.map(out);
}

let nextId = Date.now();
function uid(prefix = '') {
  nextId += 1;
  return `${prefix}${nextId}`;
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

async function connectMongo() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;

  if (!mongoUrl) {
    console.error('MONGO_URL or MONGODB_URI environment variable is not defined.');
    console.error('Make sure you have a .env file in your root folder with a valid connection string.');
    throw new Error('Database connection configuration missing.');
  }

  console.log('Attempting to connect to MongoDB...');
  await mongoose.connect(mongoUrl);
  await seed();
  console.log('MongoDB connected and seeded successfully');
}

/**
 * Boots the Foodey express service with MongoDB-backed REST endpoints.
 */
export function run() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '8mb' }));

  app.get('/', (_req, res) => res.send('Foodey service is running'));

  // Create sub-router for API endpoints
  const apiRouter = express.Router();

  // ----- Auth endpoints -----
  apiRouter.post('/auth/signup', asyncRoute(async (req, res) => {
    const { fullName, email, password, restaurantName } = req.body;

    if (!fullName || !email || !password || !restaurantName) {
      return res.status(400).json({ error: 'Full name, email, password, and restaurant name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      _id: uid('user'),
      fullName,
      email,
      password, // In production, hash the password!
      restaurantName,
    });

    return res.status(201).json(out(user));
  }));

  apiRouter.post('/auth/login', asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json(out(user));
  }));

  apiRouter.get('/auth/me', asyncRoute(async (req, res) => {
    res.json(null);
  }));

  // ----- MongoDB Connection check middleware -----
  // Applies to all non-auth API routes
  apiRouter.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'MongoDB is not connected. Set a valid MONGO_URL in .env and restart the server.',
      });
    }
    next();
  });

  // ----- Business logic endpoints -----
  apiRouter.get('/staff', asyncRoute(async (_req, res) => res.json(list(await Staff.find()))));
  apiRouter.get('/staff/:id', asyncRoute(async (req, res) => {
    const member = await Staff.findById(req.params.id);
    return member ? res.json(out(member)) : res.status(404).json({ error: 'Not found' });
  }));
  apiRouter.post('/staff', asyncRoute(async (req, res) => {
    const body = req.body;
    const doc = await Staff.create({
      _id: uid('#'),
      name: body.name || 'New Staff',
      role: body.role || 'Waiter',
      email: body.email || '',
      phone: body.phone || '',
      age: Number(body.age) || 30,
      salary: Number(body.salary) || 0,
      timings: body.timings || `${body.shiftStart || '9am'} to ${body.shiftEnd || '10pm'}`,
      avatar: body.avatar || AVATAR,
      dob: body.dob || '',
      address: body.address || '',
      shiftStart: body.shiftStart || '9am',
      shiftEnd: body.shiftEnd || '10pm',
    });
    res.json(out(doc));
  }));
  apiRouter.put('/staff/:id', asyncRoute(async (req, res) => {
    const doc = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/staff/:id', asyncRoute(async (req, res) => {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/attendance', asyncRoute(async (_req, res) => res.json(list(await Attendance.find()))));
  apiRouter.put('/attendance/:id', asyncRoute(async (req, res) => {
    const doc = await Attendance.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(doc ? out(doc) : null);
  }));

  apiRouter.get('/categories', asyncRoute(async (_req, res) => res.json(list(await Category.find()))));
  apiRouter.post('/categories', asyncRoute(async (req, res) => {
    const doc = await Category.create({
      _id: uid('cat'),
      name: req.body.name || 'New Category',
      items: Number(req.body.items) || 0,
      icon: req.body.icon || 'grid',
    });
    res.json(out(doc));
  }));
  apiRouter.delete('/categories/:id', asyncRoute(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/menu', asyncRoute(async (_req, res) => res.json(list(await Menu.find()))));
  apiRouter.post('/menu', asyncRoute(async (req, res) => {
    const body = req.body;
    const doc = await Menu.create({
      _id: uid('m'),
      itemId: body.itemId || `#${Math.floor(Math.random() * 9e7)}`,
      name: body.name || 'New Item',
      description: body.description || '',
      image: body.image || DISH_IMG,
      stock: body.stock || '0 items',
      category: body.category || 'Chicken',
      price: Number(body.price) || 0,
      availability: body.availability || 'In Stock',
      menu: body.menu || 'Normal menu',
    });
    res.json(out(doc));
  }));
  apiRouter.put('/menu/:id', asyncRoute(async (req, res) => {
    const doc = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/menu/:id', asyncRoute(async (req, res) => {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/inventory', asyncRoute(async (_req, res) => res.json(list(await Inventory.find()))));
  apiRouter.post('/inventory', asyncRoute(async (req, res) => {
    const body = req.body;
    const doc = await Inventory.create({
      _id: uid('inv'),
      name: body.name || 'New Product',
      image: body.image || DISH_IMG,
      stockInfo: body.stockInfo || 'Stocked product : 0 In Stock',
      status: body.status || 'Active',
      category: body.category || 'Chicken',
      price: Number(body.price) || 0,
    });
    res.json(out(doc));
  }));
  apiRouter.put('/inventory/:id', asyncRoute(async (req, res) => {
    const doc = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/inventory/:id', asyncRoute(async (req, res) => {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/orders', asyncRoute(async (_req, res) => res.json(list(await OrderModel.find()))));
  apiRouter.post('/orders', asyncRoute(async (req, res) => {
    const body = req.body;
    const count = await OrderModel.countDocuments();
    const items = Array.isArray(body.items) && body.items.length
      ? body.items
      : [{ qty: 1, name: 'New Item', price: 10 }];
    const subTotal = body.subTotal ?? items.reduce((sum, item) => (
      sum + item.qty * item.price
    ), 0);
    const doc = await OrderModel.create({
      _id: uid('o'),
      number: String(count + 1).padStart(2, '0'),
      customer: body.customer || 'New Customer',
      orderId: body.orderId || `#${Math.floor(Math.random() * 9000) + 1000}`,
      status: body.status || 'In Process',
      subStatus: body.subStatus || 'Cooking Now',
      date: body.date || new Date().toDateString(),
      time: body.time || '12:00 PM',
      items,
      subTotal,
    });
    res.json(out(doc));
  }));
  apiRouter.put('/orders/:id', asyncRoute(async (req, res) => {
    const body = req.body;
    if (Array.isArray(body.items)) {
      body.subTotal = body.items.reduce((sum, item) => (
        sum + item.qty * item.price
      ), 0);
    }
    const doc = await OrderModel.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json(doc ? out(doc) : null);
  }));
  apiRouter.delete('/orders/:id', asyncRoute(async (req, res) => {
    await OrderModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/reservations', asyncRoute(async (_req, res) => res.json(list(await ReservationModel.find()))));
  apiRouter.delete('/reservations/:id', asyncRoute(async (req, res) => {
    await ReservationModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/notifications', asyncRoute(async (_req, res) => res.json(list(await NotificationModel.find()))));
  apiRouter.delete('/notifications/:id', asyncRoute(async (req, res) => {
    await NotificationModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));
  apiRouter.post('/notifications/mark-all-read', asyncRoute(async (_req, res) => {
    await NotificationModel.updateMany({}, { read: true });
    res.json(list(await NotificationModel.find()));
  }));

  apiRouter.get('/access-users', asyncRoute(async (_req, res) => res.json(list(await AccessUser.find()))));
  apiRouter.post('/access-users', asyncRoute(async (req, res) => {
    const body = req.body;
    const doc = await AccessUser.create({
      _id: uid('au'),
      name: body.name || 'New User',
      email: body.email || '',
      role: body.role || 'Sub Admin',
      permissions: body.permissions || {
        Dashboard: true,
        Reports: false,
        Inventory: false,
        Orders: false,
        Settings: false,
      },
    });
    res.json(out(doc));
  }));
  apiRouter.put('/access-users/:id/permission', asyncRoute(async (req, res) => {
    const user = await AccessUser.findById(req.params.id);
    if (!user) {
      return res.json(null);
    }

    user.permissions = { ...user.permissions, [req.body.perm]: req.body.value };
    user.markModified('permissions');
    await user.save();
    return res.json(out(user));
  }));
  apiRouter.delete('/access-users/:id', asyncRoute(async (req, res) => {
    await AccessUser.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }));

  apiRouter.get('/dashboard', asyncRoute(async (_req, res) => {
    const menu = await Menu.find().limit(4);
    const popularDishes = menu.map((item) => ({
      name: item.name,
      serving: '01 Person',
      price: item.price,
      inStock: item.availability === 'In Stock',
      image: item.image,
    }));
    res.json({
      stats: {
        dailySales: '$ 2k',
        monthlyRevenue: '$ 52k',
        tablesOccupancy: '25 Tables',
        date: '9 February 2026',
      },
      popularDishes: popularDishes.length
        ? popularDishes
        : [{ name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG }],
    });
  }));

  apiRouter.get('/reports/reservations', asyncRoute(async (_req, res) => {
    const reservations = await ReservationModel.find();
    const count = (status) => reservations.filter((item) => item.status === status).length;
    res.json({
      summary: {
        total: reservations.length,
        breakdown: [
          { label: 'Confirmed', value: count('Confirmed') },
          { label: 'Awaited', value: count('Awaited') },
          { label: 'Cancelled', value: count('Cancelled') },
          { label: 'Failed', value: count('Failed') },
          { label: 'Fulfilled', value: count('Fulfilled') },
        ],
      },
      reservations: list(reservations),
    });
  }));

  // Double mount apiRouter to support both relative paths and gateway paths
  app.use('/foodey-service/api', apiRouter);
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use((error, _req, res, _next) => {
    console.error('🚨 Unexpected Server Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected server error' });
  });

  const server = app.listen(port, () => {
    console.log(`🚀 Foodey service ready at: http://localhost:${port}`);
  });

  connectMongo().catch((error) => {
    console.error('❌ Failed to establish initial database connection:', error.message);
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
