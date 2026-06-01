import express from 'express';
import mongoose from 'mongoose';
import { seed } from './seed.js';
import {
  Staff, Attendance, Menu, Category, Inventory, OrderModel,
  ReservationModel, NotificationModel, AccessUser,
} from './models.js';

const AVATAR = 'https://api.v2.bit.cloud/file-upload/api/bf3c8ae9929e2601ca4c6e7caa146a1e.png';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

/** Strip mongo _id into id for the client. */
function out<T extends { _id?: unknown }>(doc: T): Record<string, unknown> {
  const o = (doc as { toObject?: () => Record<string, unknown> }).toObject
    ? (doc as unknown as { toObject: () => Record<string, unknown> }).toObject()
    : { ...(doc as Record<string, unknown>) };
  o.id = o._id;
  delete o._id;
  return o;
}
const list = (docs: { _id?: unknown }[]) => docs.map(out);
let nextId = Date.now();
const uid = (p = '') => `${p}${(nextId += 1)}`;

/**
 * Boots the Foodey express service. Connects to MongoDB when MONGO_URL is set
 * and seeds demo data once; all reads/writes persist to the database.
 */
export function run() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(express.json());

  const mongoUrl = process.env.MONGO_URL;
  if (mongoUrl) {
    mongoose.connect(mongoUrl)
      .then(() => seed())
      .then(() => console.log('✅ MongoDB connected & seeded'))
      .catch((err) => console.error('❌ MongoDB connection error:', err.message));
  } else {
    console.warn('⚠️  MONGO_URL not set — service will return empty results until configured.');
  }

  app.get('/', (req, res) => res.send('Foodey service is running'));

  // ---- Staff ----
  app.get('/api/staff', async (req, res) => res.json(list(await Staff.find())));
  app.get('/api/staff/:id', async (req, res) => {
    const m = await Staff.findById(req.params.id);
    return m ? res.json(out(m)) : res.status(404).json({ error: 'Not found' });
  });
  app.post('/api/staff', async (req, res) => {
    const b = req.body;
    const doc = await Staff.create({
      _id: uid('#'), name: b.name || 'New Staff', role: b.role || 'Waiter', email: b.email || '',
      phone: b.phone || '', age: b.age || 30, salary: Number(b.salary) || 0,
      timings: b.timings || `${b.shiftStart || '9am'} to ${b.shiftEnd || '10pm'}`,
      avatar: AVATAR, dob: b.dob || '', address: b.address || '', shiftStart: b.shiftStart || '9am', shiftEnd: b.shiftEnd || '10pm',
    });
    res.json(out(doc));
  });
  app.put('/api/staff/:id', async (req, res) => {
    const doc = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  });
  app.delete('/api/staff/:id', async (req, res) => { await Staff.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Attendance ----
  app.get('/api/attendance', async (req, res) => res.json(list(await Attendance.find())));
  app.put('/api/attendance/:id', async (req, res) => {
    const doc = await Attendance.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(doc ? out(doc) : null);
  });

  // ---- Categories ----
  app.get('/api/categories', async (req, res) => res.json(list(await Category.find())));
  app.post('/api/categories', async (req, res) => {
    const doc = await Category.create({ _id: uid('cat'), name: req.body.name || 'New Category', items: req.body.items || 0, icon: req.body.icon || 'grid' });
    res.json(out(doc));
  });
  app.delete('/api/categories/:id', async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Menu ----
  app.get('/api/menu', async (req, res) => res.json(list(await Menu.find())));
  app.post('/api/menu', async (req, res) => {
    const b = req.body;
    const doc = await Menu.create({
      _id: uid('m'), itemId: b.itemId || `#${Math.floor(Math.random() * 9e7)}`, name: b.name || 'New Item',
      description: b.description || '', image: b.image || DISH_IMG, stock: b.stock || '0 items',
      category: b.category || 'Chicken', price: Number(b.price) || 0, availability: b.availability || 'In Stock',
      menu: b.menu || 'Normal menu',
    });
    res.json(out(doc));
  });
  app.put('/api/menu/:id', async (req, res) => {
    const doc = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  });
  app.delete('/api/menu/:id', async (req, res) => { await Menu.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Inventory ----
  app.get('/api/inventory', async (req, res) => res.json(list(await Inventory.find())));
  app.post('/api/inventory', async (req, res) => {
    const b = req.body;
    const doc = await Inventory.create({
      _id: uid('inv'), name: b.name || 'New Product', image: b.image || DISH_IMG,
      stockInfo: b.stockInfo || 'Stocked product : 0 In Stock', status: b.status || 'Active',
      category: b.category || 'Chicken', price: Number(b.price) || 0,
    });
    res.json(out(doc));
  });
  app.put('/api/inventory/:id', async (req, res) => {
    const doc = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc ? out(doc) : null);
  });
  app.delete('/api/inventory/:id', async (req, res) => { await Inventory.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Orders ----
  app.get('/api/orders', async (req, res) => res.json(list(await OrderModel.find())));
  app.post('/api/orders', async (req, res) => {
    const b = req.body;
    const count = await OrderModel.countDocuments();
    const items = Array.isArray(b.items) && b.items.length ? b.items : [{ qty: 1, name: 'New Item', price: 10 }];
    const subTotal = b.subTotal ?? items.reduce((s: number, it: { qty: number; price: number }) => s + it.qty * it.price, 0);
    const doc = await OrderModel.create({
      _id: uid('o'), number: String(count + 1).padStart(2, '0'), customer: b.customer || 'New Customer',
      orderId: b.orderId || `#${Math.floor(Math.random() * 9000) + 1000}`, status: b.status || 'In Process',
      subStatus: b.subStatus || 'Cooking Now', date: b.date || new Date().toDateString(), time: b.time || '12:00 PM',
      items, subTotal,
    });
    res.json(out(doc));
  });
  app.put('/api/orders/:id', async (req, res) => {
    const b = req.body;
    if (Array.isArray(b.items)) {
      b.subTotal = b.items.reduce((s: number, it: { qty: number; price: number }) => s + it.qty * it.price, 0);
    }
    const doc = await OrderModel.findByIdAndUpdate(req.params.id, b, { new: true });
    res.json(doc ? out(doc) : null);
  });
  app.delete('/api/orders/:id', async (req, res) => { await OrderModel.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Reservations ----
  app.get('/api/reservations', async (req, res) => res.json(list(await ReservationModel.find())));
  app.delete('/api/reservations/:id', async (req, res) => { await ReservationModel.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Notifications ----
  app.get('/api/notifications', async (req, res) => res.json(list(await NotificationModel.find())));
  app.delete('/api/notifications/:id', async (req, res) => { await NotificationModel.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
  app.post('/api/notifications/mark-all-read', async (req, res) => { await NotificationModel.updateMany({}, { read: true }); res.json(list(await NotificationModel.find())); });

  // ---- Access control ----
  app.get('/api/access-users', async (req, res) => res.json(list(await AccessUser.find())));
  app.post('/api/access-users', async (req, res) => {
    const b = req.body;
    const doc = await AccessUser.create({
      _id: uid('au'), name: b.name || 'New User', email: b.email || '', role: b.role || 'Sub Admin',
      permissions: b.permissions || { Dashboard: true, Reports: false, Inventory: false, Orders: false, Settings: false },
    });
    res.json(out(doc));
  });
  app.put('/api/access-users/:id/permission', async (req, res) => {
    const u = await AccessUser.findById(req.params.id);
    if (!u) return res.json(null);
    u.permissions = { ...u.permissions, [req.body.perm]: req.body.value };
    u.markModified('permissions');
    await u.save();
    return res.json(out(u));
  });
  app.delete('/api/access-users/:id', async (req, res) => { await AccessUser.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

  // ---- Dashboard & reports ----
  app.get('/api/dashboard', async (req, res) => {
    const menu = await Menu.find().limit(4);
    const popularDishes = menu.map((m) => ({ name: m.name, serving: '01 Person', price: m.price, inStock: m.availability === 'In Stock', image: m.image }));
    res.json({
      stats: { dailySales: '$ 2k', monthlyRevenue: '$ 52k', tablesOccupancy: '25 Tables', date: '9 February 2026' },
      popularDishes: popularDishes.length ? popularDishes : [{ name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG }],
    });
  });
  app.get('/api/reports/reservations', async (req, res) => {
    const all = await ReservationModel.find();
    const count = (s: string) => all.filter((r) => r.status === s).length;
    res.json({
      summary: {
        total: all.length || 192,
        breakdown: [
          { label: 'Confirmed', value: count('Confirmed') || 60 },
          { label: 'Awaited', value: count('Awaited') || 30 },
          { label: 'Cancelled', value: count('Cancelled') || 25 },
          { label: 'Failed', value: count('Failed') || 20 },
          { label: 'Fullfilled', value: count('Fulfilled') || 57 },
        ],
      },
      reservations: list(all),
    });
  });

  const server = app.listen(port, () => {
    console.log(`🚀  Foodey service ready at: http://localhost:${port}`);
  });

  return {
    port,
    stop: async () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
