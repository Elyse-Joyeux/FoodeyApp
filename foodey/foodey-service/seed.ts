import {
  Staff, Attendance, Menu, Category, Inventory, OrderModel,
  ReservationModel, NotificationModel, AccessUser,
} from './models.js';

const AVATAR = 'https://api.v2.bit.cloud/file-upload/api/bf3c8ae9929e2601ca4c6e7caa146a1e.png';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

/**
 * Seeds the database with initial demo data, but only when a collection is
 * empty — so user-created records persist across restarts.
 */
export async function seed() {
  if (await Staff.countDocuments() === 0) {
    await Staff.insertMany(Array.from({ length: 22 }).map((_, i) => ({
      _id: `#1${String(i + 1).padStart(2, '0')}`,
      name: 'Jacques Kagabo', role: 'Manager', email: 'kagabo12@gmail.com', phone: '+250(798532708)',
      age: 45, salary: 2200, timings: '9am to 10pm', avatar: AVATAR, dob: '01-Jan-1983',
      address: 'House # 114 Street 123 USA, Chicago', shiftStart: '9am', shiftEnd: '10pm',
    })));
  }

  if (await Attendance.countDocuments() === 0) {
    await Attendance.insertMany(Array.from({ length: 12 }).map((_, i) => ({
      _id: `att${i + 1}`, name: 'Jacques Kagabo', role: 'Manager', avatar: AVATAR,
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
      _id: `m${i + 1}`, itemId: '#27262626', name: 'Chicken Parmesan',
      description: 'Bread, fried chicken cutlets(usually breast)', image: DISH_IMG,
      stock: '122 items', category: cats[i % cats.length], price: 55, availability: 'In Stock',
      menu: menus[i % menus.length],
    })));
  }

  if (await Inventory.countDocuments() === 0) {
    const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Draft'];
    await Inventory.insertMany(Array.from({ length: 12 }).map((_, i) => ({
      _id: `inv${i + 1}`, name: 'Chicken Parmesan', image: DISH_IMG,
      stockInfo: 'Stocked product : 10 In Stock', status: statuses[i % statuses.length],
      category: 'Chicken', price: 55,
    })));
  }

  if (await OrderModel.countDocuments() === 0) {
    const statuses = ['Ready', 'In Process', 'Ready', 'Completed', 'In Process', 'Completed'];
    const subs = ['Ready to serve', 'Cooking Now', 'Ready to serve', 'Completed', 'Cooking Now', 'Completed'];
    await OrderModel.insertMany(Array.from({ length: 6 }).map((_, i) => ({
      _id: `o${i + 1}`, number: `0${i + 1}`, customer: 'Watson Joyce', orderId: '#990',
      status: statuses[i], subStatus: subs[i], date: 'Wednesday, 01, 04, 2026', time: '4 : 48 PM',
      items: Array.from({ length: 4 }).map(() => ({ qty: 15, name: 'Scrambled eggs with toast', price: 54 })),
      subTotal: 216,
    })));
  }

  if (await ReservationModel.countDocuments() === 0) {
    const statuses = ['Confirmed', 'Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled', 'Avoided', 'Confirmed', 'Awaited', 'Confirmed'];
    await ReservationModel.insertMany(Array.from({ length: 10 }).map((_, i) => ({
      _id: `r${i + 1}`, email: 'kagabo12@gmail.com', customer: 'Watson Joyce', phone: '+250 756 859 589',
      date: '23.04.2026', checkIn: '03:18 PM', checkOut: '05: 20 PM', total: 5500, status: statuses[i],
    })));
  }

  if (await NotificationModel.countDocuments() === 0) {
    await NotificationModel.insertMany(Array.from({ length: 7 }).map((_, i) => ({
      _id: `n${i + 1}`, title: 'Low Inventory Alert',
      message: 'This is to notify that the following items are running out of stock.',
      date: '07/04/2026', read: i % 2 === 0,
    })));
  }

  if (await AccessUser.countDocuments() === 0) {
    await AccessUser.insertMany([
      { _id: 'au1', name: 'Abubakar Sherazi', email: 'kagabo12@gmail.com', role: 'Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
      { _id: 'au2', name: 'Annes Ansari', email: 'annesansari@gmail.com', role: 'Sub Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
    ]);
  }
}
