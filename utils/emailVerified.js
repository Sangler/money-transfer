module.exports = (req, res, next)=>{
  if (req.session.emailStatus==true){
    return next();
  }

  // Check if the user is authenticated using Other methods...
  /*
  if (other auth...) {
    return next();
  }...
  */
  res.redirect('/register/otp')
};
