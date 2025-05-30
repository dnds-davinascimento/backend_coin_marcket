import { Router } from "express";
import produtoRouter from "./produtos/produtos";
import vendaRouter from "./vendas/vendas"
import adminRouter from "./admin/admin";
import loginRouter from "./login/login";
import webhookRouter from "./webhook/webhook"
import customerRouter from "./customer/customer"
import usersRouter from "./users/users"
import lojaRouter from "./loja/loja"
import categoriaRouter from "./categoria/categoria"
import cartRouter from "./cart/cart"
import credenciaisRouter from "./credenciais/credenciais";
import docsCustomersRouter from "./docsCustomers/docsCustomers";


const router: Router = Router();

// Usando as rotas importadas
router.use("/", produtoRouter);
router.use("/", adminRouter);
router.use("/", loginRouter);
router.use("/", webhookRouter);
router.use("/", customerRouter);
router.use("/" , usersRouter)
router.use("/", lojaRouter);
router.use("/", categoriaRouter);
router.use("/",cartRouter);
router.use("/",vendaRouter);
router.use("/", credenciaisRouter);
router.use("/", docsCustomersRouter);



export default router;
