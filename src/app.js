//create server
//configure server
//routes
//export server

const express = require('express');
const app = express();

//cookie parser
const cookieParser = require('cookie-parser');

//routes required
const authRoutes = require('./routes/auth.route');
const accountRoutes = require('./routes/account.route');
const transactionRouter = require('./routes/transaction.route');

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRouter);

module.exports = app;
