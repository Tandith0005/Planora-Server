import { Router } from "express";

const router = Router();

router.use('/', (req, res) => {
    res.json({ message: 'Hello World! Planora API v1' });
});


export const IndexRoutes = router;