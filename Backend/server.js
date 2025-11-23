require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://hikma-finance.vercel.app" 
  ],
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://finance:finance@cluster0.w0v0u10.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
      console.error('MongoDB Connection Error:', err);
  });

// --- SCHEMAS ---

const AdminSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String, 
  role: { type: String, default: 'admin' }
});

const StudentSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  accountBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ClassSchema = new mongoose.Schema({
  name: String,
  accountBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// NEW: Special Fund Schema
const SpecialFundSchema = new mongoose.Schema({
  name: String,
  description: String,
  accountBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  entityId: String, 
  entityType: String, // 'student', 'class', 'special'
  amount: Number,
  type: String, // 'deposit', 'withdrawal'
  date: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);
const Student = mongoose.model('Student', StudentSchema);
const Class = mongoose.model('Class', ClassSchema);
const SpecialFund = mongoose.model('SpecialFund', SpecialFundSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- ROUTES ---

// 1. Initialization
app.post('/api/seed', async (req, res) => {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create([
      { name: 'Admin One', username: 'admin1', password: 'admin123' },
      { name: 'Admin Two', username: 'admin2', password: 'admin223' }
    ]);
  }
  res.json({ message: 'Database seeded successfully' });
});

// 2. Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username, password });
  if (admin) {
    return res.json({ 
      success: true, 
      user: { id: admin._id, name: admin.name, username: admin.username, role: 'admin' } 
    });
  }

  const student = await Student.findOne({ username, password });
  if (student) {
    return res.json({ 
      success: true, 
      user: { id: student._id, name: student.name, username: student.username, role: 'student' } 
    });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// 3. Fetch All Data
app.get('/api/data', async (req, res) => {
  try {
    const admins = await Admin.find();
    const students = await Student.find();
    const classes = await Class.find();
    const specialFunds = await SpecialFund.find();
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ admins, students, classes, specialFunds, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. CRUD Routes

// Students
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json(newStudent);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/students/:id', async (req, res) => {
  try { await Student.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Classes
app.post('/api/classes', async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.json(newClass);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/classes/:id', async (req, res) => {
  try { await Class.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Special Funds
app.post('/api/special-funds', async (req, res) => {
  try {
    const newFund = new SpecialFund(req.body);
    await newFund.save();
    res.json(newFund);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/special-funds/:id', async (req, res) => {
  try { await SpecialFund.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Admins
app.post('/api/admins', async (req, res) => {
  try {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.json(newAdmin);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/admins/:id', async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/admins/:id', async (req, res) => {
  try { await Admin.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const { entityId, entityType, amount, type, date, reason } = req.body;
    const numAmount = Number(amount);

    const transaction = new Transaction({
      entityId, entityType, amount: numAmount, type, date, reason
    });
    await transaction.save();

    if (entityType === 'student') {
      const student = await Student.findById(entityId);
      if (student) {
        student.accountBalance = type === 'deposit' 
          ? student.accountBalance + numAmount 
          : student.accountBalance - numAmount;
        await student.save();
      }
    } else if (entityType === 'class') {
      const classEntity = await Class.findById(entityId);
      if (classEntity) {
        classEntity.accountBalance = type === 'deposit' 
          ? classEntity.accountBalance + numAmount 
          : classEntity.accountBalance - numAmount;
        await classEntity.save();
      }
    } else if (entityType === 'special') {
      const specialFund = await SpecialFund.findById(entityId);
      if (specialFund) {
        specialFund.accountBalance = type === 'deposit' 
          ? specialFund.accountBalance + numAmount 
          : specialFund.accountBalance - numAmount;
        await specialFund.save();
      }
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});