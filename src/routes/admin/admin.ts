import { Router, Request, Response } from "express";
import adminController from "../../controllers/adminController";

const router: Router = Router();

/**
 * @swagger
 * /register_admin:
 *   post:
 *     summary: Registrar um novo administrador
 *     description: Cria um novo administrador no sistema. A senha é criptografada antes de ser armazenada no banco de dados.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *               name:
 *                 type: string
 *                 example: "Admin Name"
 *     responses:
 *       201:
 *         description: Admin registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Admin registrado com sucesso!"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60b5f2f3c9f07b001f8d2b0b"
 *                     name:
 *                       type: string
 *                       example: "Admin Name"
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     nuvemshopConfigured:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: O e-mail já está em uso.
 *       500:
 *         description: Erro no servidor ao tentar registrar o administrador.
 */

router.route("/registerAdmin").post(
  (req: Request, res: Response) => adminController.registerAdmin(req, res)
);
/**
 * @swagger
 * /AdminById/{id}:
 *   get:
 *     summary: Busca um administrador pelo ID
 *     description: Retorna as informações de um administrador com base no ID fornecido.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do administrador
 *     responses:
 *       200:
 *         description: Informações do administrador retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9f1b8e001f5a4215"
 *                 nome:
 *                   type: string
 *                   example: "Admin Teste"
 *                 email:
 *                   type: string
 *                   example: "admin@exemplo.com"
 *                 permissao:
 *                   type: string
 *                   example: "admin"
 *       404:
 *         description: Administrador não encontrado.
 *       500:
 *         description: Erro no servidor ao buscar o administrador.
 */

router.route("/AdminById/:id").get(
  (req: Request, res: Response) => adminController.AdminById(req, res)
);
/**
 * @swagger
 * /updateAdminById/{id}:
 *   put:
 *     summary: Atualizar um administrador pelo ID
 *     description: Atualiza as informações de um administrador existente no sistema.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin Atualizado"
 *               email:
 *                 type: string
 *                 example: "novoemail@exemplo.com"
 *               password:
 *                 type: string
 *                 example: "novaSenhaSegura123"
 *               paymentAlert:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Administrador atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Admin atualizado com sucesso!"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b2f9f1b8e001f5a4215"
 *                     name:
 *                       type: string
 *                       example: "Admin Atualizado"
 *                     email:
 *                       type: string
 *                       example: "novoemail@exemplo.com"
 *                     paymentAlert:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Email já está em uso ou dados inválidos.
 *       404:
 *         description: Administrador não encontrado.
 *       500:
 *         description: Erro no servidor ao atualizar o administrador.
 */
router.route("/updateAdminById/:id").put(
  (req: Request, res: Response) => adminController.updateAdminById(req, res)
);
export default router;
