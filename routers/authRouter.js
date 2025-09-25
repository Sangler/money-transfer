const express = require("express");
const router = express.Router();
const argon2 = require('argon2');
const crypto = require('crypto');

const User = require('../models/users.js');

const catchAsync = require('../utils/catchAsync.js');
const isValidEmail = require('../utils/emailRegister.js');

const path = require('path');

//Set up Nodemailer
const nodemailer = require("nodemailer");

async function SendVerifiedCode(otpcode, email) {
  const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  try {
    const info = await transporter.sendMail({
      from: '"TRACKING SERVICE FROM" <webtracking@gmx.com>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otpcode}`,
      html: `<div style="font-family: Arial, sans-serif;">
              <h2>Account Verification</h2>
              <p>Use this code to verify your account:</p>
              <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                ${otpcode}
              </div>
              <p style="color: #666;">This code expires in 1 minute</p>
            </div>`
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
}

//HTTP GET requests
router.get('/', (req,res)=>{
    if (!req.session.email) {
      res.render('./mainpage.ejs');
  }

});


router.get('/login', (req,res)=>{
  if (!req.session.email) {
      return res.render('./auth/login.ejs');
  }

  res.render('./auth/login.ejs');  
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to log out");
      }
      return res.redirect('/login'); 
    });
  } else {
    return res.redirect('/login'); 
  }

});

router.get('/register', (req,res)=>{ 
  if (!req.session.email) {
    return res.render('./auth/register.ejs');
  }

  res.render('./auth/register.ejs');

});

router.get('/register/otp',isValidEmail, async(req,res)=>{ 
  if (!req.session.email ) {
    return res.redirect('/register');
  }
  //For unregistered user
  if (req.session.email && req.session.username && req.session.user_id) {
    return res.render('./auth/otp.ejs');
  }
  res.render('./auth/otp.ejs');
});


//HTTP POST requests
router.post('/register', catchAsync(async (req, res) => {
  const { email, password, username, userpwd } = req.body;

  // Basic server-side validation
  if (!email || !password) {
    const data = { message: "Email and password are required." };
    return res.render('./layout/error.ejs', { data });
  }
  if (password.length < 6) {
    const data = { message: "Password must be at least 6 characters." };
    return res.render('./layout/error.ejs', { data });
  }

  // Check if the email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const data = { message: "User Account Already Created!" };
    return res.render('./layout/error.ejs', { data });
  }

  // Ensure passwords match
  if (userpwd != password) {
    const data = { message: "Password is not matched!" };
    return res.render('./layout/error.ejs', { data });
  }

  // Generate a 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  // Hash the password with Argon2id
  const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

  // Create a new user object
  const newUser = new User({
    password: hashedPassword,
    username: username,
    email: email,
    otp: otpCode,
    otpExpiration:Date.now() + 60000 
  });

  // Send OTP email
  SendVerifiedCode(otpCode, email);
  // Save user to database
  try {
    // set passwordAlgo explicitly for clarity
    newUser.passwordAlgo = 'argon2';
    await newUser.save();
  } catch (err) {
    console.error('User save error:', err);
    const data = { message: 'Failed to create user.' };
    return res.render('./layout/error.ejs', { data });
  }
  // Store email in session for OTP verification
  req.session.email = email;
  res.redirect('/register/otp');
}));

