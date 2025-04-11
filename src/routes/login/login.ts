import { Router, Request, Response } from "express";
import loginControllers from "../../controllers/loginControllers";

const router: Router = Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login de usuário
 *     description: Realiza o login do usuário no sistema com base nas credenciais fornecidas.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario_exemplo"
 *               password:
 *                 type: string
 *                 example: "senha_segura"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Login realizado com sucesso!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciais inválidas.
 *       500:
 *         description: Erro no servidor ao realizar o login.
 */
router.route("/login").post(
  (req: Request, res: Response) => loginControllers.login(req, res)
);

export default router;
