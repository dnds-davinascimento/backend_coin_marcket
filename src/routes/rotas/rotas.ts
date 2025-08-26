import { Router, Request, Response } from "express";
import rotaController from "../../controllers/rotaController";  // Controller de clientes
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 
const router: Router = Router();


router.route("/criarRota").post(
  checkToken,
  permissionsMiddleware('route'), 
    (req: Request, res: Response) => rotaController.criarRota(req, res)
  );
router.route("/editarRota/:id").put(
  checkToken,
  permissionsMiddleware('route'), 
    (req: Request, res: Response) => rotaController.editarRota(req, res)
  );

router.route("/listarRotas").get(
    checkToken,
  permissionsMiddleware('route'),
    (req: Request, res: Response) => rotaController.listarRotas(req, res)
  );
router.route("/buscarRotaPorId/:id").get(
  checkToken,
  permissionsMiddleware('route'),
    (req: Request, res: Response) => rotaController.buscarRotaPorId(req, res)
  );
router.route("/confirmarEntregas/:id").put(
  checkToken,
  permissionsMiddleware('route'),
    (req: Request, res: Response) => rotaController.updateStatusEntregaNaRota(req, res)
  );
router.route("/cancelarRotaId/:id").put(
  checkToken,
  permissionsMiddleware('route'),
    (req: Request, res: Response) => rotaController.cancelarRotaId(req, res)
  );


export default router;
