import { Router, Request, Response } from 'express';
/* import { checkToken, permissaoMiddleware } from '../middlewares/checkToken'; */
import vendaControllers from '../../controllers/vendaControllers';

const router: Router = Router();

router.route("/createOrder").post(

    (req: Request, res: Response) => vendaControllers.createOrder(req, res)
  );
router.route("/getByOrderConsumidor").get(

    (req: Request, res: Response) => vendaControllers.getByConsumidor(req, res)
  );
router.route("/getOrderDetails/:id").get(

    (req: Request, res: Response) => vendaControllers.getOrderDetails(req, res)
  );



export default router;
