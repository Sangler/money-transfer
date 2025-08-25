const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');
const Sha256 = require("sha256");
const path = require('path');

function generateJobID(username){
  const rand = Math.floor(100000 + Math.random() * 900000);
  const randID= `${username}_${rand.toString()}`
  return Sha256(randID)
}


async function configureBrowser(url) {
  let browser;
  try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      if (response && response.status() >= 400 && response.status() <= 499) {
          await browser.close();
          return { 
              error: true,
              status: response.status(),
              details: `HTTP Error ${response.status()}`
          };
      }
      return page;
  } catch (error) {
      if (browser) await browser.close();
      return { 
          error: true,
          details: error.message,
          status: error.message.includes('ERR_NAME_NOT_RESOLVED') ? 400 : 500
      };
  }
}


function escapeCssSelector(selector) {
// This regex to escape special characters in selectors.
	//return (`${selector.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^{|}~])/g, '\\$1').split(' ').join('.')}`); OLD CODE
	return selector.trim()// Remove any leading or trailing spaces
    .replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^{|}~])/g, '\\$1')
    .split(/\s+/)// Split on one or more whitespace characters
    .join('.');
}

async function checkPrice(page, UserSelector, userEleTypeChoice, listOfElements) {
  try {
  await page.reload({ waitUntil: 'domcontentloaded' });
    const html = await page.evaluate(() => document.body.innerHTML);
    //limit elements on infinite scrolling page
    const $ = cheerio.load(html);
  
    // Reload page and load its HTML into Cheerio
  let locationSelector;
  if(userEleTypeChoice=='class'){
    locationSelector='.'+escapeCssSelector(UserSelector);
  }
  if(userEleTypeChoice=='id'){
    locationSelector='#'+escapeCssSelector(UserSelector);
  }
  let suggestion=locationSelector;

  if(listOfElements && listOfElements.length>0){
    for(let i=0;i<listOfElements.length;i++){
      console.log(i, listOfElements[i])
      suggestion=suggestion+ " "+ listOfElements[i]
    }
  }
  console.log(suggestion);

  const elementsArray = $(suggestion).toArray();
  console.log("Array length: ",elementsArray.length)
  // console.log("$ load function",$(suggestion))
  // console.log("$ load function with html",$(suggestion, html))
  
  
  //This will display to User UI and let User make a choice for element!
  let elements = $(suggestion, html);
  let elementRes=[];
  // 2 returns condition
  if(elements.length ==1  ){
    elementRes.push(elements.text().trim().toString());
    // console.log(`Return element: ${elements}, ${elements.text()}`)
    return elementRes
  }
  
  if(elements.length >1  ){
    for (let index = 0; index < elements.length; index++) {
      let dollarPrice = elements.eq(index).text().trim();
      console.log(index, dollarPrice);
      elementRes.push(dollarPrice);
    }
  return elementRes
  } else{
    console.log("Return undefined")
    return undefined;
  }

  } catch (error) {
    console.error("Error checking price:", error);
  }
}

async function sendNotification(email, url, name, changeOutput, changeStatus) {
  let transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 465,
    secure: true,
    auth: {
      user: 'webtracking@gmx.com',
      pass: 'webscraping2025'
    }
  });

  // Styled email template
  const emailStyle = `
    <style>
      .container { max-width: 600px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif; }
      .header { background: #f8f9fa; padding: 20px; border-radius: 10px 10px 0 0; }
      .content { padding: 30px 20px; background: #ffffff; }
      .price-change { color: #2c3e50; font-size: 18px; margin: 15px 0; }
      .cta-button { 
        display: inline-block; 
        padding: 12px 25px;
        background-color: #3498db; 
        color: white !important; 
        text-decoration: none; 
        border-radius: 5px; 
        margin: 20px 0;
      }
      .footer { 
        margin-top: 30px; 
        padding-top: 20px; 
        border-top: 1px solid #eeeeee; 
        color: #7f8c8d; 
        font-size: 12px;
      }
    </style>
  `;

  const emailTemplate = `
    <div class="container">
      <div class="header">
          <svg viewBox="28 20 144 160" width="150" height="150">
              <path fill="#070812" d="M160.543 20.971c-23.288-.149-46.578-.373-69.866-.597-15.501-.15-31.077-.299-46.579-.374-5.393 0-6.59 1.12-6.964 6.272-.374 4.928-.674 9.781-.748 14.709-.077 5.301 1.871 7.019 7.338 7.914 11.075 1.755 22.713 2.243 32.967 6.119a46.75 46.75 0 0 0 3.277 1.787c7.227 3.535 11.073 11.359 10.642 18.951-2.026-.019-4.051-.032-6.077-.052-15.501-.15-31.077-.299-46.576-.373-5.393 0-6.592 1.12-6.967 6.272-.374 4.928-.674 9.781-.748 14.709-.074 5.301 1.874 7.018 7.338 7.914 11.308 1.792 23.216 2.24 33.625 6.346 1.272.5 2.536.932 3.795 1.32 3.095 2.708 5.62 6.063 7.142 10.095 1.497 4.106 2.319 8.512 2.022 13.141H28.149l-.149.075c4.119 11.648 8.086 22.549 17.747 29.866 24.039 18.143 49.349 17.023 77.433 10.901 17.821-3.883 32.948-8.736 41.486-26.506 1.871-3.957 2.545-8.586 4.119-13.887H115.99c.897-10.005 9.66-24.34 19.543-26.804 2.149-.544 3.448-1.067 4.323-1.575 5.992-1.775 12.244-3.04 18.288-4.688 5.318-1.493 7.489-3.733 7.715-9.109v-5.749c0-9.183-2.174-11.349-11.457-11.349-12.203-.078-24.405-.204-36.607-.313l-1.208-1.339c.825-10.901 9.363-17.621 19.023-21.204a41.658 41.658 0 0 0 3.564-1.554c7.97-2.701 16.767-2.435 25.113-4.71 5.316-1.493 7.489-3.733 7.712-9.109v-5.749c.001-9.185-2.17-11.35-11.456-11.35z"/>
          </svg>
      </div>
      <div class="content">
        <h2 style="color: #2c3e50;">Hello there,</h2>
        <p class="price-change">
          <strong>${name}</strong> has 
          <span style="color: ${changeStatus=='drop' ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">
            ${changeStatus}
          </span> 
          to <strong>${changeOutput}</strong>
        </p>
        <p style="color: #7f8c8d;">Check out the latest change now:</p>
        <a href="${url}" class="cta-button">View Page</a>
        <p style="color: #7f8c8d; font-size: 14px;">
          This is an automated notification from Price Tracker service.
        </p>
      </div>
      <div class="footer">
        <p>🔔 The email you receive due to your subscription to price alerts</p>
        <p>© ${new Date().getFullYear()} Price Tracker. All rights reserved.</p>
      </div>
    </div>
  `;

  let info = await transporter.sendMail({
    from: `"App Tracker" <webtracking@gmx.com>`,
    to: email,
    subject: `Changes Alert! ${name} ${changeStatus} to ${changeOutput}`,
    text: `Hello, ${name} just ${changeStatus} to ${changeOutput}. Check here: ${url}`,
    html: emailStyle + emailTemplate
  });

  console.log("Message sent: %s", info.messageId);
}


module.exports = {
	configureBrowser,
	escapeCssSelector,
	checkPrice,
  sendNotification,
  generateJobID
};

