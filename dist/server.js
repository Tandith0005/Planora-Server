import app from "./app.js";
const PORT = process.env.PORT || 5000;
const bootstrap = () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};
bootstrap();
//# sourceMappingURL=server.js.map