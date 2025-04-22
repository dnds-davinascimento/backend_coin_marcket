import { Router, Request, Response } from "express";
import produtoControllers from "../../controllers/produtoControllers";
import {checkToken,permissionsMiddleware }from '../../middlewares/checkToken'; 

const router: Router = Router();



export default router;
