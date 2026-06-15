import {
  Staff, Attendance, Menu, Category, Inventory, OrderModel,
  ReservationModel, NotificationModel, AccessUser, User,
} from './models.js';
import bcrypt from 'bcryptjs';

const DEMO_RESTAURANT_ID = 'foodey-demo';
const AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="32" fill="#f97316"/><circle cx="64" cy="48" r="22" fill="#1f1308"/><path d="M24 111c6-24 21-38 40-38s34 14 40 38" fill="#1f1308"/></svg>')}`;
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

/**
 * Seeds the database with initial demo data, but only when a collection is
 * empty — so user-created records persist across restarts.
 */
export async function seed() {
  const demoPasswordHash = await bcrypt.hash('admin123', 12);

  if (await Staff.countDocuments() === 0) {
    await Staff.insertMany(Array.from({ length: 22 }).map((_, i) => ({
      restaurantId: DEMO_RESTAURANT_ID,
      name: 'Jacques Kagabo', role: 'Manager', email: 'kagabo12@gmail.com', phone: '+250(798532708)',
      age: 45, salary: 2200, timings: '9am to 10pm', avatar: AVATAR, dob: '01-Jan-1983',
      address: 'House # 114 Street 123 USA, Chicago', shiftStart: '9am', shiftEnd: '10pm',
    })));
  }

  if (await Attendance.countDocuments() === 0) {
    await Attendance.insertMany(Array.from({ length: 12 }).map((_, i) => ({
      restaurantId: DEMO_RESTAURANT_ID,
      name: 'Jacques Kagabo', role: 'Manager', avatar: AVATAR,
      date: '16-Apr-2024', timings: '9am to 10pm',
      status: i % 3 === 0 ? '' : (['Present', 'Leave', 'Absent'][i % 3]),
    })));
  }

  if (await Category.countDocuments() === 0) {
    await Category.insertMany([
      { _id: 'all', name: 'All', items: 115, icon: 'grid' },
      { _id: 'pizza', name: 'Pizza', items: 20, icon: 'pizza' },
      { _id: 'burger', name: 'Burger', items: 115, icon: 'burger' },
      { _id: 'chicken', name: 'Chicken', items: 115, icon: 'chicken' },
      { _id: 'bakery', name: 'Bakery', items: 115, icon: 'bakery' },
      { _id: 'beverage', name: 'Beverage', items: 115, icon: 'beverage' },
    ]);
  }

  if (await Menu.countDocuments() === 0) {
    const cats = ['Chicken', 'Pizza', 'Burger', 'Bakery', 'Beverage'];
    const menus = ['Normal menu', 'Special Deals', 'New Year Special', 'Deserts and Drinks'];
    await Menu.insertMany(Array.from({ length: 14 }).map((_, i) => ({
      itemId: '#27262626', name: 'Chicken Parmesan',
      description: 'Bread, fried chicken cutlets(usually breast)', image: DISH_IMG,
      stock: '122 items', category: cats[i % cats.length], price: 55, availability: 'In Stock',
      menu: menus[i % menus.length],
    })));
  }

  if (await Inventory.countDocuments() === 0) {
    const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Draft'];
    await Inventory.insertMany(Array.from({ length: 12 }).map((_, i) => ({
      name: 'Chicken Parmesan', image: DISH_IMG,
      stockInfo: 'Stocked product : 10 In Stock', status: statuses[i % statuses.length],
      category: 'Chicken', price: 55,
    })));
  }

  if (await OrderModel.countDocuments() === 0) {
    const statuses = ['Ready', 'In Process', 'Ready', 'Completed', 'In Process', 'Completed'];
    const subs = ['Ready to serve', 'Cooking Now', 'Ready to serve', 'Completed', 'Cooking Now', 'Completed'];
    await OrderModel.insertMany(Array.from({ length: 6 }).map((_, i) => ({
      number: `0${i + 1}`, customer: 'Watson Joyce', orderId: '#990',
      status: statuses[i], subStatus: subs[i], date: 'Wednesday, 01, 04, 2026', time: '4 : 48 PM',
      items: Array.from({ length: 4 }).map(() => ({ qty: 15, name: 'Scrambled eggs with toast', price: 54 })),
      subTotal: 216,
    })));
  }

  if (await ReservationModel.countDocuments() === 0) {
    const statuses = ['Confirmed', 'Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled', 'Avoided', 'Confirmed', 'Awaited', 'Confirmed'];
    await ReservationModel.insertMany(Array.from({ length: 10 }).map((_, i) => ({
      email: 'kagabo12@gmail.com', customer: 'Watson Joyce', phone: '+250 756 859 589',
      date: '23.04.2026', checkIn: '03:18 PM', checkOut: '05: 20 PM', total: 5500, status: statuses[i],
    })));
  }

  if (await NotificationModel.countDocuments() === 0) {
    await NotificationModel.insertMany(Array.from({ length: 7 }).map((_, i) => ({
      title: 'Low Inventory Alert',
      message: 'This is to notify that the following items are running out of stock.',
      date: '07/04/2026', read: i % 2 === 0,
    })));
  }

  if (await AccessUser.countDocuments() === 0) {
    await AccessUser.insertMany([
      { restaurantId: DEMO_RESTAURANT_ID, name: 'Foodey Owner', email: 'admin@foodey.com', role: 'Owner', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
      { restaurantId: DEMO_RESTAURANT_ID, name: 'Annes Ansari', email: 'annesansari@gmail.com', role: 'Sub Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
    ]);
  }

  if (await User.countDocuments() === 0) {
    await User.create({
      fullName: 'Jacques Kagabo',
      email: 'admin@foodey.com',
      password: demoPasswordHash,
      restaurantId: DEMO_RESTAURANT_ID,
      restaurantName: 'Foodey Admin',
      avatar: AVATAR,
    });
    console.log('Default admin user seeded: admin@foodey.com / admin123');
  }

  const users = await User.find();
  await Promise.all(users.map(async (user) => {
    if (user.password && !user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
    if (!user.restaurantId) {
      user.restaurantId = user.email === 'admin@foodey.com' ? DEMO_RESTAURANT_ID : `restaurant_${user.id}`;
      user.avatar = user.avatar || AVATAR;
    }
    await user.save();
    await AccessUser.updateMany(
      { email: user.email, restaurantId: { $exists: false } },
      {
        restaurantId: user.restaurantId,
        role: user.email === 'admin@foodey.com' ? 'Owner' : 'Owner',
        permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true },
      },
    );
  }));

  await Promise.all([
    Staff.updateMany({ $or: [{ restaurantId: { $exists: false } }, { avatar: /photo-1494790108377/ }] }, { restaurantId: DEMO_RESTAURANT_ID, avatar: AVATAR }),
    Attendance.updateMany({ $or: [{ restaurantId: { $exists: false } }, { avatar: /photo-1494790108377/ }] }, { restaurantId: DEMO_RESTAURANT_ID, avatar: AVATAR }),
    AccessUser.updateMany({ restaurantId: { $exists: false } }, { restaurantId: DEMO_RESTAURANT_ID }),
  ]);
}
