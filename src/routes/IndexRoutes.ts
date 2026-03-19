import { Request, Response, Router } from "express";

const router = Router();

router.use('/', (req:Request, res: Response) => {
    res.json({ message: 'Hello World! Planora API v1' });
});


export const IndexRoutes = router;