const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Aesthetic HTML Template for OTP
 */
const getOTPTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -1px; }
        .content { color: #1e293b; line-height: 1.6; }
        .otp-box { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; border: 1px dashed #cbd5e1; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b; margin: 0; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
        .highlight { color: #6366f1; font-weight: 600; }
    </style>
</head>
<body style="background-color: #f1f5f9; padding: 20px;">
    <div class="container">
        <div class="header">
            <div class="logo">CAMPUS</div>
        </div>
        <div class="content">
            <h2 style="margin-top: 0;">Verification Required</h2>
            <p>Welcome to <span class="highlight">Campus</span>. To ensure your account is secure, please use the following one-time password (OTP) to complete your verification:</p>
            <div class="otp-box">
                <h1 class="otp-code">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #64748b;">This code is valid for <b>10 minutes</b>. If you did not request this, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Campus Dating App. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

const getSecurityAlertTemplate = (displayName, title, message, details = null) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -1px; }
        .content { color: #1e293b; line-height: 1.6; }
        .alert-box { background: #fff7ed; border-radius: 8px; padding: 20px; border: 1px solid #ffedd5; margin: 25px 0; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .details { font-size: 13px; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body style="background-color: #f1f5f9; padding: 20px;">
    <div class="container">
        <div class="header">
            <div class="logo">CAMPUS</div>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #9a3412;">${title}</h2>
            <p>Hi ${displayName},</p>
            <p>${message}</p>
            
            ${details ? `<div class="details"><strong>Details:</strong><br/>${details}</div>` : ''}

            <div class="alert-box">
                <p style="margin: 0; font-size: 14px; color: #9a3412;"><b>Security Tip:</b> If this wasn't you, please change your password immediately and contact our support team.</p>
            </div>
            
            <a href="#" class="btn">Secure My Account</a>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Campus Dating App. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

const getAccountSecurityTemplate = (displayName, title, message, color = "#6366f1") => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -1px; }
        .content { color: #1e293b; line-height: 1.6; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
        .highlight-box { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; border: 1px solid #e2e8f0; }
    </style>
</head>
<body style="background-color: #f1f5f9; padding: 20px;">
    <div class="container">
        <div class="header">
            <div class="logo">CAMPUS</div>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: ${color};">${title}</h2>
            <p>Hi ${displayName},</p>
            <p>${message}</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Campus Dating App. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

exports.sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Campus Security" <${EMAIL_USER}>`,
    to: email,
    subject: `🔐 ${otp} is your Campus verification code`,
    text: `Your Campus verification code is ${otp}. It expires in 10 minutes.`,
    html: getOTPTemplate(otp),
  };

  return transporter.sendMail(mailOptions);
};

exports.sendPasswordChangeEmail = async (email, displayName) => {
  const mailOptions = {
    from: `"Campus Security" <${EMAIL_USER}>`,
    to: email,
    subject: `🔐 Password Changed Successfully`,
    html: getSecurityAlertTemplate(
      displayName,
      "Password Changed",
      "Your account password has been successfully updated. We're sending this to confirm the change was intentional."
    ),
  };

  return transporter.sendMail(mailOptions);
};

exports.sendNewDeviceLoginEmail = async (email, displayName, deviceDetails) => {
  const mailOptions = {
    from: `"Campus Security" <${EMAIL_USER}>`,
    to: email,
    subject: `📱 New Device Sign-in Detected`,
    html: getSecurityAlertTemplate(
      displayName,
      "New Device Sign-in",
      "A new device was used to sign in to your Campus account. Please review the details below:",
      deviceDetails
    ),
  };

  return transporter.sendMail(mailOptions);
};

exports.sendAccountDeletionScheduledEmail = async (email, displayName, scheduledDate) => {
  const dateString = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Campus Support" <${EMAIL_USER}>`,
    to: email,
    subject: `⚠️ Account Deletion Scheduled`,
    html: getAccountSecurityTemplate(
      displayName,
      "Account Deletion Scheduled",
      `Your request to delete your Campus account has been received. Your account is scheduled for permanent deletion on <b>${dateString}</b>.<br/><br/>If you change your mind, simply log back into the app before this date to restore your account.`,
      "#ef4444"
    ),
  };

  return transporter.sendMail(mailOptions);
};

exports.sendAccountRestoredEmail = async (email, displayName) => {
  const mailOptions = {
    from: `"Campus Support" <${EMAIL_USER}>`,
    to: email,
    subject: `✅ Account Restored Successfully`,
    html: getAccountSecurityTemplate(
      displayName,
      "Welcome Back!",
      "Your Campus account has been successfully restored. Your data is safe, and your profile is now visible to others again.",
      "#10b981"
    ),
  };

  return transporter.sendMail(mailOptions);
};