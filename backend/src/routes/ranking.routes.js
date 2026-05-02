// src/routes/ranking.routes.js
import { Router } from "express";
import { getRanking, getPosicaoAluno } from "../controllers/ranking.controller.js";

const router = Router();

router.get("/trilha/:trilhaId", getRanking);
router.get("/trilha/:trilhaId/aluno/:alunoId", getPosicaoAluno);

export default router;