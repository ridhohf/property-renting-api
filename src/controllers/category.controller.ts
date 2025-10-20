import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  private categoryService = new CategoryService();

  constructor() {
    this.getCategories = this.getCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.categoryService.getCategories();

      res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.categoryService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
