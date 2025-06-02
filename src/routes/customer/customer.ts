import { Router, Request, Response } from "express";
import customerControllers from "../../controllers/customerController";  // Controller de clientes

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

router.route("/registerCustomer").post(
    (req: Request, res: Response) => customerControllers.createCustomer(req, res)
  );
router.route("/updateCustomer/:id").put(
    (req: Request, res: Response) => customerControllers.updateCustomer(req, res)
  );
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

router.route("/getCustomerById/:id").get(
    (req: Request, res: Response) => customerControllers.getCustomerById(req, res)
  );
router.route("/getCustomersByStore").get(
    (req: Request, res: Response) => customerControllers.getCustomersByStore(req, res)
  );

export default router;
