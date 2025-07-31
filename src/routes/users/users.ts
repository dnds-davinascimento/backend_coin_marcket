import { Router, Request, Response } from "express";
import userController from "../../controllers/userController";
import { checkToken, permissionsMiddleware } from "../../middlewares/checkToken";

const router: Router = Router();

/**
 * @swagger
 * /creat_user_shofusion:
 *   post:
 *     summary: Registrar um novo usuário
 *     description: Cria um novo usuário no sistema.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Usuário Teste"
 *               email:
 *                 type: string
 *                 example: "usuario@exemplo.com"
 *               password:
 *                 type: string
 *                 example: "senhaSuperSegura123"
 *               permissions:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     properties:
 *                       view:
 *                         type: boolean
 *                         example: true
 *                       create:
 *                         type: boolean
 *                         example: false
 *                       edit:
 *                         type: boolean
 *                         example: false
 *                       delete:
 *                         type: boolean
 *                         example: false
 *                   product:
 *                     type: object
 *                     properties:
 *                       view:
 *                         type: boolean
 *                         example: true
 *                       create:
 *                         type: boolean
 *                         example: true
 *                       edit:
 *                         type: boolean
 *                         example: false
 *                       delete:
 *                         type: boolean
 *                         example: false
 *                   order:
 *                     type: object
 *                     properties:
 *                       view:
 *                         type: boolean
 *                         example: true
 *                       create:
 *                         type: boolean
 *                         example: true
 *                       edit:
 *                         type: boolean
 *                         example: false
 *                       delete:
 *                         type: boolean
 *                         example: false
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuário registrado com sucesso!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     nome:
 *                       type: string
 *                       example: "Usuário Teste"
 *                     email:
 *                       type: string
 *                       example: "usuario@exemplo.com"
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             view:
 *                               type: boolean
 *                               example: true
 *                             create:
 *                               type: boolean
 *                               example: false
 *                             edit:
 *                               type: boolean
 *                               example: false
 *                             delete:
 *                               type: boolean
 *                               example: false
 *                         product:
 *                           type: object
 *                           properties:
 *                             view:
 *                               type: boolean
 *                               example: true
 *                             create:
 *                               type: boolean
 *                               example: true
 *                             edit:
 *                               type: boolean
 *                               example: false
 *                             delete:
 *                               type: boolean
 *                               example: false
 *                         order:
 *                           type: object
 *                           properties:
 *                             view:
 *                               type: boolean
 *                               example: true
 *                             create:
 *                               type: boolean
 *                               example: true
 *                             edit:
 *                               type: boolean
 *                               example: false
 *                             delete:
 *                               type: boolean
 *                               example: false
 *       400:
 *         description: Dados ausentes ou inválidos no corpo da requisição.
 *       401:
 *         description: Usuário não autorizado.
 *       500:
 *         description: Erro no servidor ao registrar o usuário.
 */
router.route("/creat_user_shofusion").post(
  checkToken,
  permissionsMiddleware('user'), 
  (req: Request, res: Response) => userController.registerUser(req, res)
);
/**
 * @swagger
 * /get_user_store:
 *   get:
 *     summary: Obter informações da loja do usuário
 *     description: Retorna os dados da loja associados ao usuário, utilizando o ID do cabeçalho.
 *     tags:
 *       - User
 *     parameters:
 *       - in: header
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da loja associado ao usuário.
 *       - in: header
 *         name: user_store_idd
 *         required: false
 *         schema:
 *           type: string
 *         description: ID alternativo da loja associado ao usuário (caso presente).
 *     responses:
 *       200:
 *         description: Dados da loja retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "605c72e4f1b7ec28f0a1f2b7"
 *                 nome:
 *                   type: string
 *                   example: "Loja Teste"
 *                 endereco:
 *                   type: string
 *                   example: "Rua Exemplo, 123"
 *                 telefone:
 *                   type: string
 *                   example: "(11) 98765-4321"
 *       400:
 *         description: ID da loja não fornecido.
 *       404:
 *         description: Loja não encontrada.
 *       500:
 *         description: Erro no servidor ao buscar a loja.
 */

router.route("/get_user_store").get(
  checkToken,
  permissionsMiddleware('user'),  
  (req: Request, res: Response) => userController.get_user_store(req, res)
);
/**
 * @swagger
 * /UserById/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     description: Retorna as informações de um usuário com base no ID fornecido.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Informações do usuário retornadas com sucesso.
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
 *                   example: "Usuário Teste"
 *                 email:
 *                   type: string
 *                   example: "usuario@exemplo.com"
 *                 permissao:
 *                   type: string
 *                   example: "user"
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro no servidor ao buscar o usuário.
 */

router.route("/UserById/:id").get(
  checkToken,
  permissionsMiddleware('user'), 
  (req: Request, res: Response) => userController.UserById(req, res)
);
/**
 * @swagger
 * /edit_user_shofusion/{id}:
 *   put:
 *     summary: Atualizar informações de um usuário pelo ID
 *     description: Atualiza os dados de um usuário existente no sistema.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Usuário Atualizado"
 *               email:
 *                 type: string
 *                 example: "novousuario@exemplo.com"
 *               password:
 *                 type: string
 *                 example: "novaSenhaSegura123"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["admin", "editor"]
 *               paymentAlert:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b2f9f1b8e001f5a4215"
 *                     name:
 *                       type: string
 *                       example: "Usuário Atualizado"
 *                     email:
 *                       type: string
 *                       example: "novousuario@exemplo.com"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["admin", "editor"]
 *                     paymentAlert:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Dados fornecidos são inválidos ou incompletos.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro no servidor ao atualizar o usuário.
 */

router.route("/edit_user_shofusion/:id").put(
  checkToken,
  permissionsMiddleware('user'), 
  (req: Request, res: Response) => userController.editUserById(req, res)
);
/**
 * @swagger
 * /delete_user/{id}:
 *   delete:
 *     summary: Deletar um usuário pelo ID
 *     description: Deleta um usuário do sistema pelo seu ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do usuário a ser deletado.
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuário deletado com sucesso!"
 *       400:
 *         description: ID do usuário inválido ou ausente.
 *       401:
 *         description: Usuário não autorizado.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro no servidor ao deletar o usuário.
 */
router.route("/delete_user/:id").delete(
  checkToken,
  permissionsMiddleware('user'), 
  (req: Request, res: Response) => userController.deleteUserById(req, res)
);
router.route("/getMotoristas").get(

  (req: Request, res: Response) => userController.getMotoristas(req, res)
);



export default router;
