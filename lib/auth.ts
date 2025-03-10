import crypto from "crypto"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sendEmail } from "./email"

// JWT secret key - in production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a random reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for authentication
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  })
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    return null
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

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`
  const subject = "Reset Your Password"
  const text = `Click the following link to reset your password: ${resetUrl}. This link will expire in 1 hour.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `

  await sendEmail(email, subject, text, html)
}

