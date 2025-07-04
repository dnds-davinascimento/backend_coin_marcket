import { Router, Request, Response } from "express";
import reviewstoreController from "../../controllers/reviewstoreController";

const router: Router = Router();

// Cadastrar nova avaliação da loja
router.route("/review-store").post((req: Request, res: Response) => 
  reviewstoreController.registerReview(req, res)
);

// Listar avaliações da loja (visíveis por padrão)
router.route("/review-store").get((req: Request, res: Response) =>
  reviewstoreController.listReviews(req, res)
);

// Atualizar avaliação por ID (ex: aprovar ou editar)
router.route("/review-store/:id").put((req: Request, res: Response) =>
  reviewstoreController.updateReview(req, res)
);

export default router;
