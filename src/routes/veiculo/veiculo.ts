import { Router, Request, Response } from "express";
import veiculo from "../../controllers/veiculoController";  // Controller de clientes
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 
const router: Router = Router();



router.route("/veiculos").post(

    (req: Request, res: Response) => veiculo.criarVeiculo(req, res)
  );
router.route("/veiculos").get(
    (req: Request, res: Response) => veiculo.listarVeiculos(req, res)
  );



export default router;
