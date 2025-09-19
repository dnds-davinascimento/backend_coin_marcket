import { Router, Request, Response } from "express";
import wallet from "../../controllers/walletController";

const router: Router = Router();


router.route("/wallet").post(

    (req: Request, res: Response) => wallet.createWallet(req, res)
);

router.route("/wallet/faucet/:address").post(
    (req: Request, res: Response) => wallet.sendFaucet(req, res)
);
router.route("/wallet/balance/:address").get(
    (req: Request, res: Response) => wallet.getBalance(req, res)
);
router.route("/wallet/transactions/:address").get(
    (req: Request, res: Response) => wallet.getTransactions(req, res)
);

export default router;
