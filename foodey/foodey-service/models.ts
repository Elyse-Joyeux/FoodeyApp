import mongoose, { Schema, Model } from 'mongoose';

/** Mongoose document shapes for every Foodey collection. */
export type StaffDoc = {
  _id: string; name: string; role: string; email: string; phone: string; age: number;
  salary: number; timings: string; avatar: string; dob: string; address: string; shiftStart: string; shiftEnd: string;
};
export type AttendanceDoc = { _id: string; name: string; role: string; avatar: string; date: string; timings: string; status: string };
export type MenuDoc = { _id: string; itemId: string; name: string; description: string; image: string; stock: string; category: string; price: number; availability: string; menu: string };
export type CategoryDoc = { _id: string; name: string; items: number; icon: string };
export type InventoryDoc = { _id: string; name: string; image: string; stockInfo: string; status: string; category: string; price: number };
export type OrderDoc = { _id: string; number: string; customer: string; orderId: string; status: string; subStatus: string; date: string; time: string; items: { qty: number; name: string; price: number }[]; subTotal: number };
export type ReservationDoc = { _id: string; email: string; customer: string; phone: string; date: string; checkIn: string; checkOut: string; total: number; status: string };
export type NotificationDoc = { _id: string; title: string; message: string; date: string; read: boolean };
export type AccessUserDoc = { _id: string; name: string; email: string; role: string; permissions: Record<string, boolean> };

const opts = { versionKey: false };

const staffSchema = new Schema<StaffDoc>({
  _id: String, name: String, role: String, email: String, phone: String, age: Number,
  salary: Number, timings: String, avatar: String, dob: String, address: String, shiftStart: String, shiftEnd: String,
}, opts);
const attendanceSchema = new Schema<AttendanceDoc>({
  _id: String, name: String, role: String, avatar: String, date: String, timings: String, status: String,
}, opts);
const menuSchema = new Schema<MenuDoc>({
  _id: String, itemId: String, name: String, description: String, image: String, stock: String,
  category: String, price: Number, availability: String, menu: String,
}, opts);
const categorySchema = new Schema<CategoryDoc>({ _id: String, name: String, items: Number, icon: String }, opts);
const inventorySchema = new Schema<InventoryDoc>({
  _id: String, name: String, image: String, stockInfo: String, status: String, category: String, price: Number,
}, opts);
const orderSchema = new Schema<OrderDoc>({
  _id: String, number: String, customer: String, orderId: String, status: String, subStatus: String,
  date: String, time: String, items: [{ qty: Number, name: String, price: Number }], subTotal: Number,
}, opts);
const reservationSchema = new Schema<ReservationDoc>({
  _id: String, email: String, customer: String, phone: String, date: String, checkIn: String, checkOut: String, total: Number, status: String,
}, opts);
const notificationSchema = new Schema<NotificationDoc>({ _id: String, title: String, message: String, date: String, read: Boolean }, opts);
const accessUserSchema = new Schema<AccessUserDoc>({ _id: String, name: String, email: String, role: String, permissions: Object }, opts);

/** Lazily-created model to avoid "OverwriteModelError" on hot reload. */
function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const Staff = model<StaffDoc>('Staff', staffSchema);
export const Attendance = model<AttendanceDoc>('Attendance', attendanceSchema);
export const Menu = model<MenuDoc>('Menu', menuSchema);
export const Category = model<CategoryDoc>('Category', categorySchema);
export const Inventory = model<InventoryDoc>('Inventory', inventorySchema);
export const OrderModel = model<OrderDoc>('Order', orderSchema);
export const ReservationModel = model<ReservationDoc>('Reservation', reservationSchema);
export const NotificationModel = model<NotificationDoc>('Notification', notificationSchema);
export const AccessUser = model<AccessUserDoc>('AccessUser', accessUserSchema);
