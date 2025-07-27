// Email service placeholder for patient invitations
// TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendInvitationEmail(
  email: string,
  name: string,
  message?: string
): Promise<boolean> {
  try {
    // TODO: Replace with actual email service integration
    console.log('Sending invitation email to:', email)
    console.log('Patient name:', name)
    console.log('Custom message:', message)
    
    // Placeholder email data
    const emailData: EmailData = {
      to: email,
      subject: 'Welcome to CalmPath - You\'ve Been Invited!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to CalmPath!</h1>
          <p>Hello ${name},</p>
          <p>You have been invited to join CalmPath, a comprehensive mental health management platform.</p>
          ${message ? `<p><strong>Personal Message:</strong> ${message}</p>` : ''}
          <p>To get started:</p>
          <ol>
            <li>Click the link below to create your account</li>
            <li>Complete your profile setup</li>
            <li>Begin your wellness journey with CalmPath</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Create Your Account
            </a>
          </div>
          <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
          <p>Best regards,<br>The CalmPath Team</p>
        </div>
      `,
      text: `
        Welcome to CalmPath!
        
        Hello ${name},
        
        You have been invited to join CalmPath, a comprehensive mental health management platform.
        
        ${message ? `Personal Message: ${message}\n\n` : ''}
        To get started:
        1. Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register
        2. Create your account
        3. Complete your profile setup
        4. Begin your wellness journey with CalmPath
        
        If you have any questions, please don't hesitate to reach out to our support team.
        
        Best regards,
        The CalmPath Team
      `
    }
    
    // TODO: Send email using your preferred service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send(emailData)
    
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return true
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const emailData: EmailData = {
      to: email,
      subject: 'Welcome to CalmPath!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to CalmPath!</h1>
          <p>Hello ${name},</p>
          <p>Thank you for joining CalmPath! We're excited to have you on board.</p>
          <p>Here's what you can do to get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our wellness tools</li>
            <li>Connect with your healthcare providers</li>
            <li>Track your progress</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>If you need any help, our support team is here for you.</p>
          <p>Best regards,<br>The CalmPath Team</p>
        </div>
      `
    }
    
    // TODO: Send email using your preferred service
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
} 