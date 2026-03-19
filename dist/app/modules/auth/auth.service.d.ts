import { ILoginUser, IRegisterUser } from "./auth.interface.js";
export declare const AuthService: {
    registerUser: (payload: IRegisterUser) => Promise<{
        id: string;
        email: string;
    }>;
    verifyEmail: (token: string) => Promise<boolean>;
    loginUser: (payload: ILoginUser) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken: (token: string) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logoutUser: (token: string) => Promise<void>;
};
//# sourceMappingURL=auth.service.d.ts.map