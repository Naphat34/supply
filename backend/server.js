const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
require('dotenv').config();

//เพิ่ม router
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const issuanceRoutes = require('./src/routes/issuanceRoutes');
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes'); 
const stockRoutes = require('./src/routes/stockRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
app.use(cors({
  origin: 'https://cssdbk.onrender.com',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/requisitions', requestRoutes);
app.use('/api/issuances', issuanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));