import { Router } from "express";
import produtoRouter from "./produtos/produtos";
import vendaRouter from "./vendas/vendas";
import adminRouter from "./admin/admin";
import loginRouter from "./login/login";
import webhookRouter from "./webhook/webhook"
import customerRouter from "./customer/customer"
import usersRouter from "./users/users"
import lojaRouter from "./loja/loja"
import categoriaRouter from "./categoria/categoria"


const router: Router = Router();

// Usando as rotas importadas
router.use("/", produtoRouter);
router.use("/", vendaRouter);
router.use("/", adminRouter);
router.use("/", loginRouter);
router.use("/", webhookRouter);
router.use("/", customerRouter);
router.use("/" , usersRouter)
router.use("/", lojaRouter);
router.use("/", categoriaRouter);



export default router;
