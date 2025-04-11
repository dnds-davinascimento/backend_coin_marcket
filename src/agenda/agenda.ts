import produtoControllers from "../controllers/produtoControllers";
/* import Agenda from 'agenda'; */

/* const agenda = new Agenda({ db: { address: process.env.MONGO_URI! } }); */

// Define o job
/* agenda.define('sincronizar estoque', async () => {
  console.log('Sincronizando estoque...');
  
  try {
    await produtoControllers.sincronizarEstoqueIdealNuvem({ headers: { id: '67aa03a8d4834139fe1f1829' } } as any, {
      status: (code: number) => ({
        json: (message: any) => console.log(message),
      }),
    } as any);

    console.log('Sincronização concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar estoque:', error);
  }
}); */

/* export default agenda; */
