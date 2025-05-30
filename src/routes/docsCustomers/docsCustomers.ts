import { Router, Request, Response } from "express";
import docsCustomersController from "../../controllers/docsCustomersController";  // Controller de clientes

const router: Router = Router();



router.route("/s3-signed-url").put(
    (req: Request, res: Response) => docsCustomersController.generateSignedUrl(req, res)
  );
router.route("/saveDocumentosCustomers").post(
    (req: Request, res: Response) => docsCustomersController.saveDocumentosCustomers(req, res)
  );
router.route("/getDocumentosCustomers").get(
    (req: Request, res: Response) => docsCustomersController.getDocumentosCustomers(req, res)
  );


export default router;
