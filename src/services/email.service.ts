import nodemailer from "nodemailer";
import {
    EMAIL_FROM,
    FRONTEND_URL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
} from "../config";
import { LoggerService } from "../utils/logger";

const logger = new LoggerService();

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Verify Your Email - Property Rental",
        html: `
          <h1>Email Verification</h1>
          <p>Thank you for registering! Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send verification email", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Password Reset Request - Property Rental",
        html: `
          <h1>Password Reset</h1>
          <p>You requested to reset your password. Click the link below:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send password reset email", error);
      throw error;
    }
  }

  async sendBookingConfirmation(email: string, bookingDetails: any) {
    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Booking Confirmed - Property Rental",
        html: `
          <h1>Booking Confirmation</h1>
          <p>Your booking has been confirmed!</p>
          <h2>Booking Details:</h2>
          <p><strong>Property:</strong> ${bookingDetails.propertyName}</p>
          <p><strong>Room:</strong> ${bookingDetails.roomName}</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
          <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
          <p><strong>Total Price:</strong> $${bookingDetails.totalPrice}</p>
          <p>We look forward to hosting you!</p>
        `,
      });

      logger.info(`Booking confirmation sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send booking confirmation", error);
      throw error;
    }
  }

  async sendBookingReminder(email: string, bookingDetails: any) {
    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Booking Reminder - Check-in Tomorrow",
        html: `
          <h1>Booking Reminder</h1>
          <p>Your check-in is tomorrow!</p>
          <h2>Booking Details:</h2>
          <p><strong>Property:</strong> ${bookingDetails.propertyName}</p>
          <p><strong>Room:</strong> ${bookingDetails.roomName}</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
          <p><strong>Address:</strong> ${bookingDetails.address}</p>
          <p>See you soon!</p>
        `,
      });

      logger.info(`Booking reminder sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send booking reminder", error);
      throw error;
    }
  }
}
