'use strict';

// Force Node.js to use Google DNS for Atlas SRV record resolution
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/database');

const seedBusinessUser = async () => {
  try {
    await connectDB();

    const userName = 'techcorp';
    const password = 'techcorp@123';
    
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      console.log(`User ${userName} already exists.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      password: hashedPassword,
      role: 'BUSINESS',
      businessId: 'TECH-001',
      businessName: 'TechCorp Solutions',
      status: 'Active',
      createdBy: 'system',
    });

    await newUser.save();
    console.log(`✅ Business user created successfully:`);
    console.log(`   Username: ${userName}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: BUSINESS`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding business user:', error);
    process.exit(1);
  }
};

seedBusinessUser();
