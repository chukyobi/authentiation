import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOTP, sendVerificationEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from session (replace with actual session logic)
    const userId = "user_id_from_session";

    if (!userId) {
      return NextResponse.json(
        { message: "Session expired. Please sign up again." },
        { status: 401 }
      );
    }

    // Find user by ID using Sequelize
    const user = await db.User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: "User is already verified" },
        { status: 400 }
      );
    }

    // Generate new OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with new OTP
    await db.User.update(
      {
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
      { where: { id: user.id } } // Sequelize requires where condition in update
    );

    // Send verification email with new OTP
    await sendVerificationEmail(user.email, otp);

    return NextResponse.json(
      { message: "Verification code resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", error);

    return NextResponse.json(
      { message: "An error occurred while resending verification code" },
      { status: 500 }
    );
  }
}
