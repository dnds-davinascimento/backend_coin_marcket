import { Router, Request, Response } from "express";
import reviewproductController from "../../controllers/reviewproductController";

const router: Router = Router();

// Cadastrar nova avaliação da loja
router.route("/review-product").post((req: Request, res: Response) => 
  reviewproductController.registerReview(req, res)
);

// Listar avaliações da loja (visíveis por padrão)
router.route("/review-product/:id").get((req: Request, res: Response) =>
  reviewproductController.listReviews(req, res)
);

// Atualizar avaliação por ID (ex: aprovar ou editar)
router.route("/review-product/:id").put((req: Request, res: Response) =>
  reviewproductController.updateReview(req, res)
);

export default router;
