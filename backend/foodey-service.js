/**
 * Foodey backend service — in-memory data store with full CRUD for every
 * restaurant management module (staff, menu, inventory, orders, reservations,
 * notifications, attendance and access control).
 */

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&fit=crop&crop=faces';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

let counter = 1000;
/** Generate a unique sequential id. */
function uid(prefix = '') {
  counter += 1;
  return `${prefix}${counter}`;
}

export class FoodeyService {
  constructor() {
    this.staff = Array.from({ length: 22 }).map((_, i) => ({
      id: `#1${String(i + 1).padStart(2, '0')}`,
      name: 'Jacques Kagabo',
      role: 'Manager',
      email: 'kagabo12@gmail.com',
      phone: '+250(798532708)',
      age: 45,
      salary: 2200,
      timings: '9am to 10pm',
      avatar: AVATAR,
      dob: '01-Jan-1983',
      address: 'House # 114 Street 123 USA, Chicago',
      shiftStart: '9am',
      shiftEnd: '10pm',
    }));

    this.attendance = Array.from({ length: 12 }).map((_, i) => ({
      id: `#1${String(i + 1).padStart(2, '0')}`,
      name: 'Jacques Kagabo',
      role: 'Manager',
      avatar: AVATAR,
      date: '16-Apr-2024',
      timings: '9am to 10pm',
      status: i % 3 === 0 ? '' : ['Present', 'Leave', 'Absent'][i % 3],
    }));

    this.categories = [
      { id: 'all', name: 'All', items: 115, icon: 'grid' },
      { id: 'pizza', name: 'Pizza', items: 20, icon: 'pizza' },
      { id: 'burger', name: 'Burger', items: 115, icon: 'burger' },
      { id: 'chicken', name: 'Chicken', items: 115, icon: 'chicken' },
      { id: 'bakery', name: 'Bakery', items: 115, icon: 'bakery' },
      { id: 'beverage', name: 'Beverage', items: 115, icon: 'beverage' },
    ];

    this.menuItems = Array.from({ length: 12 }).map((_, i) => ({
      id: uid('m'),
      itemId: '#27262626',
      name: 'Chicken Parmesan',
      description: 'Bread, fried chicken cutlets(usually breast)',
      image: DISH_IMG,
      stock: '122 items',
      category: 'Chicken',
      price: 55,
      availability: 'In Stock',
    }));

    this.inventory = Array.from({ length: 12 }).map(() => ({
      id: uid('inv'),
      name: 'Chicken Parmesan',
      image: DISH_IMG,
      stockInfo: 'Stocked product : 10 In Stock',
      status: 'Active',
      category: 'Chicken',
      price: 55,
    }));

    this.orders = Array.from({ length: 6 }).map((_, i) => {
      const statuses = ['Ready', 'In Process', 'Ready', 'Completed', 'In Process', 'Completed'];
      const subs = ['Ready to serve', 'Cooking Now', 'Ready to serve', 'Completed', 'Cooking Now', 'Completed'];
      return {
        id: uid('o'),
        number: `0${i + 1}`,
        customer: 'Watson Joyce',
        orderId: '#990',
        status: statuses[i],
        subStatus: subs[i],
        date: 'Wednesday, 01, 04, 2026',
        time: '4 : 48 PM',
        items: Array.from({ length: 4 }).map(() => ({ qty: 15, name: 'Scrambled eggs with toast', price: 54 })),
        subTotal: 216,
      };
    });

    this.reservations = Array.from({ length: 10 }).map(() => ({
      id: uid('r'),
      email: 'kagabo12@gmail.com',
      customer: 'Watson Joyce',
      phone: '+250 756 859 589',
      date: '23.04.2026',
      checkIn: '03:18 PM',
      checkOut: '05: 20 PM',
      total: 5500,
      status: 'Confirmed',
    }));

    this.notifications = Array.from({ length: 7 }).map((_, i) => ({
      id: uid('n'),
      title: 'Low Inventory Alert',
      message: 'This is to notify that the following items are running out of stock.',
      date: '07/04/2026',
      read: i % 2 === 0,
    }));

    this.accessUsers = [
      { id: uid('au'), name: 'Abubakar Sherazi', email: 'kagabo12@gmail.com', role: 'Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
      { id: uid('au'), name: 'Annes Ansari', email: 'annesansari@gmail.com', role: 'Sub Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
    ];

    this.popularDishes = [
      { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
      { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: false, image: DISH_IMG },
      { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
      { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
    ];
  }

  getHello() {
    return 'Hello World!';
  }

  // ----- Staff -----
  getStaff() { return this.staff; }
  getStaffMember(id) { return this.staff.find((s) => s.id === id); }
  addStaff(member) {
    const created = {
      id: `#1${String(this.staff.length + 1).padStart(2, '0')}`,
      name: member.name || 'New Staff',
      role: member.role || 'Waiter',
      email: member.email || '',
      phone: member.phone || '',
      age: member.age || 30,
      salary: member.salary || 0,
      timings: member.timings || `${member.shiftStart || '9am'} to ${member.shiftEnd || '10pm'}`,
      avatar: member.avatar || AVATAR,
      dob: member.dob || '',
      address: member.address || '',
      shiftStart: member.shiftStart || '9am',
      shiftEnd: member.shiftEnd || '10pm',
    };
    this.staff.unshift(created);
    return created;
  }
  updateStaff(id, patch) {
    const idx = this.staff.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.staff[idx] = { ...this.staff[idx], ...patch, id };
    return this.staff[idx];
  }
  deleteStaff(id) {
    this.staff = this.staff.filter((s) => s.id !== id);
    return { ok: true };
  }

  // ----- Attendance -----
  getAttendance() { return this.attendance; }
  setAttendance(id, status) {
    const rec = this.attendance.find((a) => a.id === id);
    if (rec) rec.status = status;
    return rec;
  }

  // ----- Categories -----
  getCategories() { return this.categories; }
  addCategory(cat) {
    const created = { id: uid('cat'), name: cat.name || 'New Category', items: cat.items || 0, icon: cat.icon || 'grid' };
    this.categories.push(created);
    return created;
  }
  deleteCategory(id) { this.categories = this.categories.filter((c) => c.id !== id); return { ok: true }; }

  // ----- Menu -----
  getMenuItems() { return this.menuItems; }
  addMenuItem(item) {
    const created = {
      id: uid('m'), itemId: item.itemId || `#${Math.floor(Math.random() * 9e7)}`,
      name: item.name || 'New Item', description: item.description || '', image: item.image || DISH_IMG,
      stock: item.stock || '0 items', category: item.category || 'Chicken', price: item.price || 0,
      availability: item.availability || 'In Stock',
    };
    this.menuItems.unshift(created);
    return created;
  }
  updateMenuItem(id, patch) {
    const idx = this.menuItems.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.menuItems[idx] = { ...this.menuItems[idx], ...patch, id };
    return this.menuItems[idx];
  }
  deleteMenuItem(id) { this.menuItems = this.menuItems.filter((m) => m.id !== id); return { ok: true }; }

  // ----- Inventory -----
  getInventory() { return this.inventory; }
  addInventory(item) {
    const created = {
      id: uid('inv'), name: item.name || 'New Product', image: item.image || DISH_IMG,
      stockInfo: item.stockInfo || 'Stocked product : 0 In Stock', status: item.status || 'Active',
      category: item.category || 'Chicken', price: item.price || 0,
    };
    this.inventory.unshift(created);
    return created;
  }
  updateInventory(id, patch) {
    const idx = this.inventory.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.inventory[idx] = { ...this.inventory[idx], ...patch, id };
    return this.inventory[idx];
  }
  deleteInventory(id) { this.inventory = this.inventory.filter((m) => m.id !== id); return { ok: true }; }

  // ----- Orders -----
  getOrders() { return this.orders; }
  addOrder(order) {
    const created = {
      id: uid('o'), number: `0${this.orders.length + 1}`, customer: order.customer || 'New Customer',
      orderId: order.orderId || `#${Math.floor(Math.random() * 9000) + 1000}`, status: order.status || 'In Process',
      subStatus: order.subStatus || 'Cooking Now', date: order.date || 'Today', time: order.time || '12:00 PM',
      items: order.items || [{ qty: 1, name: 'New Item', price: 10 }], subTotal: order.subTotal || 10,
    };
    this.orders.unshift(created);
    return created;
  }
  updateOrder(id, patch) {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.orders[idx] = { ...this.orders[idx], ...patch, id };
    return this.orders[idx];
  }
  deleteOrder(id) { this.orders = this.orders.filter((o) => o.id !== id); return { ok: true }; }

  // ----- Reservations -----
  getReservations() { return this.reservations; }
  deleteReservation(id) { this.reservations = this.reservations.filter((r) => r.id !== id); return { ok: true }; }

  // ----- Notifications -----
  getNotifications() { return this.notifications; }
  deleteNotification(id) { this.notifications = this.notifications.filter((n) => n.id !== id); return { ok: true }; }
  markAllRead() { this.notifications.forEach((n) => { n.read = true; }); return this.notifications; }

  // ----- Access control -----
  getAccessUsers() { return this.accessUsers; }
  addAccessUser(u) {
    const created = {
      id: uid('au'), name: u.name || 'New User', email: u.email || '', role: u.role || 'Sub Admin',
      permissions: u.permissions || { Dashboard: true, Reports: false, Inventory: false, Orders: false, Settings: false },
    };
    this.accessUsers.push(created);
    return created;
  }
  togglePermission(id, perm, value) {
    const u = this.accessUsers.find((x) => x.id === id);
    if (u) u.permissions[perm] = value;
    return u;
  }
  deleteAccessUser(id) { this.accessUsers = this.accessUsers.filter((u) => u.id !== id); return { ok: true }; }

  // ----- Dashboard / reports -----
  getPopularDishes() { return this.popularDishes; }
  getDashboardStats() {
    return { dailySales: '$ 2k', monthlyRevenue: '$ 52k', tablesOccupancy: '25 Tables', date: '9 February 2026' };
  }
  getReservationSummary() {
    return {
      total: 192,
      breakdown: [
        { label: 'Confirmed', value: 60 },
        { label: 'Awaited', value: 30 },
        { label: 'Cancelled', value: 25 },
        { label: 'Failed', value: 20 },
        { label: 'Fullfilled', value: 57 },
      ],
    };
  }

  static from() {
    return new FoodeyService();
  }
}
