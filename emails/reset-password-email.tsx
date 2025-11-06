import * as React from 'react'

interface ResetPasswordEmailProps {
  firstName: string
  resetUrl: string
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  firstName,
  resetUrl,
}) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #10b981;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #000;
        }
        .content {
          padding: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #000;
          color: #fff !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 500;
          margin: 20px 0;
        }
        .warning-box {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <div className="logo">Nordride</div>
        <p style={{ margin: 0, color: '#666' }}>Password Reset Request</p>
      </div>

      <div className="content">
        <h1>Hi {firstName},</h1>
        <p>
          We received a request to reset your password for your Nordride account.
        </p>

        <p>
          Click the button below to set a new password:
        </p>

        <div style={{ textAlign: 'center' }}>
          <a href={resetUrl} className="button">
            Reset Password
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666' }}>
          Or copy and paste this URL into your browser:<br />
          <span style={{ wordBreak: 'break-all' }}>{resetUrl}</span>
        </p>

        <div className="warning-box">
          <strong>⚠️ Security Note:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password will remain unchanged</li>
          </ul>
        </div>

        <p>
          If you continue to have problems, please contact our support team at{' '}
          <a href="mailto:support@nordride.se" style={{ color: '#000' }}>support@nordride.se</a>
        </p>
      </div>

      <div className="footer">
        <p>
          © {new Date().getFullYear()} Nordride. All rights reserved.
        </p>
        <p>
          Nordride AB, Sweden<br />
          <a href="mailto:support@nordride.se" style={{ color: '#666' }}>support@nordride.se</a>
        </p>
      </div>
    </body>
  </html>
)

export default ResetPasswordEmail
