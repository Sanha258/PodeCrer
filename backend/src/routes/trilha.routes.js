import { Router } from "express";
import { criarTrilha, listarTrilhas } from "../controllers/trilha.controller.js";

const router = Router();

router.post("/", criarTrilha);
router.get("/", listarTrilhas);

export default router;