/** Shared data types for the Foodey app, mirroring the backend service. */

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
  menu?: string;
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

export type DashboardStats = {
  dailySales: string;
  monthlyRevenue: string;
  tablesOccupancy: string;
  date: string;
};

export type ReservationSummary = {
  total: number;
  breakdown: { label: string; value: number }[];
};
