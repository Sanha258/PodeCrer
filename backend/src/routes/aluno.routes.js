// src/routes/aluno.routes.js
import { Router } from "express";
import { 
  criarAluno, 
  listarAlunosPorTrilha,
  buscarAlunoPorId,
  atualizarAluno,
  removerAluno
} from "../controllers/aluno.controller.js";

const router = Router();

router.post("/", criarAluno);
router.get("/trilha/:trilhaId", listarAlunosPorTrilha);
router.get("/:id", buscarAlunoPorId);
router.put("/:id", atualizarAluno);
router.delete("/:id", removerAluno);

export default router;