interface InvitationEmailProps {
  invitedBy: string;
  companyName: string;
  userEmail: string;
  userPassword?: string;
  loginUrl: string;
}

export const getInvitationEmailHtml = ({
  invitedBy,
  companyName,
  userEmail,
  userPassword,
  loginUrl,
}: InvitationEmailProps): string => {
  const isNewUser = !!userPassword;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to Join ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
          margin: 0;
          padding: 0;
          background-color: #f4f4f7;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eeeeee;
        }
        .header h1 {
          color: #1a1a1a;
          font-size: 24px;
          margin: 0;
        }
        .content {
          padding: 20px 0;
          line-height: 1.6;
        }
        .content p {
          margin: 16px 0;
        }
        .credentials {
          background-color: #f9f9f9;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }
        .credentials p {
          margin: 8px 0;
        }
        .credentials strong {
          color: #000;
        }
        .button-container {
          text-align: center;
          margin-top: 24px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        }
        .footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome aboard!</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You've been invited by <strong>${invitedBy}</strong> to join the <strong>${companyName}</strong> team on our platform.</p>
          ${isNewUser ? `
            <p>Your account has been created. Here are your login credentials:</p>
            <div class="credentials">
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Password:</strong> ${userPassword}</p>
            </div>
          ` : `
            <p>You can now access your account with your existing credentials.</p>
          `}
          <div class="button-container">
            <a href="${loginUrl}" class="button">Log In to Your Account</a>
          </div>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact ${invitedBy}.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 