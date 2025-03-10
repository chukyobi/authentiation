import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db"; 
import { verifyPassword, generateToken } from "@/lib/auth";

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Find user by email using Sequelize
    const user = await db.User.findOne({
      where: { email: validatedData.email },
    });

    // If user doesn't exist or password is incorrect
    if (!user || !(await verifyPassword(validatedData.password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    // Generate authentication token
    const token = generateToken(user.id);

    // Set authentication cookie for session management
    const response = NextResponse.redirect(new URL("/", request.url));
    
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "strict", // Prevents CSRF attacks
      path: "/", // Available for the entire application
      maxAge: 60 * 60 * 24 * 7, // 7 days expiration
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
