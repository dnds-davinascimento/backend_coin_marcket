import { Router, Request, Response } from "express";
import produtoControllers from "../../controllers/produtoControllers";
import {checkToken,permissionsMiddleware }from '../../middlewares/checkToken'; 

const router: Router = Router();

/**
 * @swagger
 * /produto_idealsoft:
 *   get:
 *     summary: Buscar produtos da Idealsoft
 *     description: Retorna uma lista de produtos da Idealsoft.
 *     tags:
 *       - Produtos
 *     responses:
 *       200:
 *         description: Produtos da Idealsoft retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Produtos da Idealsoft retornados com sucesso!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       nome:
 *                         type: string
 *                         example: "Produto A"
 *                       descricao:
 *                         type: string
 *                         example: "Descrição do Produto A"
 *       500:
 *         description: Erro ao buscar produtos da Idealsoft.
 */
router.route("/produto_idealsoft").get(
  checkToken,
  permissionsMiddleware('product'),  // Defina o recurso como string
  (req: Request, res: Response) => produtoControllers.getIdealsoft(req, res)
);

export default router;
