import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Op } from "sequelize"; 

// Define validation schema
const newPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = newPasswordSchema.parse(body);

    // Find user by reset token using Sequelize
    const user = await db.User.findOne({
      where: {
        resetToken: validatedData.token,
        resetTokenExpiry: {
          [Op.gt]: new Date(), // ✅ Use Sequelize Op.gt instead of Prisma-style comparisons
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update user's password and clear reset token
    await db.User.update(
      {
        password: await hashPassword(validatedData.password),
        resetToken: null,
        resetTokenExpiry: null,
      },
      {
        where: { id: user.id },
      }
    );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("New password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while updating your password" },
      { status: 500 }
    );
  }
}
