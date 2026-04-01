import { Request, Response, Router } from "express";
import { EventRoutes } from "../app/modules/event/event.routes.js";
import { EventParticipantRoutes } from "../app/modules/eventParticipant/eventParticipant.routes.js";
import { InvitationRoutes } from "../app/modules/invitation/invitation.routes.js";
import { PaymentRoutes } from "../app/modules/payment/payment.routes.js";
import { NotificationRoutes } from "../app/modules/notification/notification.routes.js";
import { DashboardRoutes } from "../app/modules/dashboard/dashboard.routes.js";
import { ReviewRoutes } from "../app/modules/review/review.routes.js";

const router = Router();

router.use('/test', (req:Request, res: Response) => {
    res.json({ message: 'Hello World! Planora API v1' });
});


router.use("/events", EventRoutes);
router.use("/event-participants", EventParticipantRoutes);
router.use("/invitations", InvitationRoutes);
router.use("/notifications", NotificationRoutes);
router.use("/payments", PaymentRoutes);
router.use("/dashboard", DashboardRoutes);
router.use("/reviews", ReviewRoutes);


export const IndexRoutes = router;