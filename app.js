const express = require('express');
const app = express();
const path = require('path'); 
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const http = require('http'); // Required for socket.io
const socketIo = require('socket.io'); // Import socket.io

require('dotenv').config({ path: path.join(__dirname, 'utils', '.env') });
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextFsBackend = require('i18next-fs-backend');


const PORT = 8080;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'template'));

// Sessions
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly:true,
    expires: Date.now() + 1000 * 60* 60 * 24, //1 day
    maxAge: 1000 * 60 * 60*  24
  },
};

app.use(session(sessionConfig));
app.use(methodOverride('_method'));
app.use(express.static('static')); // Serve static files
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Initialize i18next for server-side translations
i18next
  .use(i18nextFsBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'vi'],
    backend: {
      loadPath: path.join(__dirname, 'locales', '{{lng}}', 'translation.json')
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie']
    },
    debug: false
  });

// Add i18next middleware to handle language detection
app.use(i18nextMiddleware.handle(i18next));

// Make session data available to all templates to work with front-end
// These code will get removed later on, when authentication process is finalized
app.use((req, res, next) => {
  try {
    res.locals.user = req.session && req.session.username ? req.session.username : null;
    // default logo and name available in all views
    res.locals.companyLogo = '/imgs/logo.png';
    res.locals.companyName = 'MyExchange';
    // expose i18n translate function and current language to templates
    res.locals.t = req.t ? req.t : (k) => i18next.t(k);
    res.locals.language = req.language || 'en';
  } catch (e) {
    // silent fallback
    res.locals.user = null;
  }
  next();
});

// Create HTTP server & attach socket.io
const server = http.createServer(app);
const io = socketIo(server); // Attach Socket.io

// Store `io` in app for access in routes
app.set("io", io);

// Mongoose connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/LuuTruTT')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Import routes
const auth_router = require('./routers/authRouter.js');
const user_router = require('./routers/usageRouter.js');

app.use('/', user_router);
app.use('/', auth_router);


//for manage CronJob running in the background
app.locals.activeJobs = {};


// Catch-all route for 404
app.get("*", (req,res) => {
    res.status(404).send("404 PAGE NOT FOUND!") 
});

// Run server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
