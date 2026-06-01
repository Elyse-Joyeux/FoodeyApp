import type {
  StaffMember, AttendanceRecord, MenuItem, MenuCategory, InventoryItem,
  Order, Reservation, Notification, Dish, DashboardStats, ReservationSummary,
} from '../types.js';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&fit=crop&crop=faces';
const DISH_IMG = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&q=80';

export const mockStaff: StaffMember[] = Array.from({ length: 22 }).map((_, i) => ({
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

export const mockAttendance: AttendanceRecord[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `#10${i + 1}`,
  name: 'Jacques Kagabo',
  role: 'Manager',
  avatar: AVATAR,
  date: '16-Apr-2024',
  timings: '9am to 10pm',
  status: i % 3 === 0 ? '' : (['Present', 'Leave', 'Absent'] as const)[i % 3],
}));

export const mockCategories: MenuCategory[] = [
  { id: 'all', name: 'All', items: 115, icon: 'grid' },
  { id: 'pizza', name: 'Pizza', items: 20, icon: 'pizza' },
  { id: 'burger', name: 'Burger', items: 115, icon: 'burger' },
  { id: 'chicken', name: 'Chicken', items: 115, icon: 'chicken' },
  { id: 'bakery', name: 'Bakery', items: 115, icon: 'bakery' },
  { id: 'beverage', name: 'Beverage', items: 115, icon: 'beverage' },
];

export const mockMenuItems: MenuItem[] = Array.from({ length: 12 }).map((_, i) => ({
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

export const mockInventory: InventoryItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `inv${i + 1}`,
  name: 'Chicken Parmesan',
  image: DISH_IMG,
  stockInfo: 'Stocked product : 10 In Stock',
  status: 'Active',
  category: 'Chicken',
  price: 55,
}));

export const mockOrders: Order[] = Array.from({ length: 6 }).map((_, i) => {
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

export const mockReservations: Reservation[] = Array.from({ length: 10 }).map((_, i) => ({
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

export const mockNotifications: Notification[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `n${i + 1}`,
  title: 'Low Inventory Alert',
  message: 'This is to notify that the following items are running out of stock.',
  date: '07/04/2026',
  read: i % 2 === 0,
}));

export const mockPopularDishes: Dish[] = [
  { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
  { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: false, image: DISH_IMG },
  { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
  { name: 'Chicken Parmesan', serving: '01 Person', price: 55, inStock: true, image: DISH_IMG },
];

export const mockDashboardStats: DashboardStats = {
  dailySales: '$ 2k',
  monthlyRevenue: '$ 52k',
  tablesOccupancy: '25 Tables',
  date: '9 February 2026',
};

export const mockReservationSummary: ReservationSummary = {
  total: 192,
  breakdown: [
    { label: 'Confirmed', value: 60 },
    { label: 'Awaited', value: 30 },
    { label: 'Cancelled', value: 25 },
    { label: 'Failed', value: 20 },
    { label: 'Fullfilled', value: 57 },
  ],
};
