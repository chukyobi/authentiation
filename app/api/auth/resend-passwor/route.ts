import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateResetToken, sendPasswordResetEmail } from "@/lib/auth";

// Define validation schema
const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = resetPasswordSchema.parse(body);

    // Find user by email using Sequelize's findOne()
    const user = await db.User.findOne({
      where: { email: validatedData.email },
    });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent password reset instructions" },
        { status: 200 }
      );
    }

    // Generate reset token and set expiry
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Update user with reset token
    await db.User.update(
      {
        resetToken,
        resetTokenExpiry,
      },
      { where: { id: user.id } } // Sequelize update requires a "where" clause
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent password reset instructions" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
