import bcrypt from "bcrypt";
import { prisma } from "../config/databse";
import { AppError } from "../utils/app.error";
import { UploadService } from "./upload.service";

export class UserService {
  private uploadService = new UploadService();

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: any, file?: Express.Multer.File) {
    let profilePicture: string | undefined;

    if (file) {
      profilePicture = await this.uploadService.uploadImage(file, "profiles");
    }

    const updateData: any = {
      name: data.name,
      phone: data.phone,
    };

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        role: true,
      },
    });

    return user;
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new AppError("User not found or registered with social login", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password updated successfully" };
  }
}
