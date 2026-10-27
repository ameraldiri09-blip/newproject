/**
 * Dyouf Al-Busaraya Transport Company - Backend API Service
 * Express.js REST API & Database Integration
 * Fleet: 7 Luxury Pullman Coaches between Damascus and Deir ez-Zor (Strictly 50-Passenger Capacity)
 * Strictly Named: باص رقم 1 سعة 50 راكب إلى باص رقم 7 سعة 50 راكب (No Driver Names or License Plates)
 * Booking & Verification: 100% In-Platform Verification (No WhatsApp Dependency)
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 7 Modern Pullman Coaches (Strictly 50 seats each, no driver or plate names)
const fleet = [
  { id: 1, name: "باص رقم 1 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 2, name: "باص رقم 2 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 3, name: "باص رقم 3 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 4, name: "باص رقم 4 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 5, name: "باص رقم 5 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 6, name: "باص رقم 6 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
  { id: 7, name: "باص رقم 7 سعة 50 راكب", capacity: 50, status: "جاهز للانطلاق" },
];

// In-Memory Database fallback / Pool connector with dynamic trip pricing and 50-seat fleet
let trips = [
  { id: 'TRIP-1', route: 'دمشق ⬅️ دير الزور', time: '05:00 AM', coachId: 1, capacity: 50, booked: 34, price: 150000, status: 'confirmed', date: new Date().toISOString().split('T')[0] },
  { id: 'TRIP-2', route: 'دير الزور ⬅️ دمشق', time: '05:00 AM', coachId: 2, capacity: 50, booked: 29, price: 150000, status: 'confirmed', date: new Date().toISOString().split('T')[0] },
  { id: 'TRIP-3', route: 'دمشق ⬅️ دير الزور', time: '09:00 PM', coachId: 3, capacity: 50, booked: 42, price: 160000, status: 'confirmed', date: new Date().toISOString().split('T')[0] },
  { id: 'TRIP-4', route: 'دير الزور ⬅️ دمشق', time: '09:00 PM', coachId: 4, capacity: 50, booked: 18, price: 160000, status: 'confirmed', date: new Date().toISOString().split('T')[0] },
];

let bookings = [
  {
    id: 'BS-2026-9921',
    name: 'أحمد إبراهيم الديري',
    phone: '0988123456',
    nid: '09010023451',
    route: 'دمشق ⬅️ دير الزور',
    date: new Date().toISOString().split('T')[0],
    time: '05:00 AM',
    coachId: 1,
    coachName: 'باص رقم 1 سعة 50 راكب',
    seatNum: 14,
    tripId: 'TRIP-1',
    price: 150000,
    shamCode: '8839210',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let systemSettings = {
  sham_account: '0998765432',
  support_phone: '0988123456',
  sham_qr_base64: ''
};

// GET /api/fleet - Retrieve Pullman fleet list
app.get('/api/fleet', (req, res) => {
  res.json({ success: true, fleet });
});

// GET /api/trips - Retrieve all trips
app.get('/api/trips', (req, res) => {
  res.json({ success: true, trips });
});

// GET /api/bookings - Retrieve all bookings (for supervisor dashboard)
app.get('/api/bookings', (req, res) => {
  res.json({ success: true, bookings });
});

// GET /api/bookings/my - Passenger looks up bookings by phone or ID
app.get('/api/bookings/my', (req, res) => {
  const query = (req.query.q || req.query.phone || '').trim().toLowerCase();
  if (!query) return res.json({ success: true, bookings: [] });

  const results = bookings.filter(b => 
    b.phone.toLowerCase().includes(query) || 
    b.id.toLowerCase().includes(query)
  );
  res.json({ success: true, bookings: results });
});

// POST /api/trips - Supervisor adds new trip with custom price
app.post('/api/trips', (req, res) => {
  const { route, time, coachId, date, price, notes } = req.body;
  if (!route || !time || !coachId) {
    return res.status(400).json({ success: false, message: 'بيانات الرحلة غير مكتملة' });
  }

  const newTrip = {
    id: `TRIP-${Date.now()}`,
    route,
    time,
    coachId: parseInt(coachId),
    date: date || new Date().toISOString().split('T')[0],
    price: parseFloat(price) || 150000,
    capacity: 50,
    booked: 0,
    status: 'confirmed',
    notes: notes || ''
  };

  trips.push(newTrip);
  res.status(201).json({ success: true, message: 'تمت إضافة الرحلة بنجاح', trip: newTrip });
});

// PATCH /api/trips/:id - Supervisor updates trip price & schedule
app.patch('/api/trips/:id', (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });

  if (req.body.price !== undefined) trip.price = parseFloat(req.body.price);
  if (req.body.time !== undefined) trip.time = req.body.time;
  if (req.body.status !== undefined) trip.status = req.body.status;

  res.json({ success: true, message: 'تم تحديث بيانات وسعر الرحلة', trip });
});

// POST /api/bookings - Passenger creates reservation
app.post('/api/bookings', (req, res) => {
  const { name, phone, nid, route, time, coachId, seatNum, shamCode, tripId } = req.body;
  if (!name || !phone || !seatNum || !shamCode) {
    return res.status(400).json({ success: false, message: 'بيانات الحجز غير مكتملة' });
  }

  if (!/^\d{6,12}$/.test(shamCode.toString().trim())) {
    return res.status(400).json({ success: false, message: 'رمز عملية شام كاش غير صحيح. يجب أن يتألف من 6 إلى 12 رقماً كما في إشعار العملية' });
  }

  const seatInt = parseInt(seatNum);
  if (seatInt < 1 || seatInt > 50) {
    return res.status(400).json({ success: false, message: 'رقم المقعد يجب أن يكون بين 1 و 50' });
  }

  const targetTrip = trips.find(t => t.id === tripId) || trips[0];
  const assignedCoach = fleet.find(f => f.id === parseInt(coachId || targetTrip.coachId));
  const coachName = assignedCoach ? assignedCoach.name : `باص رقم ${targetTrip.coachId} سعة 50 راكب`;

  const bookingId = `BS-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking = {
    id: bookingId,
    name,
    phone,
    nid: nid || '',
    route: route || targetTrip.route,
    date: targetTrip.date,
    time: time || targetTrip.time,
    coachId: parseInt(coachId || targetTrip.coachId),
    coachName,
    seatNum: seatInt,
    tripId: targetTrip.id,
    price: targetTrip.price,
    shamCode,
    status: 'pending', // pending supervisor payment verification on the website
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);

  // In-platform supervisor notification event log
  console.log(`[إشعار حجز داخلي بالموقع] وصل حجز جديد #${newBooking.id} للمسافر ${newBooking.name} - ${coachName} مقعد ${seatInt} - رمز شام كاش: ${newBooking.shamCode}`);

  res.status(201).json({ success: true, booking: newBooking });
});

// PATCH /api/supervisor/verify/:id - Supervisor confirms Sham Cash payment
app.patch('/api/supervisor/verify/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'الحجز غير موجود' });

  booking.status = 'confirmed';
  res.json({ success: true, message: 'تم تأكيد الحجز وإصدار التذكرة الرسمية بنجاح', booking });
});

// PATCH /api/supervisor/reject/:id - Supervisor rejects invalid booking
app.patch('/api/supervisor/reject/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'الحجز غير موجود' });

  booking.status = 'cancelled';
  res.json({ success: true, message: 'تم إلغاء الحجز وإعادة المقعد إلى المتاح', booking });
});

// GET /api/settings - Retrieve supervisor settings (Sham Cash & Support)
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: systemSettings });
});

// POST /api/settings - Supervisor updates Sham Cash account or QR
app.post('/api/settings', (req, res) => {
  const { sham_account, support_phone, sham_qr_base64 } = req.body;
  if (sham_account) systemSettings.sham_account = sham_account;
  if (support_phone) systemSettings.support_phone = support_phone;
  if (sham_qr_base64) systemSettings.sham_qr_base64 = sham_qr_base64;

  res.json({ success: true, message: 'تم تحديث الإعدادات بنجاح', settings: systemSettings });
});

// Start Server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Dyouf Al-Busaraya backend server running on port ${PORT}`);
  });
}

module.exports = app;
