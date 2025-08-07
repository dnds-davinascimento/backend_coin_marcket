import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Categoria } from "../models/categoria";
import { obterCredenciais } from "../services/credenciaisService";
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import axios, { create } from "axios";

interface CategoriaBody {
  nome: string;
  categoria_da_loja?: string;
  categoriaDestaque?: boolean;
  img_url?: {
    key: string;
    url: string;
  };
  parient?: string;
  subcategorias?: Array<{
    id: string;
    nome: string;
    remove?: boolean; // Adicionando o campo remove
  }>;
}
const categoriaSchema = {
  create: async (req: Request, res: Response) => {
    try {
      /* id da loja nos headers */
      const lojaId = req.headers.user_store_id as string;

      const { nome, categoriaDestaque, img_url }: CategoriaBody = req.body;



      // Validações básicas
      if (!nome) {
        return res.status(400).json({
          success: false,
          msg: "O campo 'nome' é obrigatório",
        });
      }

      // Verificar se a categoria já existe
      const categoriaExistente = await Categoria.findOne({ nome });
      if (categoriaExistente) {
        return res.status(400).json({
          success: false,
          msg: "Já existe uma categoria com este nome",
        });
      }

      // Criar objeto da categoria
      const novaCategoria = new Categoria({
        nome,
        categoria_da_loja: lojaId,
        categoriaDestaque,
        img_url

      });

      // Salvar no banco de dados
      const categoriaSalva = await novaCategoria.save();


      return res.status(201).json({
        success: true,
        msg: "Categoria criada com sucesso",
        data: categoriaSalva,
      });

    } catch (error) {

      return res.status(500).json({msg: "Erro interno ao criar categoria",});
    }
  },
  /* pegar categorias por loja */
  getByLoja: async (req: Request, res: Response) => {
    try {

      let lojaId = req.headers.user_store_id as string;
      if (!lojaId) {
        lojaId = "6807ab4fbaead900af4db229"
      }

      // Verifica se o ID da loja é válido
      if (!mongoose.Types.ObjectId.isValid(lojaId)) {
        return res.status(400).json({
          success: false,
          msg: "ID de loja inválido",
        });
      }

      // Busca as categorias associadas à loja
      const categorias = await Categoria.find({ categoria_da_loja: lojaId });

      return res.status(200).json(categorias);

    } catch (error) {

      return res.status(500).json({msg: "Erro interno ao processar a busca de categorias"});
    }
  },
  /* pegar categorias por id */
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          msg: "ID inválido",
        });
      }

      // Busca a categoria pelo ID
      const categoria = await Categoria.findById(id);

      if (!categoria) {
        return res.status(404).json({
          success: false,
          msg: "Categoria não encontrada",
        });
      }

      return res.status(200).json(categoria);

    } catch (error) {

      return res.status(500).json({msg: "Erro interno ao processar a busca de categoria"});
    }
  },
  /* editar por id    */
  updateById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nome, subcategorias, categoriaDestaque, img_url }: CategoriaBody = req.body;

      /* verificar se exite categoria */
      const categoriaExistente = await Categoria.findById(id);
      if (!categoriaExistente) {
        return res.status(404).json({
          success: false,
          msg: "Categoria não encontrada",
        });
      }
      categoriaExistente.nome = nome || categoriaExistente.nome;
      categoriaExistente.categoriaDestaque = categoriaDestaque || categoriaExistente.categoriaDestaque;
      categoriaExistente.img_url = img_url || categoriaExistente.img_url;

      /* verificar se alguma subcategoria tem o atributo remove: true se estiver remover do array */
      if (subcategorias) {
        /*pargar o id da categoria que esta sendo removida */
        const subcategoriasRemovidas = subcategorias.filter((subcategoria) => subcategoria.remove).map(subcategoria => subcategoria.id);
        /* limpar o atributo parient?: string; da subcategoria no banco  */
        await Categoria.updateMany(
          { _id: { $in: subcategoriasRemovidas } },
          { $unset: { parient: "" } }
        );
        /* remover subcategorias do array de subcategorias da categoria pai */
        const filteredSubcategorias = (categoriaExistente.subcategorias ?? []).filter(subcategoria => !subcategoriasRemovidas.includes(subcategoria.id.toString()));
        categoriaExistente.subcategorias = filteredSubcategorias.length === 1 ? [filteredSubcategorias[0]] : undefined;
      }
      /* salvar a categoria */
      const categoriaAtualizada = await categoriaExistente.save();
      return res.status(200).json({
        success: true,
        msg: "Categoria atualizada com sucesso",
        data: categoriaAtualizada,
      });



    } catch (error) {

      return res.status(500).json({ msg: "Erro interno ao processar a atualização da categoria", });
    }
  },
  /* deletar por id */
  deleteById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          msg: "ID inválido",
        });
      }

      // Verifica se a categoria existe
      const categoriaExistente = await Categoria.findById(id);
      if (!categoriaExistente) {
        return res.status(404).json({
          success: false,
          msg: "Categoria não encontrada",
        });
      }

      // Remove a categoria pelo ID
      await Categoria.findByIdAndDelete(id);

      // Remove a categoria da lista de subcategorias da categoria pai, se existir
      if (categoriaExistente.parient) {
        await Categoria.updateOne(
          { _id: categoriaExistente.parient },
          { $pull: { subcategorias: { id: categoriaExistente._id } } }
        );
      }

      return res.status(200).json({
        success: true,
        msg: "Categoria deletada com sucesso",
      });

    } catch (error) {

      return res.status(500).json({ msg: "Erro interno ao processar a exclusão da categoria"});
    }
  },
  /* definir subcategorias de categorias */
  setSubcategorias: async (req: Request, res: Response) => {
    try {

      const { categoriaPai_Id, categoriasSelecionadas } = req.body;

      // 2. Verificar se a categoria pai existe
      const categoriaPai = await Categoria.findById(categoriaPai_Id);
      if (!categoriaPai) {
        return res.status(404).json({
          success: false,
          msg: "Categoria pai não encontrada",
        });
      }

      // 3. Atualizar a categoria pai com as subcategorias 

      // Certifica-se de que subcategorias está inicializado como um array
      if (!categoriaPai.subcategorias) {
        categoriaPai.subcategorias = [{ id: new mongoose.Types.ObjectId(), nome: "" }];
      }

      for (const categoriaId of categoriasSelecionadas) {
        if (!mongoose.Types.ObjectId.isValid(categoriaId)) {
          return res.status(400).json({
            success: false,
            msg: `ID de subcategoria inválido: ${categoriaId}`,
          });
        }
        const subcategoria = await Categoria.findById(categoriaId);
        if (!subcategoria) {
          return res.status(404).json({
            success: false,
            msg: `Subcategoria não encontrada: ${categoriaId}`,
          });
        }
        // Adiciona a subcategoria à lista de subcategorias da categoria pai
        categoriaPai.subcategorias.push({
          id: subcategoria._id as Types.ObjectId,
          nome: subcategoria.nome,
        });

        // Atualiza a subcategoria para referenciar a categoria pai
        await Categoria.findByIdAndUpdate(categoriaId, {
          parient: categoriaPai._id,
        });
      }

      // Salvar as alterações na categoria pai
      const categoriaAtualizada = await categoriaPai.save();




      return res.status(201).json({
        success: true,
        msg: "Subcategorias atualizadas com sucesso"

      });






    } catch (error) {

      return res.status(500).json({ msg: "Erro interno ao processar a atualização das subcategorias"});
    }
  },
  /* create categoria com shop9 */

  createCategoriaShop9: async (req: Request, res: Response) => {
    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;
      const { categoria_codigo } = req.body;
    
      // Verifica se o código da categoria é fornecido
      if (!categoria_codigo) {
        return res.status(400).json({
          success: false,
          msg: "O campo 'categoria_codigo' é obrigatório",
        });
      }

      // Verifica se a categoria já existe
      const categoriaExistente = await Categoria.findOne({ codigo_ideal: categoria_codigo });
      if (!categoriaExistente) {
        // Obter credenciais usando o serviço
        const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);
        if (!serie || !api || !codFilial || !senha) {
          res.status(500).json({
            msg: "Credenciais do usuário não estão completas. Produto não cadastrado.",
          });
          return;
        }

        // 1. Primeiro, obtenha o token de autenticação
        const token = await authService.getAuthToken(serie, codFilial, api);

        if (!token) {
          res.status(500).json({
            msg: "Falha na autenticação. Token não gerado. Produto não cadastrado.",
          });
          return;
        }

        const method = "get";
        const body = "";

        // Assumindo que o corpo está vazio para requisição GET
        const { signature, timestamp } = generateSignature(method, senha, body);

        // 2. Configuração do cabeçalho da requisição
        const headers = {
          Signature: signature,
          CodFilial: codFilial,
          Authorization: `Token ${token}`,
          Timestamp: timestamp.toString(),
        };

        interface ClasseData {
          codigo: string;
          nome: string;
        }

        interface ApiResponse {
          dados: ClasseData[];
        }

        // 3. Requisição para a API da Idealsoft com os headers para verrificar qual e a classe do produto
        const { data: classes } = await axios.get<ApiResponse>(
          `http://10.0.0.44:60002/aux/classes`,
          {
            headers,
          }
        );
        console.log(classes)
        // Filtrando os dados
        const resultadoclasse = classes.dados.find(
          (item) => item.codigo === categoria_codigo
        );
       
        if (resultadoclasse) {
          // 4. Criar a nova categoria com os dados da classe
          const novaCategoria = new Categoria({
            nome: resultadoclasse.nome,
            codigo_ideal: resultadoclasse.codigo,
            categoria_da_loja: id_loja,
          });

          // 5. Salvar a nova categoria no banco de dados
          const categoriaSalva = await novaCategoria.save();

          return res.status(201).json({
            success: true,
            msg: "Categoria criada com sucesso",
            data: categoriaSalva,
          });
        }
      } else {
        return res.status(201).json({
          success: true,
          msg: "Já existe uma categoria com este código",
          data: categoriaExistente,
        });
      }

    } catch (error) {

      return res.status(500).json({ msg: "Erro interno ao processar a criação da categoria"});
    }
  },
  /* create subCategoria com shop9 */
  createSubCategoriaShop9: async (req: Request, res: Response) => {
    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;
      const { subcategoria_codigo } = req.body;
     
      // Verifica se o código da subcategoria é fornecido
      if (!subcategoria_codigo) {
        return res.status(400).json({
          success: false,
          msg: "O campo 'subcategoria_codigo' é obrigatório",
        });
      }
      // Verifica se a subcategoria já existe
      const subcategoriaExistente = await Categoria.findOne({ codigo_ideal: subcategoria_codigo });
      if (!subcategoriaExistente) {
        // Obter credenciais usando o serviço
        const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);
        if (!serie || !api || !codFilial || !senha) {
          res.status(500).json({
            msg: "Credenciais do usuário não estão completas. Subcategoria não cadastrada.",
          });
          return;
        }

        // 1. Primeiro, obtenha o token de autenticação
        const token = await authService.getAuthToken(serie, codFilial, api);

        if (!token) {
          res.status(500).json({
            msg: "Falha na autenticação. Token não gerado. Subcategoria não cadastrada.",
          });
          return;
        }

        const method = "get";
        const body = "";
        // Assumindo que o corpo está vazio para requisição GET
        const { signature, timestamp } = generateSignature(method, senha, body);
        // 2. Configuração do cabeçalho da requisição
        const headers = {
          Signature: signature,
          CodFilial: codFilial,
          Authorization: `Token ${token}`,
          Timestamp: timestamp.toString(),
        };
        interface ClasseData {
          codigo: string;
          nome: string;
        }
        interface ApiResponse {
          dados: ClasseData[];
        }
        // 3. Requisição para a API da Idealsoft com os headers para verrificar qual e a classe do produto
                // 3. Requisição para a API da Idealsoft com os headers para verrificar qual e a classe do produto
        const { data: subclesses } = await axios.get<ApiResponse>(
          `http://10.0.0.44:60002/aux/subclasses`,
          {
            headers,
          }
        );
        
        // Filtrando os dados
        const resultadoSubclasse = subclesses.dados.find(
          (item) => item.codigo === subcategoria_codigo
        );
        console.log(resultadoSubclasse)
        if (resultadoSubclasse) {
          // Verifica se a categoria pai foi fornecida
          if (!req.body.parient) {
            return res.status(400).json({
              success: false,
              msg: "O campo 'parient' (ID da categoria pai) é obrigatório",
            });
          }
          // verificar se o parient já esta no mongodb
          const categoriaExistente = await Categoria.findOne({ codigo_ideal: req.body.parient });
          if (!categoriaExistente) {
            return res.status(404).json({
              success: false,
              msg: "Categoria pai não encontrada",
            });
          }

          // 4. Criar a nova subcategoria com os dados da classe
          const novaSubCategoria = new Categoria({
            nome: resultadoSubclasse.nome,
            codigo_ideal: resultadoSubclasse.codigo,
            categoria_da_loja: id_loja,
            parient: categoriaExistente._id, // Adiciona o ID da categoria pai
          });

          // 5. Salvar a nova subcategoria no banco de dados
          const subCategoriaSalva = await novaSubCategoria.save();

          // Atualizar a categoria pai para incluir a nova subcategoria
          
          categoriaExistente.subcategorias?.push({
            id: subCategoriaSalva._id as Types.ObjectId,
            nome: subCategoriaSalva.nome,
          });
          await categoriaExistente.save();

          return res.status(201).json({
            success: true,
            msg: "Subcategoria criada com sucesso",
            data: subCategoriaSalva,
          });
        }
      }else {
        /* retornar a subcategoria existente */
        return res.status(201).json({
          success: true,
          msg: "Já existe uma subcategoria com este código",
          data: subcategoriaExistente,
        });
      }

  



      } catch (error) {
        return res.status(500).json({ msg: "Erro interno ao processar a criação da subcategoria"});
      }


    }




}

export default categoriaSchema