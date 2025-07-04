// controllers/reviewstoreController.ts
import { Request, Response } from 'express';
import ReviewStoreModel from '../models/ReviewStore';
import { Loja } from "../models/loja";
import dotenv from 'dotenv';

dotenv.config();

const reviewstoreController = {
  
  // Registrar nova avaliação da loja
  registerReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { review, authorName, authorImg, authorRole, rating } = req.body;

      const newReview = new ReviewStoreModel({
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
      const { all } = req.query;

      const reviews = await ReviewStoreModel.find(
        all === "true" ? {} : { visible: true }
      ).sort({ createdAt: -1 });

      res.status(200).json({ reviews });
    } catch (error) {
      console.error("Erro ao listar reviews:", error);
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },

  // Atualizar avaliação (visibilidade, texto, estrelas etc)
  updateReview: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const review = await ReviewStoreModel.findById(id);
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

export default reviewstoreController;
