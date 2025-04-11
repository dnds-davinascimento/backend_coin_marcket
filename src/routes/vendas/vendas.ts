import { Router, Request, Response } from 'express';
/* import { checkToken, permissaoMiddleware } from '../middlewares/checkToken'; */
import vendaControllers from '../../controllers/vendaControllers';

const router: Router = Router();

/**
 * @swagger
 * /vendas:
 *   post:
 *     summary: Criar nova venda
 *     description: Cria uma nova venda no sistema.
 *     tags:
 *       - Vendas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 example: "12345"
 *               total:
 *                 type: number
 *                 example: 150.75
 *               produtos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_produto:
 *                       type: string
 *                       example: "54321"
 *                     quantidade:
 *                       type: number
 *                       example: 2
 *     responses:
 *       200:
 *         description: Venda criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 status:
 *                   type: string
 *                   example: "success"
 *       500:
 *         description: Erro ao criar venda.
 */
router.route('/vendas').post(
  (req: Request, res: Response) =>
    vendaControllers.post(req, res)
);

/**
 * @swagger
 * /getOrders:
 *   get:
 *     summary: Obter pedidos
 *     description: Retorna uma lista de pedidos.
 *     tags:
 *       - Vendas
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"
 *                   status:
 *                     type: string
 *                     example: "pending"
 *       500:
 *         description: Erro ao obter pedidos.
 */
router.route("/getOrders").get(
 (
    req: Request,
    res: Response
  ) => vendaControllers.getOrders(req, res)
);


export default router;
