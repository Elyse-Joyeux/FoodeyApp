import mongoose from 'mongoose';

const schemaOptions = { versionKey: false };

const staffSchema = new mongoose.Schema({
  _id: String,
  name: String,
  role: String,
  email: String,
  phone: String,
  age: Number,
  salary: Number,
  timings: String,
  avatar: String,
  dob: String,
  address: String,
  shiftStart: String,
  shiftEnd: String,
}, schemaOptions);

const attendanceSchema = new mongoose.Schema({
  _id: String,
  name: String,
  role: String,
  avatar: String,
  date: String,
  timings: String,
  status: String,
}, schemaOptions);

const menuSchema = new mongoose.Schema({
  _id: String,
  itemId: String,
  name: String,
  description: String,
  image: String,
  stock: String,
  category: String,
  price: Number,
  availability: String,
  menu: String,
}, schemaOptions);

const categorySchema = new mongoose.Schema({
  _id: String,
  name: String,
  items: Number,
  icon: String,
}, schemaOptions);

const inventorySchema = new mongoose.Schema({
  _id: String,
  name: String,
  image: String,
  stockInfo: String,
  status: String,
  category: String,
  price: Number,
}, schemaOptions);

const orderSchema = new mongoose.Schema({
  _id: String,
  number: String,
  customer: String,
  orderId: String,
  status: String,
  subStatus: String,
  date: String,
  time: String,
  items: [{ qty: Number, name: String, price: Number }],
  subTotal: Number,
}, schemaOptions);

const reservationSchema = new mongoose.Schema({
  _id: String,
  email: String,
  customer: String,
  phone: String,
  date: String,
  checkIn: String,
  checkOut: String,
  total: Number,
  status: String,
}, schemaOptions);

const notificationSchema = new mongoose.Schema({
  _id: String,
  title: String,
  message: String,
  date: String,
  read: Boolean,
}, schemaOptions);

const accessUserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  role: String,
  permissions: Object,
}, schemaOptions);

const userSchema = new mongoose.Schema({
  _id: String,
  fullName: String,
  email: String,
  password: String,
  restaurantName: String,
  createdAt: { type: Date, default: Date.now },
}, schemaOptions);

function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

export const Staff = model('Staff', staffSchema);
export const User = model('User', userSchema);
export const Attendance = model('Attendance', attendanceSchema);
export const Menu = model('Menu', menuSchema);
export const Category = model('Category', categorySchema);
export const Inventory = model('Inventory', inventorySchema);
export const OrderModel = model('Order', orderSchema);
export const ReservationModel = model('Reservation', reservationSchema);
export const NotificationModel = model('Notification', notificationSchema);
export const AccessUser = model('AccessUser', accessUserSchema);
