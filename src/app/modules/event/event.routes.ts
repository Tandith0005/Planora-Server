import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Role } from "../../../generated/client/enums.js";
import { EventController } from "./event.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { EventValidation } from "./event.validation.js";
const router = express.Router();


router.post(
  "/",
  authMiddleware,
  authorize(Role.USER, Role.ADMIN),
  validateRequest(EventValidation.createEventSchema),
  EventController.createEvent
);

// GET ALL EVENTS → public
router.get("/", EventController.getAllEvents);

// GET SINGLE EVENT → public
router.get("/:id", EventController.getSingleEvent);

// UPDATE EVENT → owner handled in service
router.patch(
  "/:id",
  authMiddleware,
  authorize(Role.USER, Role.ADMIN),
  EventController.updateEvent
);

// DELETE EVENT → owner/admin handled in service
router.delete(
  "/:id",
  authMiddleware,
  authorize(Role.USER, Role.ADMIN),
  EventController.deleteEvent
);


export const EventRoutes = router;