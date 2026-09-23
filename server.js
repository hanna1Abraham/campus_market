const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Item } = require('./models');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'campus_market_secret_key';
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/campus_market')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects: "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Contains { id, email }
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, campusLocation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, campusLocation });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MARKETPLACE ROUTES ====================

// Get All Available Items (Search & Filter)
app.get('/api/items', async (req, res) => {
  try {
    const { search, category, maxPrice } = req.query;
    let query = { status: 'Available' };

    if (search) {
      query.title = { $regex: search,$options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    const items = await Item.find(query).populate('seller', 'name campusLocation email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create New Item Listing (Protected)
app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body;

    const newItem = new Item({
      title,
      description,
      price,
      category,
      condition,
      seller: req.user.id
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Item Status / Details (Protected)
app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Item Listing (Protected)
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await item.deleteOne();
    res.json({ message: 'Listing removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Campus Market API running on port ${PORT}`));
