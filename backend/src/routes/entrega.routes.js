// src/routes/entrega.routes.js
import { Router } from "express";
import { 
  registrarEntrega,
  listarEntregasPorTrilha,
  listarEntregasPorAluno,
  verificarEntrega,
  removerEntrega
} from "../controllers/entrega.controller.js";

const router = Router();

router.post("/", registrarEntrega);
router.get("/trilha/:trilhaId", listarEntregasPorTrilha);
router.get("/aluno/:alunoId", listarEntregasPorAluno);
router.get("/verificar/:alunoId/:atividadeId", verificarEntrega);
router.delete("/:id", removerEntrega);

export default router;