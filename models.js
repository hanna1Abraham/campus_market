const mongoose = require('mongoose');

// User Schema (Campus-specific validation)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/@.*\.edu$/, 'Must use a valid .edu campus email address'] 
  },
  password: { type: String, required: true },
  campusLocation: { type: String, required: true }, // e.g., "North Campus Dorms"
  createdAt: { type: Date, default: Date.now }
});

// Product Listing Schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Other'], 
    default: 'Other' 
  },
  condition: { 
    type: String, 
    enum: ['New', 'Like New', 'Good', 'Fair'], 
    required: true 
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Available', 'Pending', 'Sold'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);

module.exports = { User, Item };
