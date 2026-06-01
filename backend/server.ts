import express from 'express';
import cors from 'cors';
import { FoodeyService } from './foodey-service.js';

export function run() {
  const app = express();
  const foodeyService = FoodeyService.from();
  const port = process.env.PORT || 3000;

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/', async (_req, res) => {
    res.send('Foodey service is running');
  });

  app.get('/api/staff', (_req, res) => res.json(foodeyService.getStaff()));
  app.get('/api/staff/:id', (req, res) => {
    const member = foodeyService.getStaffMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  });
  app.post('/api/staff', (req, res) => res.json(foodeyService.addStaff(req.body)));
  app.get('/api/attendance', (_req, res) => res.json(foodeyService.getAttendance()));
  app.get('/api/categories', (_req, res) => res.json(foodeyService.getCategories()));
  app.get('/api/menu', (_req, res) => res.json(foodeyService.getMenuItems()));
  app.get('/api/inventory', (_req, res) => res.json(foodeyService.getInventory()));
  app.get('/api/orders', (_req, res) => res.json(foodeyService.getOrders()));
  app.get('/api/reservations', (_req, res) => res.json(foodeyService.getReservations()));
  app.get('/api/notifications', (_req, res) => res.json(foodeyService.getNotifications()));
  app.get('/api/dashboard', (_req, res) => res.json({
    stats: foodeyService.getDashboardStats(),
    popularDishes: foodeyService.getPopularDishes(),
  }));
  app.get('/api/reports/reservations', (_req, res) => res.json({
    summary: foodeyService.getReservationSummary(),
    reservations: foodeyService.getReservations(),
  }));

  const server = app.listen(port, () => {
    console.log(`Server ready at: http://localhost:${port}`);
  });

  return {
    port,
    stop: async () => {
      server.closeAllConnections();
      server.close();
    }
  };
}
