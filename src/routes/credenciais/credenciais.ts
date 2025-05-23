import { Router, Request, Response } from "express";
import {checkToken,permissionsMiddleware }from '../../middlewares/checkToken'; 
import credenciaisController from "../../controllers/credenciaisController";

const router: Router = Router();

/**
 * @swagger
 * /IdealSoftwareCredentials:
 *   post:
 *     summary: Registrar uma nova credencial
 *     description: Registra uma nova credencial de acesso para o sistema Ideal Software.
 *     tags:
 *       - Credenciais
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 example: "senhaSegura@123"
 *               client_id:
 *                 type: string
 *                 example: "abc123xyz"
 *               client_secret:
 *                 type: string
 *                 example: "secreta456"
 *     responses:
 *       201:
 *         description: Credencial registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Credencial registrada com sucesso!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     username:
 *                       type: string
 *                       example: "usuario123"
 *       400:
 *         description: Parâmetros inválidos ou ausentes.
 *       401:
 *         description: Falha na autenticação do token.
 *       500:
 *         description: Erro ao registrar a credencial.
 */
router.route("/IdealSoftwareCredentials").post(
 /*  checkToken, permissionsMiddleware('credencial'), */ (
    req: Request,
    res: Response
  ) => credenciaisController.registerCredencial(req, res)
);

/**
 * @swagger
 * /getIdealSoftwareCredentials:
 *   get:
 *     summary: Listar todas as credenciais
 *     description: Retorna todas as credenciais registradas no sistema Ideal Software.
 *     tags:
 *       - Credenciais
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credenciais listadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Credenciais listadas com sucesso!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       username:
 *                         type: string
 *                         example: "usuario123"
 *       401:
 *         description: Falha na autenticação do token.
 *       500:
 *         description: Erro ao listar as credenciais.
 */
router.route("/getIdealSoftwareCredentials").get(
  checkToken, permissionsMiddleware('credencial'), (
    req: Request,
    res: Response
  ) => credenciaisController.listCredenciais(req, res)
);

/**
 * @swagger
 * /updateIdealSoftwareCredentials/{id}:
 *   put:
 *     summary: Editar uma credencial existente
 *     description: Atualiza uma credencial existente no sistema Ideal Software com base no ID.
 *     tags:
 *       - Credenciais
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da credencial a ser editada.
 *         schema:
 *           type: string
 *           example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 example: "novaSenhaSegura@123"
 *               client_id:
 *                 type: string
 *                 example: "abc123xyz"
 *               client_secret:
 *                 type: string
 *                 example: "novaSecret456"
 *     responses:
 *       200:
 *         description: Credencial atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Credencial atualizada com sucesso!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     username:
 *                       type: string
 *                       example: "usuario123"
 *       400:
 *         description: Parâmetros inválidos ou ausentes.
 *       401:
 *         description: Falha na autenticação do token.
 *       404:
 *         description: Credencial não encontrada.
 *       500:
 *         description: Erro ao editar a credencial.
 */
router.route("/updateIdealSoftwareCredentials/:id").put(
  checkToken,permissionsMiddleware('credencial'), (
    req: Request,
    res: Response
  ) => credenciaisController.updateIdealSoftwareCredentials(req, res)
);

export default router;
