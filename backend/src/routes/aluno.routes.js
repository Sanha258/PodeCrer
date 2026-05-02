import { Router } from "express";
import { criarAluno } from "../controllers/aluno.controller.js";

const router = Router();

router.post("/", criarAluno);

export default router;