const loadEnvVars = () => {
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
        PORT: process.env.PORT,
        BASE_URL: process.env.BASE_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
    };
};
export const envVars = loadEnvVars();
//# sourceMappingURL=envVars.js.map