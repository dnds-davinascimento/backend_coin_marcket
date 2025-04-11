import { Router, Request, Response } from "express";
import webhookController from "../../controllers/webhookController";

const router: Router = Router();

/**
 * @swagger
 * /createWebhook:
 *   post:
 *     summary: Criar um novo webhook
 *     description: Cria um novo webhook no sistema Nuvemshop.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "product.created"
 *               webhookUrl:
 *                 type: string
 *                 example: "https://example.com/webhook"
 *     responses:
 *       201:
 *         description: Webhook criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Webhook criado com sucesso!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     event:
 *                       type: string
 *                       example: "product.created"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/webhook"
 *       400:
 *         description: Evento ou URL do Webhook ausente.
 *       404:
 *         description: Admin não encontrado.
 *       500:
 *         description: Erro no servidor ao criar webhook.
 */
router.route("/createWebhook").post(
  (req: Request, res: Response) => webhookController.createWebhook(req, res)
);

/**
 * @swagger
 * /getWebhook:
 *   get:
 *     summary: Listar webhooks
 *     description: Retorna todos os webhooks registrados para um admin.
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Webhooks listados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Webhooks listados com sucesso!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       event:
 *                         type: string
 *                         example: "product.created"
 *                       url:
 *                         type: string
 *                         example: "https://example.com/webhook"
 *       404:
 *         description: Admin não encontrado.
 *       500:
 *         description: Erro no servidor ao listar webhooks.
 */
router.route("/getWebhook").get(
  (req: Request, res: Response) => webhookController.getWebhook(req, res)
);

/**
 * @swagger
 * /updateWebhook:
 *   put:
 *     summary: Atualizar webhook existente
 *     description: Atualiza um webhook registrado com base no ID.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhookId:
 *                 type: string
 *                 example: "12345"
 *               event:
 *                 type: string
 *                 example: "product.updated"
 *               webhookUrl:
 *                 type: string
 *                 example: "https://example.com/updated-webhook"
 *     responses:
 *       200:
 *         description: Webhook atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Webhook atualizado com sucesso!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     event:
 *                       type: string
 *                       example: "product.updated"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/updated-webhook"
 *       400:
 *         description: Webhook ID, Evento ou URL ausentes.
 *       404:
 *         description: Admin ou Webhook não encontrado.
 *       500:
 *         description: Erro ao atualizar o webhook.
 */
router.route("/updateWebhook").put(
  (req: Request, res: Response) => webhookController.updateWebhook(req, res)
);

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
