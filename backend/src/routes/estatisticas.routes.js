// src/routes/estatisticas.routes.js
import { Router } from "express";
import { getEstatisticas, getEstatisticasGerais } from "../controllers/estatisticas.controller.js";

const router = Router();

router.get("/trilha/:trilhaId", getEstatisticas);
router.get("/trilha/:trilhaId/resumo", getEstatisticasGerais);

export default router;