// backend/server.js
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
      console.log('Current Connection String:', MONGO_URI);
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

const TransactionSchema = new mongoose.Schema({
  entityId: String, 
  entityType: String, 
  amount: Number,
  type: String, 
  date: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);
const Student = mongoose.model('Student', StudentSchema);
const Class = mongoose.model('Class', ClassSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- ROUTES ---

// 1. Initialization (Seed Data)
app.post('/api/seed', async (req, res) => {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create([
      { name: 'Admin One', username: 'admin1', password: 'admin123' },
      { name: 'Admin Two', username: 'admin2', password: 'admin223' }
    ]);
  }
  
  const studentCount = await Student.countDocuments();
  if (studentCount === 0) {
    const students = Array.from({ length: 30 }).map((_, i) => ({
      name: `Student ${i + 1}`,
      username: `student${i + 1}`,
      password: `password${i + 1}`,
      accountBalance: 0
    }));
    await Student.insertMany(students);
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
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ admins, students, classes, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Management Routes (CRUD)

// Add Student
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Student - FIX: Added try/catch
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Class
app.post('/api/classes', async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Class - FIX: Added try/catch
app.delete('/api/classes/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Admin
app.post('/api/admins', async (req, res) => {
  try {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.json(newAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Admin
app.put('/api/admins/:id', async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Admin - FIX: Added try/catch
app.delete('/api/admins/:id', async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    } else {
      const classEntity = await Class.findById(entityId);
      if (classEntity) {
        classEntity.accountBalance = type === 'deposit' 
          ? classEntity.accountBalance + numAmount 
          : classEntity.accountBalance - numAmount;
        await classEntity.save();
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