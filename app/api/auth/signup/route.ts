import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { generateOTP } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Define validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  dateOfBirth: z.string().or(z.date()),
  phone: z.string().min(5, "Please enter a valid phone number"),
  street: z.string().min(3, "Street address is required"),
  town: z.string().min(2, "Town/City is required"),
  country: z.string(),
  state: z.string(),
  zipCode: z.string().min(3, "Zip code is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.User.findOne({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Generate OTP for email verification
    const otp = generateOTP()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10) // OTP valid for 10 minutes

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user in database
    const user = await db.User.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        phone: validatedData.phone,
        isVerified: false,
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
    })

    // Create address
    await db.Address.create({
      data: {
        userId: user.id,
        street: validatedData.street,
        town: validatedData.town,
        state: validatedData.state,
        country: validatedData.country,
        zipCode: validatedData.zipCode,
      },
    })

    // Send verification email
    await sendVerificationEmail(user.email, otp)

    return NextResponse.json({ message: "User created successfully. Please verify your email." }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }

    return NextResponse.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}
