const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:8080'],
  credentials: true
}));

// In-memory store for user emails (based on user ID from cookies)
const userEmails = {};

// Middleware to identify user based on cookies
app.use((req, res, next) => {
  // Check if the user has a cookie
  let userId = req.cookies.userId;
  
  // If no userId cookie, generate a new one and store it in a cookie
  if (!userId) {
    userId = new Date().getTime().toString(); // Simple unique ID generation
    res.cookie('userId', userId, { sameSite: 'None',secure:true });
  }

  // Attach user ID and email to the request object
  req.user = { id: userId, email: userEmails[userId] || 'user@example.com' };
  
  next();
});

// Endpoint to change user email
app.post('/change-email', (req, res) => {
  const { email } = req.body;
  
  // Store the email address for the current user based on their userId
  userEmails[req.user.id] = email;
  
  res.send(`Email changed to: ${email}`);
});

// Endpoint to get current email
app.get('/get-email', (req, res) => {
  res.send(`Current email: ${req.user.email}`);
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
