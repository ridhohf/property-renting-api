import { config } from "dotenv";
import { resolve } from "path";

export const NODE_ENV = process.env.NODE_ENV || "development";
const envFile = NODE_ENV === "development" ? ".env.development" : ".env";

config({ path: resolve(__dirname, `../../${envFile}`) });
config({ path: resolve(__dirname, `../../${envFile}.local`), override: true });

export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const JWT_SECRET =
  process.env.JWT_SECRET || "453e4d9de7688a86b55586018a271759";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
export const EMAIL_FROM = process.env.EMAIL_FROM || "twiceoncess2015@gmail.com";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || "";
