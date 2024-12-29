export const emailContent = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f9;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 400px;
      margin: 50px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #0056d2;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
      color: #555;
    }
    .otp {
      font-size: 20px;
      font-weight: bold;
      color: #0056d2;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 15px;
      border-top: 1px solid #eaeaea;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Verification Code</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>Your OTP for verification is:</p>
      <p class="otp">${otp}</p>
      <p>Please use this OTP to complete your verification process. The code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Your App Team</strong></p>
      <p>Need help? Contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
    </div>
  </div>
</body>
</html>
`;
