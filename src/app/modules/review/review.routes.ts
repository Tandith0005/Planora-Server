import express from "express";
import { ReviewController } from "./review.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/event/:eventId", ReviewController.getEventReviews);
router.patch("/:id", authMiddleware, ReviewController.updateReview);
router.delete("/:id", authMiddleware, ReviewController.deleteReview);

export const ReviewRoutes = router;