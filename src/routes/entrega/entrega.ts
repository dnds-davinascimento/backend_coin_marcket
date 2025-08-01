import { Router, Request, Response } from "express";
import entregaController from "../../controllers/entregaController";  // Controller de clientes
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 
const router: Router = Router();



router.route("/createEntrega").post(

    (req: Request, res: Response) => entregaController.createEntrega(req, res)
  );
router.route("/getEntregas").get(
    (req: Request, res: Response) => entregaController.getEntregas(req, res)
  );
router.route("/getEntregasDetails/:id").get(
    (req: Request, res: Response) => entregaController.getEntregasDetails(req, res)
  );
router.route("/getEntregasPendentes").get(
    (req: Request, res: Response) => entregaController.getEntregasPendentes(req, res)
  );


export default router;
