import { Router, Request, Response } from "express";
import rotaController from "../../controllers/rotaController";  // Controller de clientes
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 
const router: Router = Router();



router.route("/criarRota").post(

    (req: Request, res: Response) => rotaController.criarRota(req, res)
  );



export default router;
