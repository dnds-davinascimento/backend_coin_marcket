import { Router, Request, Response } from "express";
import lojaController from "../../controllers/lojaController";

const router: Router = Router();



router.route("/loja").post(
  (req: Request, res: Response) => lojaController.createLoja(req, res)
);
export default router;
