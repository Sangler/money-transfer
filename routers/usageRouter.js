const express = require("express");
const router = express.Router();

// models
const User = require('../models/users.js'); 

const catchAsync = require('../utils/catchAsync.js');
const isValidUser = require('../utils/middleware.js');
const isValidEmail = require('../utils/emailVerified.js');
// const isValidJob = require('../utils/jobVerified.js');
const {configureBrowser, checkPrice, sendNotification, generateJobID} = require('../utils/scrape.js');

const Sha256 = require("sha256");

const CronJob = require('cron').CronJob;

//HTTP GET requests

router.get('/cad-trf/email', isValidUser, catchAsync( async(req,res)=>{ 
  const currentUser = req.params;
  const currentEmail = req.session.email;

  if(!currentUser){
    return res.redirect('/login');
  };

  res.render('./mainpage.ejs', {currentUser, currentEmail});
  
}));


router.get('/cad-trf/auth',(req,res)=>{ 
  res.render('./mainpage.ejs');
  //res.render('page', { companyName: 'GlobalExchange', user: req.user })
});



//HTTP POST requests

router.post('/cad-trf',(req,res)=>{ 
  res.redirect('/login');
});

module.exports = router;