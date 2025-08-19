// controllers/reviewproductController.ts
import { Request, Response } from 'express';
import ReviewProductModel from '../models/ReviewProduct';
import { Produto } from "../models/product";
import dotenv from 'dotenv';

dotenv.config();

const reviewproductController = {
  
  // Registrar nova avaliação da loja
  registerReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { review, authorName, authorImg, authorRole, rating,productId } = req.body;

      // Validação básica
      if (!review || !authorName || !authorRole || rating === undefined) {
        res.status(400).json({ msg: "Todos os campos são obrigatórios." });
        return;
      }
      if (rating < 1 || rating > 5) {
        res.status(400).json({ msg: "A avaliação deve ser entre 1 e 5 estrelas." });
        return;
      }
      // Verifica se o produto existe
      if (productId) {
        const product = await Produto.findById(productId);
        if (!product) {
          res.status(404).json({ msg: "Produto não encontrado." });
          return;
        }
      }


      const newReview = new ReviewProductModel({
        productId, // opcional, se for uma avaliação de produto
        review,
        authorName,
        authorImg,
        authorRole,
        rating,
        visible: true, // começa como não visível até aprovar
      });

      await newReview.save();

      res.status(201).json({
        msg: "Avaliação registrada com sucesso e está aguardando aprovação!",
        review: newReview,
      });
    } catch (error) {
      console.error("Erro ao registrar review:", error);
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },

  // Listar avaliações (visíveis por padrão)
  listReviews: async (req: Request, res: Response): Promise<void> => {
    try {
     
      const id = req.params.id;
      

      const reviews = await ReviewProductModel.find({productId: id })
        .sort({ createdAt: -1 }) // Ordenar por data de criação, do mais recente para o mais antigo

      res.status(200).json({ reviews });
    } catch (error) {
     /*  console.error("Erro ao listar reviews:", error); */
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },

  // Atualizar avaliação (visibilidade, texto, estrelas etc)
  updateReview: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const review = await ReviewProductModel.findById(id);
      if (!review) {
        res.status(404).json({ msg: "Avaliação não encontrada." });
        return;
      }

      const { review: reviewText, authorName, authorImg, authorRole, rating, visible } = req.body;

      if (reviewText) review.review = reviewText;
      if (authorName) review.authorName = authorName;
      if (authorImg) review.authorImg = authorImg;
      if (authorRole) review.authorRole = authorRole;
      if (rating !== undefined) review.rating = rating;
      if (visible !== undefined) review.visible = visible;

      await review.save();

      res.status(200).json({ msg: "Avaliação atualizada com sucesso!", review });
    } catch (error) {
      console.error("Erro ao atualizar review:", error);
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
};

export default reviewproductController;
