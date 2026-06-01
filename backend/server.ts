import express from 'express';
import cors from 'cors';
import { FoodeyService } from './foodey-service.js';

/**
 * Boots the Foodey express service exposing REST CRUD endpoints for every module.
 */
export function run() {
  const app = express();
  const svc = FoodeyService.from();
  const port = process.env.PORT || 3000;

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/', (_req, res) => res.send('Foodey service is running'));

  // Staff
  app.get('/api/staff', (_req, res) => res.json(svc.getStaff()));
  app.get('/api/staff/:id', (req, res) => {
    const member = svc.getStaffMember(req.params.id);
    return member ? res.json(member) : res.status(404).json({ error: 'Not found' });
  });
  app.post('/api/staff', (req, res) => res.json(svc.addStaff(req.body)));
  app.put('/api/staff/:id', (req, res) => res.json(svc.updateStaff(req.params.id, req.body)));
  app.delete('/api/staff/:id', (req, res) => res.json(svc.deleteStaff(req.params.id)));

  // Attendance
  app.get('/api/attendance', (_req, res) => res.json(svc.getAttendance()));
  app.put('/api/attendance/:id', (req, res) => res.json(svc.setAttendance(req.params.id, req.body.status)));

  // Categories
  app.get('/api/categories', (_req, res) => res.json(svc.getCategories()));
  app.post('/api/categories', (req, res) => res.json(svc.addCategory(req.body)));
  app.delete('/api/categories/:id', (req, res) => res.json(svc.deleteCategory(req.params.id)));

  // Menu
  app.get('/api/menu', (_req, res) => res.json(svc.getMenuItems()));
  app.post('/api/menu', (req, res) => res.json(svc.addMenuItem(req.body)));
  app.put('/api/menu/:id', (req, res) => res.json(svc.updateMenuItem(req.params.id, req.body)));
  app.delete('/api/menu/:id', (req, res) => res.json(svc.deleteMenuItem(req.params.id)));

  // Inventory
  app.get('/api/inventory', (_req, res) => res.json(svc.getInventory()));
  app.post('/api/inventory', (req, res) => res.json(svc.addInventory(req.body)));
  app.put('/api/inventory/:id', (req, res) => res.json(svc.updateInventory(req.params.id, req.body)));
  app.delete('/api/inventory/:id', (req, res) => res.json(svc.deleteInventory(req.params.id)));

  // Orders
  app.get('/api/orders', (_req, res) => res.json(svc.getOrders()));
  app.post('/api/orders', (req, res) => res.json(svc.addOrder(req.body)));
  app.put('/api/orders/:id', (req, res) => res.json(svc.updateOrder(req.params.id, req.body)));
  app.delete('/api/orders/:id', (req, res) => res.json(svc.deleteOrder(req.params.id)));

  // Reservations
  app.get('/api/reservations', (_req, res) => res.json(svc.getReservations()));
  app.delete('/api/reservations/:id', (req, res) => res.json(svc.deleteReservation(req.params.id)));

  // Notifications
  app.get('/api/notifications', (_req, res) => res.json(svc.getNotifications()));
  app.delete('/api/notifications/:id', (req, res) => res.json(svc.deleteNotification(req.params.id)));
  app.post('/api/notifications/mark-all-read', (_req, res) => res.json(svc.markAllRead()));

  // Access control
  app.get('/api/access-users', (_req, res) => res.json(svc.getAccessUsers()));
  app.post('/api/access-users', (req, res) => res.json(svc.addAccessUser(req.body)));
  app.put('/api/access-users/:id/permission', (req, res) => {
    res.json(svc.togglePermission(req.params.id, req.body.perm, req.body.value));
  });
  app.delete('/api/access-users/:id', (req, res) => res.json(svc.deleteAccessUser(req.params.id)));

  // Dashboard and reports
  app.get('/api/dashboard', (_req, res) => {
    res.json({ stats: svc.getDashboardStats(), popularDishes: svc.getPopularDishes() });
  });
  app.get('/api/reports/reservations', (_req, res) => {
    res.json({ summary: svc.getReservationSummary(), reservations: svc.getReservations() });
  });

  const server = app.listen(port, () => {
    console.log(`Foodey service ready at: http://localhost:${port}`);
  });

  return {
    port,
    stop: async () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
