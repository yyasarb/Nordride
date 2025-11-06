import * as React from 'react'

interface WelcomeEmailProps {
  firstName: string
  verificationUrl?: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  firstName,
  verificationUrl,
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
        <p style={{ margin: 0, color: '#666' }}>Sustainable Ride Sharing</p>
      </div>

      <div className="content">
        <h1>Welcome to Nordride, {firstName}!</h1>
        <p>
          We're excited to have you join our community of sustainable travelers across the Nordics.
        </p>

        {verificationUrl && (
          <>
            <p>
              To get started, please verify your email address by clicking the button below:
            </p>
            <div style={{ textAlign: 'center' }}>
              <a href={verificationUrl} className="button">
                Verify Email Address
              </a>
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Or copy and paste this URL into your browser:<br />
              <span style={{ wordBreak: 'break-all' }}>{verificationUrl}</span>
            </p>
          </>
        )}

        <h3>What's next?</h3>
        <ul>
          <li>Complete your profile to start offering or joining rides</li>
          <li>Add your vehicle information if you plan to offer rides</li>
          <li>Browse available rides and connect with fellow travelers</li>
        </ul>

        <p>
          <strong>Remember:</strong> Nordride is for cost-sharing, not profit-making.
          Share the journey, share the planet! 🌍
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

export default WelcomeEmail
