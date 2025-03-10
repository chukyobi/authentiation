import nodemailer from "nodemailer"

// Configure email transporter
// In production, use a real email service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
})

/**
 * Send an email
 */
export async function sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to,
      subject,
      text,
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

/**
 * Send a verification email with OTP
 */
export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  const subject = "Verify Your Email"
  const text = `Your verification code is: ${otp}. This code will expire in 10 minutes.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Thank you for signing up! Please use the following code to verify your email address:</p>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${otp}</strong>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this verification, you can safely ignore this email.</p>
    </div>
  `

  await sendEmail(email, subject, text, html)
}

