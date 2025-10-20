import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadMultiple } from "../middlewares/upload.middleware";

export class RoomRouter {
  private router: Router;
  private roomController: RoomController;

  constructor() {
    this.router = Router();
    this.roomController = new RoomController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.get("/:roomId/prices", this.roomController.getRoomPrices);

    // Tenant routes
    this.router.post(
      "/property/:propertyId",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      uploadMultiple,
      this.roomController.createRoom
    );

    this.router.put(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      uploadMultiple,
      this.roomController.updateRoom
    );

    this.router.delete(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.roomController.deleteRoom
    );

    this.router.post(
      "/:roomId/peak-season-rates",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.roomController.setPeakSeasonRate
    );

    this.router.put(
      "/peak-season-rates/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.roomController.updatePeakSeasonRate
    );

    this.router.delete(
      "/peak-season-rates/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.roomController.deletePeakSeasonRate
    );

    this.router.post(
      "/:roomId/availability",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.roomController.setRoomAvailability
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
