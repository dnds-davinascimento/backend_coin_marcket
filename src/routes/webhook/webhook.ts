import { Router, Request, Response } from "express";
import webhookController from "../../controllers/webhookController";

const router: Router = Router();



/**
 * @swagger
 * /order_cancelled_hook:
 *   post:
 *     summary: Webhook de cancelamento de pedido
 *     description: Recebe dados do webhook quando um pedido é cancelado.
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Webhook de cancelamento de pedido recebido com sucesso.
 *       500:
 *         description: Erro ao processar o webhook de cancelamento de pedido.
 */
router.route("/whatsapp_hook").post(
  (req: Request, res: Response) => webhookController.whatsapp_hook(req, res)
);

export default router;
