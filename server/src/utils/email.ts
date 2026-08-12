import nodemailer from 'nodemailer'

// Ethereal Email is a fake SMTP service for testing.
// It catches emails instead of delivering them, and gives you a URL to preview them.
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    // Generate an ethereal test account by going to https://ethereal.email/create
    // For this mock setup, we'll use a hardcoded demo account, or dynamically create one if needed.
    // In production, use your real SMTP credentials (e.g. Twilio SendGrid).
    user: 'demian.bartell70@ethereal.email',
    pass: 'P9uXy8Z2nWmD84hKvZ'
  }
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"ERP System" <noreply@erpsystem.com>',
      to,
      subject,
      html,
    })

    console.log(`✉️  Message sent to ${to}: ${info.messageId}`)
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    return info
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
