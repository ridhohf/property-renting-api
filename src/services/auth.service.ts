import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { AppError } from "../utils/app.error";
import { JwtUtil } from "../utils/jwt.util";
import { EmailService } from "./email.service";

interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  googleId?: string;
  facebookId?: string;
}

export class AuthService {
  private emailService = new EmailService();

  async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const verificationToken = JwtUtil.generateVerificationToken(data.email);

    const user = await prisma.user.create({
      data: {
        ...data,
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    await this.emailService.sendVerificationEmail(
      data.email,
      verificationToken
    );

    return user;
  }

  async verifyEmail(token: string, password: string) {
    const email = JwtUtil.verifySpecialToken(token, "verification");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email already verified", 400);
    }

    if (user.verificationToken !== token) {
      throw new AppError("Invalid verification token", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isVerified: true,
        verificationToken: null,
      },
    });

    return { message: "Email verified successfully" };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = JwtUtil.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    };
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new AppError("User not found or registered with social login", 404);
    }

    const resetToken = JwtUtil.generateResetToken(email);
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: "Password reset email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const email = JwtUtil.verifySpecialToken(token, "reset");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordToken !== token) {
      throw new AppError("Invalid reset token", 400);
    }

    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      throw new AppError("Reset token expired", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return { message: "Password reset successfully" };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email already verified", 400);
    }

    const verificationToken = JwtUtil.generateVerificationToken(email);

    await prisma.user.update({
      where: { email },
      data: { verificationToken },
    });

    await this.emailService.sendVerificationEmail(email, verificationToken);

    return { message: "Verification email sent" };
  }
}