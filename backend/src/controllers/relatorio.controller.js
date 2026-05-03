// src/controllers/relatorio.controller.js
import GoogleDocsService from '../services/googleDocs.service.js';
import GoogleAuthService from '../services/google.auth.service.js';
import RankingEngine from '../engines/ranking.engine.js';
import EstatisticasService from '../services/estatisticas.service.js';
import { db } from '../database/memory.db.js';

let googleDocsService = null;
let rankingEngine = null;
let estatisticasService = null;

// Inicializar serviços
async function initServices() {
  const authService = new GoogleAuthService();
  await authService.authorize();
  googleDocsService = new GoogleDocsService(authService.getAuth());
  rankingEngine = new RankingEngine(db);
  estatisticasService = new EstatisticasService(db);
}

initServices();

// Gerar relatório individual
export async function gerarRelatorioAluno(req, res) {
  const { trilhaId, alunoId } = req.params;
  
  try {
    // Buscar dados
    const trilha = db.trilhas.find(t => t.id === trilhaId);
    const aluno = db.alunos.find(a => a.id === alunoId);
    const atividades = db.atividades.filter(a => a.trilhaId === trilhaId);
    const entregas = db.entreges.filter(e => e.alunoId === alunoId);
    
    // Calcular ranking e estatísticas
    const ranking = rankingEngine.calcularRanking(trilhaId);
    const estatisticas = estatisticasService.calcularEstatisticasCompletas(trilhaId);
    const estatisticasAluno = estatisticas.porAluno.find(a => a.alunoId === alunoId);
    const posicaoAluno = ranking.ranking.find(r => r.alunoId === alunoId);
    
    // Gerar relatório
    const relatorio = await googleDocsService.criarRelatorioAluno(
      trilha, aluno, atividades, entregas, posicaoAluno, estatisticasAluno
    );
    
    res.json({
      message: 'Relatório gerado com sucesso!',
      relatorio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Gerar relatório da turma
export async function gerarRelatorioTurma(req, res) {
  const { trilhaId } = req.params;
  
  try {
    const trilha = db.trilhas.find(t => t.id === trilhaId);
    const alunos = db.alunos.filter(a => a.trilhaId === trilhaId);
    const atividades = db.atividades.filter(a => a.trilhaId === trilhaId);
    const entregas = db.entreges.filter(e => e.trilhaId === trilhaId);
    
    const ranking = rankingEngine.calcularRanking(trilhaId);
    const estatisticas = estatisticasService.calcularEstatisticasCompletas(trilhaId);
    
    const relatorio = await googleDocsService.criarRelatorioTurma(
      trilha, alunos, atividades, entregas, ranking.ranking, estatisticas
    );
    
    res.json({
      message: 'Relatório da turma gerado com sucesso!',
      relatorio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Gerar certificado
export async function gerarCertificado(req, res) {
  const { trilhaId, alunoId } = req.params;
  
  try {
    const trilha = db.trilhas.find(t => t.id === trilhaId);
    const aluno = db.alunos.find(a => a.id === alunoId);
    
    const estatisticas = estatisticasService.calcularEstatisticasCompletas(trilhaId);
    const estatisticasAluno = estatisticas.porAluno.find(a => a.alunoId === alunoId);
    
    if (parseFloat(estatisticasAluno.percentualConclusao) < 70) {
      return res.status(400).json({ 
        error: 'Aluno não atingiu 70% de conclusão para receber certificado',
        percentual: estatisticasAluno.percentualConclusao
      });
    }
    
    const certificado = await googleDocsService.criarCertificado(
      trilha, aluno, estatisticasAluno.percentualConclusao
    );
    
    res.json({
      message: 'Certificado gerado com sucesso!',
      certificado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}