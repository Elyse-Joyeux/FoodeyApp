/**
 * Foodey backend service — provides mock data for all restaurant management modules.
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

const AVATAR = 'https://api.v2.bit.cloud/file-upload/api/bf3c8ae9929e2601ca4c6e7caa146a1e.png';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

/**
 * Foodey service exposing data accessors for the restaurant dashboard.
 */
export class FoodeyService {
  private staff: StaffMember[] = Array.from({ length: 22 }).map((_, i) => ({
    id: `#10${i + 1}`,
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
    id: `#10${i + 1}`,
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
    id: `m${i + 1}`,
    itemId: '#27262626',
    name: 'Chicken Parmesan',
    description: 'Bread, fried chicken cutlets(usually breast)',
    image: DISH_IMG,
    stock: '122 items',
    category: 'Chicken',
    price: 55,
    availability: 'In Stock',
  }));

  private inventory: InventoryItem[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `inv${i + 1}`,
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
      id: `o${i + 1}`,
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

  private reservations: Reservation[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `r${i + 1}`,
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
    id: `n${i + 1}`,
    title: 'Low Inventory Alert',
    message: 'This is to notify that the following items are running out of stock.',
    date: '07/04/2026',
    read: i % 2 === 0,
  }));

  private popularDishes: Dish[] = [
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: false, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
    { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
  ];

  /** Get all staff members. */
  getStaff() { return this.staff; }
  /** Get a single staff member by id. */
  getStaffMember(id: string) { return this.staff.find((s) => s.id === id); }
  /** Get attendance records. */
  getAttendance() { return this.attendance; }
  /** Get menu categories. */
  getCategories() { return this.categories; }
  /** Get menu items. */
  getMenuItems() { return this.menuItems; }
  /** Get inventory items. */
  getInventory() { return this.inventory; }
  /** Get orders. */
  getOrders() { return this.orders; }
  /** Get reservations. */
  getReservations() { return this.reservations; }
  /** Get notifications. */
  getNotifications() { return this.notifications; }
  /** Get popular dishes. */
  getPopularDishes() { return this.popularDishes; }

  /** Dashboard summary stats. */
  getDashboardStats() {
    return {
      dailySales: '$ 2k',
      monthlyRevenue: '$ 52k',
      tablesOccupancy: '25 Tables',
      date: '9 February 2026',
    };
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

  /** Create a new staff member. */
  addStaff(member: Partial<StaffMember>) {
    const newMember: StaffMember = {
      id: `#10${this.staff.length + 1}`,
      name: member.name || 'New Staff',
      role: member.role || 'Waiter',
      email: member.email || '',
      phone: member.phone || '',
      age: member.age || 0,
      salary: member.salary || 0,
      timings: member.timings || '9am to 10pm',
      avatar: AVATAR,
      dob: member.dob || '',
      address: member.address || '',
      shiftStart: member.shiftStart || '',
      shiftEnd: member.shiftEnd || '',
    };
    this.staff.push(newMember);
    return newMember;
  }

  /**
   * create a new instance of a foodey service.
   */
  static from() {
    return new FoodeyService();
  }
}
