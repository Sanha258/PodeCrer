// src/routes/trilha.routes.js
import { Router } from "express";
import { 
  criarTrilha, 
  listarTrilhas, 
  buscarTrilhaPorId,
  atualizarTrilha,
  removerTrilha,
  adicionarAlunoNaTrilha
} from "../controllers/trilha.controller.js";

const router = Router();

router.post("/", criarTrilha);
router.get("/", listarTrilhas);
router.get("/:id", buscarTrilhaPorId);
router.put("/:id", atualizarTrilha);
router.delete("/:id", removerTrilha);
router.post("/:trilhaId/alunos/:alunoId", adicionarAlunoNaTrilha);

export default router;