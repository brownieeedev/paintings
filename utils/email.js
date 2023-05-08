const process = require('process');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url1, url2) {
    this.to = user.email;
    this.url1 = url1;
    this.url2 = url2;
    this.from = 'Paintify <brownieeedev@gmail.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Send the email
    //1) Render HTML, and pass variables
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: 'Feliratkozó',
      url1: this.url1,
      url2: this.url2,
      subject,
    });
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    //3) new transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Üdvözlünk a Paintifynál!');
  }
}

class Email2 {
  constructor(user, resetURL) {
    this.to = user.email;
    this.resetURL = resetURL;
    this.from = 'Paintify <brownieeedev@gmail.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Send the email
    //1) Render HTML, and pass variables
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: 'Subscriber',
      resetURL: this.resetURL,
      subject,
    });
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    //3) new transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendPasswordReset() {
    await this.send('passwordReset', 'Jelszó visszaállítása');
  }
}

module.exports = {
  Email,
  Email2,
};
