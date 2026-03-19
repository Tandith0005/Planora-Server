import { Request, Response } from "express";
export declare const AuthController: {
    registerUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    verifyEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
    loginUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    refreshTokenHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logoutUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map