router.post('/register/otp',catchAsync(async (req,res)=>{ 
  const { otp, action } = req.body;   
  const email=req.session.email;
  const IsUserEmail = await User.findOne({ email });

  // User "Verify Email"
  if (action === "verify") {
    const currentTime = Date.now();
    const otpExpiration = IsUserEmail.otpExpiration.getTime()
    if(currentTime>otpExpiration){ //Check expiration
      const otpMsg = { message: "Your OTP Code Is Expired" };
      return res.render('./layout/error.ejs', { otpMsg });
    }
    if (String(otp) === String(IsUserEmail.otp)) { //Check otp code
      IsUserEmail.verified = true;
      await IsUserEmail.save();

      req.session.user_id = IsUserEmail._id;
      req.session.username = IsUserEmail.username;
      req.session.email = IsUserEmail.email;  
      req.session.emailStatus=IsUserEmail.verified;
      req.session.router=`/trackery/email`
      return res.redirect(req.session.router); // Redirect on success
    } else {
      const otpMsg = { message: "Invalid OTP Code" };
      return res.render('./layout/error.ejs', { otpMsg });
    }
  } 
  // User "Resend Email"
  if (action === "resend") {
    const currentTime = Date.now();
    const otpExpiration = IsUserEmail.otpExpiration.getTime()
    if(currentTime<otpExpiration){
      const otpMsg = { message: "Unexpected error occurred" };
      return res.render('./layout/error.ejs', { otpMsg });
    } else{
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      IsUserEmail.otpExpiration =Date.now() + 60000
      IsUserEmail.otp =otpCode
      await IsUserEmail.save();
      await SendVerifiedCode(otpCode, email); 
    }
  }

}));

router.post('/login',catchAsync(async (req,res)=>{ 
  const { password, email } = req.body;
  const IsUserEmail = await User.findOne({ email });

  if (!IsUserEmail) {
    const data = { message: "Your email or Password is incorrect!" };
    return res.render('./layout/error.ejs', { data });
  }

  // Verify password depending on stored algorithm
  let verified = false;
  try {
    if (!IsUserEmail.passwordAlgo || IsUserEmail.passwordAlgo === 'bcrypt') {
      // legacy bcrypt
      // attempt to verify using bcrypt if available
      try {
        const bcrypt = require('bcryptjs');
        verified = await bcrypt.compare(password, IsUserEmail.password);
        if (verified) {
          // migrate to argon2
          const newHash = await argon2.hash(password, { type: argon2.argon2id });
          IsUserEmail.password = newHash;
          IsUserEmail.passwordAlgo = 'argon2';
          await IsUserEmail.save();
        }
      } catch (e) {
        // bcrypt not available — fall through
        verified = false;
      }
    } else if (IsUserEmail.passwordAlgo === 'sha256' || IsUserEmail.passwordAlgo === 'pbkdf2-sha256') {
      // legacy sha256 or pbkdf2 stored as hex: verify accordingly
      if (IsUserEmail.passwordAlgo === 'sha256') {
        const givenHash = crypto.createHash('sha256').update(password).digest('hex');
        verified = givenHash === IsUserEmail.password;
      } else if (IsUserEmail.passwordAlgo === 'pbkdf2-sha256') {
        // stored as iterations:salt:hash (hex)
        try {
          const [iters, salt, stored] = IsUserEmail.password.split(':');
          const derived = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), parseInt(iters, 10), 64, 'sha256').toString('hex');
          verified = derived === stored;
        } catch (e) {
          verified = false;
        }
      }
      if (verified) {
        // migrate to argon2
        const newHash = await argon2.hash(password, { type: argon2.argon2id });
        IsUserEmail.password = newHash;
        IsUserEmail.passwordAlgo = 'argon2';
        await IsUserEmail.save();
      }
    } else if (IsUserEmail.passwordAlgo === 'argon2') {
      verified = await argon2.verify(IsUserEmail.password, password);
    } else {
      // unknown algorithm — try argon2 verify as default attempt
      try {
        verified = await argon2.verify(IsUserEmail.password, password);
      } catch (e) {
        verified = false;
      }
    }
  } catch (err) {
    console.error('Password verification error:', err);
    verified = false;
  }

  if (!verified) {
    const data = { message: "Your email or Password is incorrect!" };
    return res.render('./layout/error.ejs', { data });
  }

  if (IsUserEmail.verified==false) {
    req.session.email = IsUserEmail.email;
    return res.redirect("/register/otp");
  }
  req.session.user_id = IsUserEmail._id;
  req.session.username = IsUserEmail.username;
  req.session.email = IsUserEmail.email;  
  req.session.emailStatus=IsUserEmail.verified;
  console.log(Sha256(IsUserEmail.username));
  res.redirect(`/trackery/ValidEmail`);
}));


router.post('/', (req,res)=>{
  res.redirect('/login');
});


module.exports = router;
