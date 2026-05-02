// src/routes/atividade.routes.js
import { Router } from "express";
import { 
  criarAtividade, 
  listarAtividadesPorTrilha,
  buscarAtividadePorId,
  atualizarAtividade,
  removerAtividade
} from "../controllers/atividade.controller.js";

const router = Router();

router.post("/", criarAtividade);
router.get("/trilha/:trilhaId", listarAtividadesPorTrilha);
router.get("/:id", buscarAtividadePorId);
router.put("/:id", atualizarAtividade);
router.delete("/:id", removerAtividade);

export default router;