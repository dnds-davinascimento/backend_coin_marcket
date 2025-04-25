import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Categoria } from "../models/categoria";

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
            const lojaId = req.headers.id as string;

            const { nome ,categoriaDestaque,img_url}: CategoriaBody = req.body;

           
        
            // Validações básicas
            if (!nome) {
              return res.status(400).json({
                success: false,
                message: "O campo 'nome' é obrigatório",
              });
            }
        
            // Verificar se a categoria já existe
            const categoriaExistente = await Categoria.findOne({ nome });
            if (categoriaExistente) {
              return res.status(400).json({
                success: false,
                message: "Já existe uma categoria com este nome",
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
              message: "Categoria criada com sucesso",
              data: categoriaSalva,
            });
        
          } catch (error) {
          
            return res.status(500).json({
              success: false,
              message: "Erro interno ao processar a criação da categoria",
              error: error instanceof Error ? error.message : "Erro desconhecido",
            });
          }
    },
    /* pegar categorias por loja */
    getByLoja: async (req: Request, res: Response) => {
        try {
            const lojaId = req.headers.id as string;
            
        
            // Verifica se o ID da loja é válido
            if (!mongoose.Types.ObjectId.isValid(lojaId)) {
              return res.status(400).json({
                success: false,
                message: "ID de loja inválido",
              });
            }
        
            // Busca as categorias associadas à loja
            const categorias = await Categoria.find({ categoria_da_loja: lojaId });
        
            return res.status(200).json(categorias);
        
          } catch (error) {
           
            return res.status(500).json({
              success: false,
              message: "Erro interno ao processar a busca de categorias",
              error: error instanceof Error ? error.message : "Erro desconhecido",
            });
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
                message: "ID inválido",
              });
            }
        
            // Busca a categoria pelo ID
            const categoria = await Categoria.findById(id);
        
            if (!categoria) {
              return res.status(404).json({
                success: false,
                message: "Categoria não encontrada",
              });
            }
        
            return res.status(200).json(categoria);
        
          } catch (error) {
           
            return res.status(500).json({
              success: false,
              message: "Erro interno ao processar a busca de categoria",
              error: error instanceof Error ? error.message : "Erro desconhecido",
            });
          }
    },
    /* editar por id    */
    updateById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { nome,subcategorias,categoriaDestaque,img_url }: CategoriaBody = req.body;

            /* verificar se exite categoria */
            const categoriaExistente = await Categoria.findById(id);
            if (!categoriaExistente) {
                return res.status(404).json({
                    success: false,
                    message: "Categoria não encontrada",
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
            
            return res.status(500).json({
                success: false,
                message: "Erro interno ao processar a atualização da categoria",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            });
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
                    message: "ID inválido",
                });
            }
        
            // Verifica se a categoria existe
            const categoriaExistente = await Categoria.findById(id);
            if (!categoriaExistente) {
                return res.status(404).json({
                    success: false,
                    message: "Categoria não encontrada",
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
                message: "Categoria deletada com sucesso",
            });
        
        } catch (error) {
           
            return res.status(500).json({
                success: false,
                message: "Erro interno ao processar a deleção da categoria",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            });
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
                    message: "Categoria pai não encontrada",
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
                        message: `ID de subcategoria inválido: ${categoriaId}`,
                    });
                }
                const subcategoria = await Categoria.findById(categoriaId);
                if (!subcategoria) {
                    return res.status(404).json({
                        success: false,
                        message: `Subcategoria não encontrada: ${categoriaId}`,
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
                message: "Subcategorias atualizadas com sucesso"
                
            });


    


    
        } catch (error) {
           
            return res.status(500).json({
                success: false,
                message: "Erro interno ao processar a atualização das subcategorias",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            });
        }
    },
        



}

export default categoriaSchema