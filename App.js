const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Connect to MongoDB database
mongoose.connect('mongodb://localhost/sample_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create schema for sample data
const sampleDataSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  car: {
    brand: String,
    model: String,
  },
  phone: {
    number: String,
    price: Number,
  },
  income: Number,
  city: String,
});

// Create model for sample data
const SampleData = mongoose.model('SampleData', sampleDataSchema);

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Define API routes
app.get('/api/users/income-bmw-mercedes', async (req, res) => {
  const users = await SampleData.find({
    income: { $lt: 5 },
    $or: [{ 'car.brand': 'BMW' }, { 'car.brand': 'Mercedes' }],
  });
  res.json(users);
});

app.get('/api/users/male-phone-price', async (req, res) => {
  const users = await SampleData.find({
    gender: 'Male',
    'phone.price': { $gt: 10000 },
  });
  res.json(users);
});

app.get('/api/users/last-name-email', async (req, res) => {
  const users = await SampleData.find({
    last_name: { $regex: /^M/ },
    email: { $regex: /^.*M.*$/ },
    $where: 'this.email.length > 15',
  });
  res.json(users);
});

app.get('/api/users/bmw-mercedes-audi-email', async (req, res) => {
  const users = await SampleData.find({
    $or: [
      { 'car.brand': 'BMW' },
      { 'car.brand': 'Mercedes' },
      { 'car.brand': 'Audi' },
    ],
    email: { $regex: /^[^0-9]*$/ },
  });
  res.json(users);
});

app.get('/api/cities/top-10', async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
        average_income: { $avg: '$income' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ];
  const cities = await SampleData.aggregate(pipeline);
  res.json(cities);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
