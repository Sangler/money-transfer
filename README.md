# SendMoneyWebsite

A Node.js/Express web application for sending money, user authentication, and email verification. The project uses EJS for templating, MongoDB for data storage, and includes a responsive front-end.

## Features

- **User Registration & Login**: Secure authentication with password hashing and session management.
- **Email Verification**: OTP-based email verification using GMX SMTP.
- **Money Transfer Form**: Exchange rate calculation and transfer details.
- **Responsive UI**: Mobile-friendly layout with EJS templates and CSS.
- **Error Handling**: Custom error pages for registration, login, and OTP verification.
- **Session Management**: User sessions with express-session.
- **Background Jobs**: Cron jobs and scraping utilities for future price tracking features.
- **Socket.io Ready**: Real-time capabilities prepared for future enhancements.

## Project Structure

```
app.js
package.json
models/
  emails.js
routers/
  authRouter.js
  usageRouter.js
static/
  css/
    layout.css
    main.css
  imgs/
  js/
    footer.js
    header.js
    main.js
template/
  mainpage.ejs
  sendMoney.js
  auth/
    login.ejs
    otp.ejs
    register.ejs
  layout/
    error.ejs
    footer.ejs
    header.ejs
utils/
  catchAsync.js
  emailRegister.js
  emailVerified.js
  middleware.js
  process-env.js
  scrape.js
```

## Setup

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Configure MongoDB**
   Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017/LuuTruTT`.

3. **Environment Variables**
  Create a `.env` file in the project root (or update `utils/.env`) and set the following values:

  - `SESSION_SECRET` — a long random string for session signing
  - `EMAIL_USER` and `EMAIL_PASS` — SMTP credentials used by Nodemailer

  Example `.env`:

  ```env
  SESSION_SECRET=replace-with-a-secure-secret
  EMAIL_USER=you@example.com
  EMAIL_PASS=supersecretpassword
  ```

4. **Install new dependencies & run the server**

  After pulling changes that add internationalization, install dependencies:
  ```sh
  npm install
  ```

  Then run the server:
   ```sh
   node app.js
   ```
   or with nodemon:
   ```sh
   npx nodemon app.js
   ```

5. **Access the app**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Main Components

- **Authentication**  
  - [`routers/authRouter.js`](routers/authRouter.js): Registration, login, logout, OTP verification.
  - [`models/emails.js`](models/emails.js): User schema.
  - [`utils/emailRegister.js`](utils/emailRegister.js), [`utils/emailVerified.js`](utils/emailVerified.js), [`utils/middleware.js`](utils/middleware.js): Middleware for session and email checks.

- **Money Transfer**  
  - [`template/mainpage.ejs`](template/mainpage.ejs): Main form for sending money.
  - [`static/js/main.js`](static/js/main.js): Client-side form logic.

- **Front-End**  
  - [`template/layout/header.ejs`](template/layout/header.ejs), [`template/layout/footer.ejs`](template/layout/footer.ejs), [`static/css/layout.css`](static/css/layout.css), [`static/css/main.css`](static/css/main.css): Layout and styles.
  - [`static/js/header.js`](static/js/header.js), [`static/js/footer.js`](static/js/footer.js): Interactive UI.

- **Error Handling**  
  - [`template/layout/error.ejs`](template/layout/error.ejs): Error messages.

- **Utilities**  
  - [`utils/scrape.js`](utils/scrape.js): Scraping and notification (future use).
  - [`utils/catchAsync.js`](utils/catchAsync.js): Async error handling.

## License

ISC © Sang Tan Truong

---

For any issues or questions, please contact the author