import { Router, Request, Response } from 'express';
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 
import vendaControllers from '../../controllers/vendaControllers';

const router: Router = Router();

router.route("/createOrder").post(
     checkToken,
/*   permissionsMiddleware('order'),  */
    (req: Request, res: Response) => vendaControllers.createOrder(req, res)
  );
router.route("/advanceProcess/:id").post(
     checkToken,
  /* permissionsMiddleware('order'),  */
    (req: Request, res: Response) => vendaControllers.advanceProcess(req, res)
  );
router.route("/addPaymentFor/:id").post(
     checkToken,
/*   permissionsMiddleware('order'), */ 
    (req: Request, res: Response) => vendaControllers.addPaymentFor(req, res)
  );
router.route("/attachDocument/:id").post(
     checkToken,
 /*  permissionsMiddleware('order'),  */
    (req: Request, res: Response) => vendaControllers.attachDocument(req, res)
  );
router.route("/removeAttach/:id").post(
     checkToken,
 /*  permissionsMiddleware('order'),  */
    (req: Request, res: Response) => vendaControllers.removeAttach(req, res)
  );
router.route("/getByOrderConsumidor").get(
     checkToken,
  /* permissionsMiddleware('order'), */ 
    (req: Request, res: Response) => vendaControllers.getByConsumidor(req, res)
  );
router.route("/getByOrderEmitente").get(
     checkToken,
  permissionsMiddleware('order'), 
    (req: Request, res: Response) => vendaControllers.getByOrderEmitente(req, res)
  );
router.route("/getOrderDetails/:id").get(
     checkToken,
  /* permissionsMiddleware('order'),  */
    (req: Request, res: Response) => vendaControllers.getOrderDetails(req, res)
  );
router.route('/getsequencia').get(
       checkToken,
  permissionsMiddleware('order'), 
  (req: Request, res: Response) => vendaControllers.getsequencia(req, res)
);



export default router;
