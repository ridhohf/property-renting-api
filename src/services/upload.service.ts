import cloudinary from "../config/cloudinary";
import { AppError } from "../utils/app.error";
import { LoggerService } from "../utils/logger";

const logger = new LoggerService();

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = "properties"
  ): Promise<string> {
    try {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `property-rental/${folder}`,
        resource_type: "auto",
      });

      logger.info(`Image uploaded successfully: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      logger.error("Image upload failed", error);
      throw new AppError("Failed to upload image", 500);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = "properties"
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error("Multiple image upload failed", error);
      throw new AppError("Failed to upload images", 500);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(imageUrl);
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted: ${publicId}`);
    } catch (error) {
      logger.error("Image deletion failed", error);
      throw new AppError("Failed to delete image", 500);
    }
  }

  private extractPublicId(url: string): string {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split(".")[0];
  }
}
