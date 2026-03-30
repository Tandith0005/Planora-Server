import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Role } from "../../../generated/client/enums.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { InvitationValidation } from "./invitation.validation.js";
import { InvitationController } from "./invitation.controller.js";

const router = express.Router();

// Send invitation
router.post(
  "/:eventId/invite",
  authMiddleware,
  authorize(Role.USER, Role.ADMIN),                    
  validateRequest(InvitationValidation.sendInvitationSchema),
  InvitationController.sendInvitation
);

// Get my invitations
router.get(
  "/my-invitations",
  authMiddleware,
  authorize(Role.USER, Role.ADMIN),   
  InvitationController.getMyInvitations
);

// Accept invitation
router.patch(
  "/:invitationId/accept",
  authMiddleware,
  validateRequest(InvitationValidation.invitationActionSchema),
  InvitationController.acceptInvitation
);

// Decline invitation
router.patch(
  "/:invitationId/decline",
  authMiddleware,
  validateRequest(InvitationValidation.invitationActionSchema),
  InvitationController.declineInvitation
);


export const InvitationRoutes = router;