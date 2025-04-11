import { Router, Request, Response } from "express";
import clienteControllers from "../../controllers/clienteController";  // Controller de clientes

const router: Router = Router();

/**
 * @swagger
 * /getClientesIdealsoft:
 *   get:
 *     summary: Buscar clientes da Idealsoft
 *     description: Retorna uma lista de todos os clientes da Idealsoft.
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Clientes da Idealsoft retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Clientes da Idealsoft retornados com sucesso!"
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
 *                         example: "Cliente A"
 *                       email:
 *                         type: string
 *                         example: "clientea@idealsoft.com"
 *       500:
 *         description: Erro ao buscar clientes da Idealsoft.
 */
router.route("/getClientesIdealsoft").get(
  (req: Request, res: Response) => clienteControllers.getClientesIdealsoft(req, res)
);


export default router;
