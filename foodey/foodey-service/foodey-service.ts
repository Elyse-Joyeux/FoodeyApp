/**
 * Foodey backend service — in-memory data store with full CRUD for every
 * restaurant management module (staff, menu, inventory, orders, reservations,
 * notifications, attendance and access control).
 */

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  age: number;
  salary: number;
  timings: string;
  avatar: string;
  dob: string;
  address: string;
  shiftStart: string;
  shiftEnd: string;
};

export type AttendanceRecord = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  date: string;
  timings: string;
  status: 'Present' | 'Absent' | 'Half Shift' | 'Leave' | '';
};

export type MenuItem = {
  id: string;
  itemId: string;
  name: string;
  description: string;
  image: string;
  stock: string;
  category: string;
  price: number;
  availability: 'In Stock' | 'Out of Stock';
};

export type MenuCategory = {
  id: string;
  name: string;
  items: number;
  icon: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  image: string;
  stockInfo: string;
  status: 'Active' | 'Inactive' | 'Draft';
  category: string;
  price: number;
};

export type Order = {
  id: string;
  number: string;
  customer: string;
  orderId: string;
  status: 'Ready' | 'In Process' | 'Completed' | 'Cancelled';
  subStatus: string;
  date: string;
  time: string;
  items: { qty: number; name: string; price: number }[];
  subTotal: number;
};

export type Reservation = {
  id: string;
  email: string;
  customer: string;
  phone: string;
  date: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: 'Confirmed' | 'Awaited' | 'Cancelled' | 'Failed' | 'Fulfilled' | 'Avoided';
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

export type Dish = {
  name: string;
  serving: string;
  price: number;
  inStock: boolean;
  image: string;
};

export type AccessUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: { Dashboard: boolean; Reports: boolean; Inventory: boolean; Orders: boolean; Settings: boolean };
};

const AVATAR = 'https://api.v2.bit.cloud/file-upload/api/bf3c8ae9929e2601ca4c6e7caa146a1e.png';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

let counter = 1000;
/** Generate a unique sequential id. */
function uid(prefix = '') {
  counter += 1;
  return `${prefix}${counter}`;
}

/**
 * Foodey service exposing CRUD accessors for the restaurant dashboard.
 */
