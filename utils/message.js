export const message = (user, job) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #0056d2;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      font-size: 20px;
      margin-bottom: 15px;
      color: #0056d2;
    }
    .content p {
      margin: 15px 0;
      color: #555;
    }
    .details {
      background-color: #f0f4fa;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #d6e0f5;
    }
    .details p {
      margin: 10px 0;
      font-weight: bold;
      color: #333;
    }
    .details ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .details li {
      margin: 8px 0;
      font-size: 14px;
      color: #555;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 20px;
      padding: 15px;
      border-top: 1px solid #eaeaea;
    }
    .cta {
      display: inline-block;
      background-color: #0056d2;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      margin-top: 15px;
      font-size: 14px;
    }
    .cta:hover {
      background-color: #0042a8;
    }
    a {
      color: #0056d2;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Exciting Opportunity Awaits!</h1>
    </div>
    <div class="content">
      <h2>Hello ${user.name},</h2>
      <p>We’re thrilled to inform you about a new job opportunity tailored to your skills and interests. Here are the key details:</p>
      <div class="details">
        <p>Job Details:</p>
        <ul>
          <li><strong>Position:</strong> ${job.title}</li>
          <li><strong>Company:</strong> ${job.companyName}</li>
          <li><strong>Location:</strong> ${job.location}</li>
          <li><strong>Salary:</strong> ${job.salary}</li>
        </ul>
      </div>
      <p>This is a fantastic opportunity to advance your career with <strong>${job.companyName}</strong>. Don’t miss out—positions like this are highly sought after!</p>
      <p style="text-align: center;">
        <a href="https://your-job-portal-link.com/jobs/${job._id}" class="cta">View Job & Apply Now</a>
      </p>
      <p>Feel free to reach out if you have any questions or need assistance. We’re here to help you every step of the way.</p>
    </div>
    <div class="footer">
      <p>Warm regards,<br><strong>Hirely Team</strong></p>
      <p>For any inquiries, contact us at <a href="mailto:support@hirely.com">support@hirely.com</a>.</p>
      <p>You received this email because you signed up for job alerts from Hirely.</p>
    </div>
  </div>
</body>
</html>
`;
