import { Router, Request, Response } from "express";
import categoriaControllers from "../../controllers/categoriaController";
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken'; 

const router: Router = Router();

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Criar uma nova categoria
 *     description: Cria uma nova categoria no sistema com todas as propriedades necessárias.
 *     tags:
 *       - Categoria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Eletrônicos"
 *                 description: Nome da categoria (obrigatório)
 *               categoria_da_loja:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: ID da loja associada à categoria
 *               parient:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: ID da categoria pai (para subcategorias)
 *               subcategorias:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                       description: ID da subcategoria
 *                     nome:
 *                       type: string
 *                       example: "Smartphones"
 *                       description: Nome da subcategoria
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Categoria criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Dados inválidos ou faltando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "O campo 'nome' é obrigatório"
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: Conflito - Categoria já existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Já existe uma categoria com este nome"
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar categoria"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 * 
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         nome:
 *           type: string
 *           example: "Eletrônicos"
 *         categoria_da_loja:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         parient:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         subcategorias:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *               nome:
 *                 type: string
 *                 example: "Smartphones"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.route("/categorias").post(
  checkToken, permissionsMiddleware('categoria'),
  (req: Request, res: Response) => categoriaControllers.create(req, res)
);

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Listar todas as categorias
 *     description: Retorna uma lista de todas as categorias cadastradas no sistema.
 *     tags:
 *       - Categoria
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Categorias encontradas com sucesso"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Categoria'
 */ 
router.route("/categorias").get(
  
/* checkToken, permissionsMiddleware('categoria'), */
  (req: Request, res: Response) => categoriaControllers.getByLoja(req, res)
);

router.route("/categorias/:id").get(
 checkToken, permissionsMiddleware('categoria'),
    (req: Request, res: Response) => categoriaControllers.getById(req, res)
);

router.route("/categorias/:id").put(
checkToken, permissionsMiddleware('categoria'),
    (req: Request, res: Response) => categoriaControllers.updateById(req, res)
);

router.route("/setSubcategorias").post(
checkToken, permissionsMiddleware('categoria'),
    (req: Request, res: Response) => categoriaControllers.setSubcategorias(req, res)
);
router.route("/categorias/:id").delete(
checkToken, permissionsMiddleware('categoria'),
    (req: Request, res: Response) => categoriaControllers.deleteById(req, res)
);
router.route("/createCategoriaShop9").post(
/* checkToken, permissionsMiddleware('categoria'), */
    (req: Request, res: Response) => categoriaControllers.createCategoriaShop9(req, res)
);
 
router.route("/createSubCategoriaShop9").post(
/* checkToken, permissionsMiddleware('categoria'), */
    (req: Request, res: Response) => categoriaControllers.createSubCategoriaShop9(req, res)
);
 

export default router;