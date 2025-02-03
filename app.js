require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Connect to MongoDB
connectDB();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', require('./routes/index'));
app.use('/about', require('./routes/index'));
app.use('/faq', require('./routes/index'));
app.use('/privacy', require('./routes/index'));
app.use('/terms', require('./routes/index'));
app.use('/guideline', require('./routes/index'));
app.use('/app', require('./routes/index'));
app.get('/api/messages/:channel', require('./routes/users'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404', );
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Internal Server Error' });
});

module.exports = app;
