interface EnvConfig{
    PORT: string;
    BASE_URL: string;
    FRONTEND_URL: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;

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
    };
};

export const envVars = loadEnvVars();