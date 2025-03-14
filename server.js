"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var dbConnect = require('./config/db.config');
require('dotenv').config();
var userRoutes = require('./routes/user.route');
var newsRoutes = require('./routes/news.route');
var errorHandler = require('./middlewares/errorHandler');
var cors = require('cors');
var authenticate = require('./middlewares/authenticate');
var app = express();
app.use(cors());
var PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to the database
dbConnect();
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes); // Category routes
// app.use('/api/questions',authenticate, questionRoutes); // Question routes
// app.use('/api/quizzes', authenticate,quizRoutes); // Register quiz routes

// Error Handler (must be used after all routes)
app.use(errorHandler);

// Start the server
app.listen(PORT, function () {
  console.log("JoshQuiz server running on http://localhost:".concat(PORT));
});