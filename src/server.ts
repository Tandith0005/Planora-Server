import app from "./app.js";
import seedAdmin from "./app/utils/seedAdmin.js";
import { envVars } from "./config/envVars.js";

const PORT = envVars.PORT || 5000;

const bootstrap = async() => {
    try {
        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

bootstrap();
