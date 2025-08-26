import { Router, Request, Response } from "express";
import entregaController from "../../controllers/entregaController";  // Controller de clientes
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken';
const router: Router = Router();



router.route("/createEntrega").post(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.createEntrega(req, res)
);
router.route("/getEntregas").get(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.getEntregas(req, res)
);
router.route("/getEntregasDetails/:id").get(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.getEntregasDetails(req, res)
);
router.route("/getEntregasPendentes").get(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.getEntregasPendentes(req, res)
);
router.route("/cancelarEntrega/:id").delete(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.cancelarEntrega(req, res)
);
router.route("/adicionarObservacao/:id").post(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.adicionarObservacao(req, res)
);
router.route("/attachDocumentEntrega/:id").post(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.attachDocumentEntrega(req, res)
);
router.route("/removeAttachEntrega/:id").post(
  checkToken,
  permissionsMiddleware('delivery'),
  (req: Request, res: Response) => entregaController.removeAttachEntrega(req, res)
);


export default router;
