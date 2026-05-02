// src/controllers/ranking.controller.js
import RankingEngine from "../engines/ranking.engine.js";
import { db } from "../database/memory.db.js";

const rankingEngine = new RankingEngine(db);

// Buscar ranking completo da trilha
export function getRanking(req, res) {
  const { trilhaId } = req.params;
  
  try {
    const ranking = rankingEngine.calcularRanking(trilhaId);
    res.json(ranking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Buscar posição específica de um aluno
export function getPosicaoAluno(req, res) {
  const { trilhaId, alunoId } = req.params;
  
  try {
    const posicao = rankingEngine.calcularPosicaoAluno(trilhaId, alunoId);
    res.json(posicao);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}