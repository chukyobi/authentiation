import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define validation schema
const verifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = verifySchema.parse(body);

    // Get user ID from session (Replace this with actual session management)
    const userId = "user_id_from_session";

    if (!userId) {
      return NextResponse.json({ message: "Session expired. Please sign up again." }, { status: 401 });
    }

    // Find user by ID using Sequelize's findOne()
    const user = await db.User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if OTP matches and is not expired
    if (
      user.verificationToken !== validatedData.otp ||
      !user.verificationTokenExpiry ||
      new Date() > user.verificationTokenExpiry
    ) {
      return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark user as verified
    await db.User.update(
      {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
      { where: { id: user.id } } // Sequelize update requires a second argument for "where"
    );

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });

  } catch (error) {
    console.error("Verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "An error occurred during verification" }, { status: 500 });
  }
}
