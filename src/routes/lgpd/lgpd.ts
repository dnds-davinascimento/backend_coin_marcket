import { Router, Request, Response } from "express";
import lgpdControllers from "../../controllers/lgpdControllers";

const router: Router = Router();

/**
 * @swagger
 * /webhook/store-redact:
 *   get:
 *     summary: Webhook para remoção de dados da loja
 *     description: Recebe um webhook para a remoção dos dados de uma loja conforme a solicitação de anonimização de dados.
 *     tags:
 *       - LGPD
 *     responses:
 *       200:
 *         description: Dados da loja removidos com sucesso.
 *       500:
 *         description: Erro ao processar a remoção dos dados da loja.
 */
router.route("/webhook/store-redact").get(
  (req: Request, res: Response) => lgpdControllers.storeRedact(req, res)
);

/**
 * @swagger
 * /webhook/customers-redact:
 *   get:
 *     summary: Webhook para remoção de dados dos clientes
 *     description: Recebe um webhook para a remoção dos dados dos clientes conforme a solicitação de anonimização de dados.
 *     tags:
 *       - LGPD
 *     responses:
 *       200:
 *         description: Dados do cliente removidos com sucesso.
 *       500:
 *         description: Erro ao processar a remoção dos dados do cliente.
 */
router.route("/webhook/customers-redact").get(
  (req: Request, res: Response) => lgpdControllers.customersRedact(req, res)
);

/**
 * @swagger
 * /webhook/customers-data-request:
 *   get:
 *     summary: Webhook para solicitação de dados pessoais dos clientes
 *     description: Recebe um webhook solicitando os dados pessoais de um cliente conforme as solicitações da LGPD.
 *     tags:
 *       - LGPD
 *     responses:
 *       200:
 *         description: Dados pessoais do cliente fornecidos com sucesso.
 *       500:
 *         description: Erro ao processar a solicitação de dados pessoais.
 */
router.route("/webhook/customers-data-request").get(
  (req: Request, res: Response) => lgpdControllers.customersDataRequest(req, res)
);

export default router;
