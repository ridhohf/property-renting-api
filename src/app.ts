import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { PORT } from "./config";
import { MainRouter } from "./routers/main.router";
import { NotFoundMiddleware } from "./middlewares/not-found.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware";

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    const mainRouter = new MainRouter();

    this.app.get("/api", (req: Request, res: Response) => {
      res.json({
        success: true,
        message: "Property Rental API is running",
        version: "1.0.0",
      });
    });

    this.app.use(mainRouter.getRouter());
  }

  private handleError(): void {
    this.app.use(NotFoundMiddleware.handle());
    this.app.use(ErrorHandlerMiddleware.handle());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`➜ [API] Local: http://localhost:${PORT}/`);
      console.log(
        `➜ [API] Environment: ${process.env.NODE_ENV || "development"}`
      );
    });
  }
}