export class FoodeyService {
  private staff: StaffMember[] = Array.from({ length: 22 }).map((_, i) => ({
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

  private attendance: AttendanceRecord[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `#1${String(i + 1).padStart(2, '0')}`,
    name: 'Jacques Kagabo',
    role: 'Manager',
    avatar: AVATAR,
    date: '16-Apr-2024',
    timings: '9am to 10pm',
    status: i % 3 === 0 ? '' : (['Present', 'Leave', 'Absent'] as const)[i % 3],
  }));

  private categories: MenuCategory[] = [
    { id: 'all', name: 'All', items: 115, icon: 'grid' },
    { id: 'pizza', name: 'Pizza', items: 20, icon: 'pizza' },
    { id: 'burger', name: 'Burger', items: 115, icon: 'burger' },
    { id: 'chicken', name: 'Chicken', items: 115, icon: 'chicken' },
    { id: 'bakery', name: 'Bakery', items: 115, icon: 'bakery' },
    { id: 'beverage', name: 'Beverage', items: 115, icon: 'beverage' },
  ];

  private menuItems: MenuItem[] = Array.from({ length: 12 }).map((_, i) => ({
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

  private inventory: InventoryItem[] = Array.from({ length: 12 }).map(() => ({
    id: uid('inv'),
    name: 'Chicken Parmesan',
    image: DISH_IMG,
    stockInfo: 'Stocked product : 10 In Stock',
    status: 'Active',
    category: 'Chicken',
    price: 55,
  }));

  private orders: Order[] = Array.from({ length: 6 }).map((_, i) => {
    const statuses: Order['status'][] = ['Ready', 'In Process', 'Ready', 'Completed', 'In Process', 'Completed'];
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

  private reservations: Reservation[] = Array.from({ length: 10 }).map(() => ({
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

  private notifications: Notification[] = Array.from({ length: 7 }).map((_, i) => ({
    id: uid('n'),
    title: 'Low Inventory Alert',
    message: 'This is to notify that the following items are running out of stock.',
    date: '07/04/2026',
    read: i % 2 === 0,
  }));

  private accessUsers: AccessUser[] = [
    { id: uid('au'), name: 'Abubakar Sherazi', email: 'kagabo12@gmail.com', role: 'Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
    { id: uid('au'), name: 'Annes Ansari', email: 'annesansari@gmail.com', role: 'Sub Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
  ];

  private popularDishes: Dish[] = [
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: false, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
  ];

  // ----- Staff -----
  /** Get all staff members. */
  getStaff() { return this.staff; }
  /** Get a single staff member by id. */
  getStaffMember(id: string) { return this.staff.find((s) => s.id === id); }
  /** Create a new staff member. */
  addStaff(member: Partial<StaffMember>): StaffMember {
    const created: StaffMember = {
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
  /** Update an existing staff member. */
  updateStaff(id: string, patch: Partial<StaffMember>) {
    const idx = this.staff.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.staff[idx] = { ...this.staff[idx], ...patch, id };
    return this.staff[idx];
  }
  /** Delete a staff member. */
  deleteStaff(id: string) {
    this.staff = this.staff.filter((s) => s.id !== id);
    return { ok: true };
  }

  // ----- Attendance -----
  /** Get attendance records. */
  getAttendance() { return this.attendance; }
  /** Update an attendance record's status. */
  setAttendance(id: string, status: AttendanceRecord['status']) {
    const rec = this.attendance.find((a) => a.id === id);
    if (rec) rec.status = status;
    return rec;
  }

  // ----- Categories -----
  /** Get menu categories. */
  getCategories() { return this.categories; }
  /** Create a menu category. */
  addCategory(cat: Partial<MenuCategory>): MenuCategory {
    const created: MenuCategory = { id: uid('cat'), name: cat.name || 'New Category', items: cat.items || 0, icon: cat.icon || 'grid' };
    this.categories.push(created);
    return created;
  }
  /** Delete a menu category. */
  deleteCategory(id: string) { this.categories = this.categories.filter((c) => c.id !== id); return { ok: true }; }

  // ----- Menu -----
  /** Get menu items. */
  getMenuItems() { return this.menuItems; }
  /** Create a menu item. */
  addMenuItem(item: Partial<MenuItem>): MenuItem {
    const created: MenuItem = {
      id: uid('m'), itemId: item.itemId || `#${Math.floor(Math.random() * 9e7)}`,
      name: item.name || 'New Item', description: item.description || '', image: item.image || DISH_IMG,
      stock: item.stock || '0 items', category: item.category || 'Chicken', price: item.price || 0,
      availability: item.availability || 'In Stock',
    };
    this.menuItems.unshift(created);
    return created;
  }
  /** Update a menu item. */
  updateMenuItem(id: string, patch: Partial<MenuItem>) {
    const idx = this.menuItems.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.menuItems[idx] = { ...this.menuItems[idx], ...patch, id };
    return this.menuItems[idx];
  }
  /** Delete a menu item. */
  deleteMenuItem(id: string) { this.menuItems = this.menuItems.filter((m) => m.id !== id); return { ok: true }; }

  // ----- Inventory -----
  /** Get inventory items. */
  getInventory() { return this.inventory; }
  /** Create an inventory item. */
  addInventory(item: Partial<InventoryItem>): InventoryItem {
    const created: InventoryItem = {
      id: uid('inv'), name: item.name || 'New Product', image: item.image || DISH_IMG,
      stockInfo: item.stockInfo || 'Stocked product : 0 In Stock', status: item.status || 'Active',
      category: item.category || 'Chicken', price: item.price || 0,
    };
    this.inventory.unshift(created);
    return created;
  }
  /** Update an inventory item. */
  updateInventory(id: string, patch: Partial<InventoryItem>) {
    const idx = this.inventory.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.inventory[idx] = { ...this.inventory[idx], ...patch, id };
    return this.inventory[idx];
  }
  /** Delete an inventory item. */
  deleteInventory(id: string) { this.inventory = this.inventory.filter((m) => m.id !== id); return { ok: true }; }

  // ----- Orders -----
  /** Get orders. */
  getOrders() { return this.orders; }
  /** Create an order. */
  addOrder(order: Partial<Order>): Order {
    const created: Order = {
      id: uid('o'), number: `0${this.orders.length + 1}`, customer: order.customer || 'New Customer',
      orderId: order.orderId || `#${Math.floor(Math.random() * 9000) + 1000}`, status: order.status || 'In Process',
      subStatus: order.subStatus || 'Cooking Now', date: order.date || 'Today', time: order.time || '12:00 PM',
      items: order.items || [{ qty: 1, name: 'New Item', price: 10 }], subTotal: order.subTotal || 10,
    };
    this.orders.unshift(created);
    return created;
  }
  /** Update an order. */
  updateOrder(id: string, patch: Partial<Order>) {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.orders[idx] = { ...this.orders[idx], ...patch, id };
    return this.orders[idx];
  }
  /** Delete an order. */
  deleteOrder(id: string) { this.orders = this.orders.filter((o) => o.id !== id); return { ok: true }; }

  // ----- Reservations -----
  /** Get reservations. */
  getReservations() { return this.reservations; }
  /** Delete a reservation. */
  deleteReservation(id: string) { this.reservations = this.reservations.filter((r) => r.id !== id); return { ok: true }; }

  // ----- Notifications -----
  /** Get notifications. */
  getNotifications() { return this.notifications; }
  /** Delete a notification. */
  deleteNotification(id: string) { this.notifications = this.notifications.filter((n) => n.id !== id); return { ok: true }; }
  /** Mark all notifications as read. */
  markAllRead() { this.notifications.forEach((n) => { n.read = true; }); return this.notifications; }

  // ----- Access control -----
  /** Get access-control users. */
  getAccessUsers() { return this.accessUsers; }
  /** Add an access-control user. */
  addAccessUser(u: Partial<AccessUser>): AccessUser {
    const created: AccessUser = {
      id: uid('au'), name: u.name || 'New User', email: u.email || '', role: u.role || 'Sub Admin',
      permissions: u.permissions || { Dashboard: true, Reports: false, Inventory: false, Orders: false, Settings: false },
    };
    this.accessUsers.push(created);
    return created;
  }
  /** Toggle a single permission for an access user. */
  togglePermission(id: string, perm: keyof AccessUser['permissions'], value: boolean) {
    const u = this.accessUsers.find((x) => x.id === id);
    if (u) u.permissions[perm] = value;
    return u;
  }
  /** Delete an access user. */
  deleteAccessUser(id: string) { this.accessUsers = this.accessUsers.filter((u) => u.id !== id); return { ok: true }; }

  // ----- Dashboard / reports -----
  /** Get popular dishes. */
  getPopularDishes() { return this.popularDishes; }
  /** Dashboard summary stats. */
  getDashboardStats() {
    return { dailySales: '$ 2k', monthlyRevenue: '$ 52k', tablesOccupancy: '25 Tables', date: '9 February 2026' };
  }
  /** Reservation report summary. */
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

  /**
   * create a new instance of a foodey service.
   */
  static from() {
    return new FoodeyService();
  }
}
