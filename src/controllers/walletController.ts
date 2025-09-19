import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";


dotenv.config();

const walletController = {
    createWallet: async (req: Request, res: Response): Promise<void> => {
        try {
            const wallet = ethers.Wallet.createRandom();

            const newWallet = new Wallet({
                address: wallet.address,
                privateKey: wallet.privateKey,
            });

            await newWallet.save();

            res.json({ address: wallet.address });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },
    sendFaucet: async (req: Request, res: Response): Promise<void> => {
        try {
            const { address } = req.params;

            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            const faucetWallet = new ethers.Wallet(process.env.FAUCET_PK!, provider);

            const tx = await faucetWallet.sendTransaction({
                to: address,
                value: ethers.parseEther("0.01"),
            });

            res.json({ txHash: tx.hash });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },
    getBalance: async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;

    // Providers
    const mainnetProvider = new ethers.JsonRpcProvider(process.env.URL_MAINNET);
    const testnetProvider = new ethers.JsonRpcProvider(process.env.URL_TESTNET);

    // Saldo Mainnet
    const mainnetBalance = await mainnetProvider.getBalance(address);
    const mainnetBalanceETH = ethers.formatEther(mainnetBalance);

    // Saldo Testnet Sepolia
    const testnetBalance = await testnetProvider.getBalance(address);
    const testnetBalanceETH = ethers.formatEther(testnetBalance);

    res.json({
      address,
      mainnet: mainnetBalanceETH,
      sepolia: testnetBalanceETH
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
  },  
   getTransactions: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      // 1️⃣ Busca todas as transações ETH da carteira
      const ETHERSCAN_API_KEY = process.env.ETHER_SCAN_API_KEY;
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

      const response = await axios.get(url);
      const data = response.data as { result: any[] };
      const txs = data.result;

      // 2️⃣ Busca preço atual do ETH em BRL
      const priceResponse = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=brl"
      );
      const ethPriceBRL = (priceResponse.data as { ethereum: { brl: number } }).ethereum.brl;

      // 3️⃣ Calcula taxa (fee = gasUsed * gasPrice) e valor em BRL
      const transactions = txs.map((tx: any) => {
        const feeETH = ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice));
        const valueETH = ethers.formatEther(tx.value);

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          valueETH,
          valueBRL: (parseFloat(valueETH) * ethPriceBRL).toFixed(2),
          gasUsed: tx.gasUsed,
          gasPrice: ethers.formatUnits(tx.gasPrice, "gwei") + " Gwei",
          feeETH,
          feeBRL: (parseFloat(feeETH) * ethPriceBRL).toFixed(2)
        };
      });

      // 4️⃣ Soma todas as taxas em ETH e BRL
      const totalFeesETH = transactions.reduce((acc, tx) => acc + parseFloat(tx.feeETH), 0);
      const totalFeesBRL = (totalFeesETH * ethPriceBRL).toFixed(2);

      // 5️⃣ Saldo atual em ETH e BRL
      const provider = new ethers.JsonRpcProvider(process.env.URL_MAINNET);
      const balanceETH = ethers.formatEther(await provider.getBalance(address));
      const balanceBRL = (parseFloat(balanceETH) * ethPriceBRL).toFixed(2);

      res.json({
        address,
        totalTx: transactions.length,
        balanceETH,
        balanceBRL,
        totalFeesETH: totalFeesETH.toFixed(6),
        totalFeesBRL,
        transactions
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

};

export default walletController;
