import dotenv from "dotenv";

dotenv.config();
interface EnvConfig{
    PORT: string;
    BASE_URL: string;
    FRONTEND_URL: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    RESEND_API_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
}

const loadEnvVars = (): EnvConfig => {
    const requireEnvVariable = [
        "PORT",
        "BASE_URL",
        "FRONTEND_URL",
        "DATABASE_URL",
        "JWT_SECRET",
        "JWT_REFRESH_SECRET",
        "EMAIL_USER",
        "EMAIL_PASS",
        "RESEND_API_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "STRIPE_SUCCESS_URL",
        "STRIPE_CANCEL_URL",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD"
    ];

    requireEnvVariable.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing env var ${key}`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        BASE_URL: process.env.BASE_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        JWT_SECRET: process.env.JWT_SECRET as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        EMAIL_USER: process.env.EMAIL_USER as string,
        EMAIL_PASS: process.env.EMAIL_PASS as string,
        RESEND_API_KEY: process.env.RESEND_API_KEY as string,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL as string,
        STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL as string,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string
    };
};

export const envVars = loadEnvVars();