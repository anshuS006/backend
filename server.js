const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('./config/db.config');
require('dotenv').config();

const userRoutes = require('./routes/user.route');
const newsRoutes = require('./routes/news.route');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors'); 

const authenticate = require('./middlewares/authenticate');

const app = express();

app.use(cors());
const PORT = process.env.PORT || 3000;

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
app.listen(PORT, () => {
    console.log(`JoshQuiz server running on http://localhost:${PORT}`);
    
});
