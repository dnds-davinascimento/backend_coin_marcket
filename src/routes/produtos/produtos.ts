import { Router, Request, Response } from "express";
import produtoControllers from "../../controllers/produtoControllers";
import { checkToken, permissionsMiddleware } from '../../middlewares/checkToken';

const router: Router = Router();

/**
 * @swagger
 * /createProduct:
 *   post:
 *     summary: Criar um novo produto
 *     description: Cria um novo produto no sistema com todas as propriedades necessárias.
 *     tags:
 *       - Produto
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
 *               - categoria
 *               - un
 *               - preco_de_custo
 *               - preco_de_venda
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Produto Exemplo"
 *                 description: Nome do produto (obrigatório)
 *               categoria:
 *                 type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                     description: ID da categoria (obrigatório)
 *                   nome:
 *                     type: string
 *                     example: "Eletrônicos"
 *                     description: Nome da categoria (opcional)
 *               codigo_interno:
 *                 type: string
 *                 example: "PROD-001"
 *                 description: Código interno do produto
 *               codigo_da_nota:
 *                 type: string
 *                 example: "NF-12345"
 *               enderecamento:
 *                 type: string
 *                 example: "Prateleira A3"
 *               codigo_de_barras:
 *                 type: string
 *                 example: "7891234567890"
 *               codigo_do_fornecedor:
 *                 type: string
 *                 example: "FORN-001"
 *               marca:
 *                 type: string
 *                 example: "Marca Exemplo"
 *               estoque_minimo:
 *                 type: number
 *                 example: 10
 *                 default: 0
 *               estoque_maximo:
 *                 type: number
 *                 example: 100
 *                 default: 0
 *               estoque:
 *                 type: number
 *                 example: 50
 *                 default: 0
 *               un:
 *                 type: string
 *                 example: "un"
 *                 enum: ["un", "kg", "g", "l", "ml", "m", "cm"]
 *                 description: Unidade de medida do produto (obrigatório)
 *               preco_de_custo:
 *                 type: number
 *                 example: 15.99
 *                 description: Preço de custo do produto (obrigatório)
 *               preco_de_venda:
 *                 type: number
 *                 example: 29.99
 *                 description: Preço de venda do produto (obrigatório)
 *               ncm:
 *                 type: string
 *                 example: "8517.12.00"
 *                 description: Código NCM do produto
 *               cest:
 *                 type: string
 *                 example: "28.038.00"
 *               cst:
 *                 type: string
 *                 example: "00"
 *               cfop:
 *                 type: string
 *                 example: "5102"
 *               origem_da_mercadoria:
 *                 type: string
 *                 example: "0"
 *                 enum: ["0", "1", "2"]
 *                 default: "0"
 *                 description: "0-Nacional, 1-Estrangeira Importação direta, 2-Estrangeira Adquirida no mercado interno"
 *               peso_bruto_em_kg:
 *                 type: number
 *                 example: 0.5
 *                 default: 0
 *               peso_liquido_em_kg:
 *                 type: number
 *                 example: 0.4
 *                 default: 0
 *               icms:
 *                 type: number
 *                 example: 18
 *                 default: 0
 *                 description: Percentual de ICMS
 *               ipi:
 *                 type: number
 *                 example: 5
 *                 default: 0
 *                 description: Percentual de IPI
 *               frete:
 *                 type: number
 *                 example: 2.5
 *                 default: 0
 *                 description: Valor do frete por unidade
 *               produto_da_loja:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: ID da loja associada ao produto
 *               produto_do_fornecedor:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *                 description: ID do fornecedor do produto
 *               produto_verify:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               produto_marcket:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               produto_de_rota:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               produto_shared:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               produto_servico:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *               mostrar_no_super_market:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
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
 *                   example: "Produto criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Produto'
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
 *                   example: "Campos obrigatórios faltando"
 *       401:
 *         description: Não autorizado
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
 *                   example: "Erro ao criar produto"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 * 
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         nome:
 *           type: string
 *           example: "Produto Exemplo"
 *         categoria:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             nome:
 *               type: string
 *               example: "Eletrônicos"
 *         codigo_interno:
 *           type: string
 *           example: "PROD-001"
 *         estoque:
 *           type: number
 *           example: 50
 *         preco_de_custo:
 *           type: number
 *           example: 15.99
 *         preco_de_venda:
 *           type: number
 *           example: 29.99
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
router.route("/products").post(
  checkToken,
  permissionsMiddleware('product'),
  (req: Request, res: Response) => produtoControllers.createProduct(req, res)
);
/* rota de buscar produto por loja getProductsByStore */
router.route("/products").get(


  (req: Request, res: Response) => produtoControllers.getProductsByStore(req, res)
);
/* rota de buscar produto por id getProductById */
router.route("/products/:id").get(
  checkToken,
  permissionsMiddleware('product'),
  (req: Request, res: Response) => produtoControllers.getProductById(req, res)
);
router.route("/products/slug/:slug").get(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.getProductBySlug(req, res)
);

/* rota de deletar produto por id editProductById */
router.route("/products/:id").delete(
  checkToken,
  permissionsMiddleware('product'),
  (req: Request, res: Response) => produtoControllers.deleteProductById(req, res)
);
/* rota de editar produto por id editProductById */
router.route("/products/:id").put(
  checkToken,
  permissionsMiddleware('product'),
  (req: Request, res: Response) => produtoControllers.updateProductById(req, res)
);
router.route("/sincProducts").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.sincProducts(req, res)
);
router.route("/getProdutodetalhes").get(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.getProdutodetalhes(req, res)
);
router.route("/postsingleProductsNuvemShop").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.postsingleProductsNuvemShop(req, res)
);
router.route("/sinc_img_Product").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.sinc_img_Product(req, res)
);
router.route("/sinc_metadados_IA").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.sinc_metadados_IA(req, res)
);
router.route("/sincronizarPrecosShop9MongoDB").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.sincronizarPrecosShop9MongoDB(req, res)
);
router.route("/sincronizarEstoqueShop9MongoDB").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.sincronizarEstoqueShop9MongoDB(req, res)
);
router.route("/functionSincSlugUrlCanonical").post(
  /*     checkToken,
      permissionsMiddleware('product'),  */
  (req: Request, res: Response) => produtoControllers.functionSincSlugUrlCanonical(req, res)
);

export default router;