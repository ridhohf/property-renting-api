import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";
import { AppError } from "./app.error";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtUtil {
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(payload, JWT_SECRET as Secret, options);
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET as Secret) as JwtPayload;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  }

  static generateVerificationToken(email: string): string {
    return jwt.sign({ email, type: "verification" }, JWT_SECRET as Secret, {
      expiresIn: "1h",
    });
  }

  static generateResetToken(email: string): string {
    return jwt.sign({ email, type: "reset" }, JWT_SECRET as Secret, {
      expiresIn: "1h",
    });
  }

  static verifySpecialToken(token: string, type: string): string {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as Secret) as any;
      if (decoded.type !== type) {
        throw new AppError("Invalid token type", 401);
      }
      return decoded.email;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  }
}
