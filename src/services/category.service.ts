import { prisma } from "../config/databse";
import { AppError } from "../utils/app.error";

export class CategoryService {
  async getCategories() {
    const categories = await prisma.propertyCategory.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  }

  async getCategoryById(categoryId: string) {
    const category = await prisma.propertyCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  async createCategory(data: { name: string; description?: string }) {
    const existingCategory = await prisma.propertyCategory.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    const category = await prisma.propertyCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return category;
  }

  async updateCategory(
    categoryId: string,
    data: { name?: string; description?: string }
  ) {
    const category = await prisma.propertyCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (data.name && data.name !== category.name) {
      const existingCategory = await prisma.propertyCategory.findUnique({
        where: { name: data.name },
      });

      if (existingCategory) {
        throw new AppError("Category with this name already exists", 400);
      }
    }

    const updated = await prisma.propertyCategory.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return updated;
  }

  async deleteCategory(categoryId: string) {
    const category = await prisma.propertyCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (category._count.properties > 0) {
      throw new AppError(
        "Cannot delete category with existing properties",
        400
      );
    }

    await prisma.propertyCategory.delete({
      where: { id: categoryId },
    });

    return { message: "Category deleted successfully" };
  }
}
