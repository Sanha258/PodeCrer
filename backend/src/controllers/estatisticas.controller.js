// src/controllers/estatisticas.controller.js
import EstatisticasService from "../services/estatisticas.service.js";
import { db } from "../database/memory.db.js";

const estatisticasService = new EstatisticasService(db);

// Buscar estatísticas completas da trilha
export function getEstatisticas(req, res) {
  const { trilhaId } = req.params;
  
  try {
    const estatisticas = estatisticasService.calcularEstatisticasCompletas(trilhaId);
    res.json(estatisticas);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Buscar apenas estatísticas gerais (resumidas)
export function getEstatisticasGerais(req, res) {
  const { trilhaId } = req.params;
  
  try {
    const completas = estatisticasService.calcularEstatisticasCompletas(trilhaId);
    res.json(completas.geral);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}