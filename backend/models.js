import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const schemaOptions = { versionKey: false, timestamps: true };
const createId = () => nanoid(14);

const staffSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  restaurantId: String,
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
  _id: { type: String, default: createId },
  restaurantId: String,
  name: String,
  role: String,
  avatar: String,
  date: String,
  timings: String,
  status: String,
}, schemaOptions);

const menuSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
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
  _id: { type: String, default: createId },
  name: String,
  items: Number,
  icon: String,
}, schemaOptions);

const inventorySchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  name: String,
  image: String,
  stockInfo: String,
  status: String,
  category: String,
  price: Number,
}, schemaOptions);

const orderSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
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
  _id: { type: String, default: createId },
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
  _id: { type: String, default: createId },
  title: String,
  message: String,
  date: String,
  read: Boolean,
}, schemaOptions);

const accessUserSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  restaurantId: String,
  name: String,
  email: { type: String, lowercase: true, trim: true },
  role: String,
  permissions: Object,
}, schemaOptions);

const userSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  fullName: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: String,
  restaurantId: String,
  restaurantName: String,
  avatar: String,
  restaurantType: String,
  employeeCount: Number,
  chefCount: Number,
  serviceStyle: String,
  otpCodeHash: String,
  otpExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
}, schemaOptions);

const sessionSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  userId: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
}, schemaOptions);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

export const Staff = model('Staff', staffSchema);
export const User = model('User', userSchema);
export const Session = model('Session', sessionSchema);
export const Attendance = model('Attendance', attendanceSchema);
export const Menu = model('Menu', menuSchema);
export const Category = model('Category', categorySchema);
export const Inventory = model('Inventory', inventorySchema);
export const OrderModel = model('Order', orderSchema);
export const ReservationModel = model('Reservation', reservationSchema);
export const NotificationModel = model('Notification', notificationSchema);
export const AccessUser = model('AccessUser', accessUserSchema);
