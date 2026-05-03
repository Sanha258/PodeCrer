// src/routes/relatorio.routes.js
import { Router } from 'express';
import { 
  gerarRelatorioAluno, 
  gerarRelatorioTurma, 
  gerarCertificado 
} from '../controllers/relatorio.controller.js';

const router = Router();

router.get('/aluno/:trilhaId/:alunoId', gerarRelatorioAluno);
router.get('/turma/:trilhaId', gerarRelatorioTurma);
router.get('/certificado/:trilhaId/:alunoId', gerarCertificado);

export default router;