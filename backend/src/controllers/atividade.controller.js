// src/controllers/atividade.controller.js
import { db } from "../../database/memory.db.js"
import { Atividade } from "../models/Atividade.js";

// Criar nova atividade dentro de uma trilha
export function criarAtividade(req, res) {
  const { nome, trilhaId, descricao, pontosMaximos, ordem } = req.body;

  // Validação
  if (!nome || !trilhaId) {
    return res.status(400).json({ 
      error: "Os campos 'nome' e 'trilhaId' são obrigatórios" 
    });
  }

  // Verificar se a trilha existe
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }

  // Criar atividade usando a model
  const atividade = new Atividade(
    nome, 
    trilhaId, 
    descricao || "", 
    pontosMaximos || 10, 
    ordem || trilha.atividades.length + 1
  );
  
  // Armazenar no banco em memória
  db.atividades.push(atividade);
  
  // Adicionar atividade à trilha
  trilha.adicionarAtividade(atividade.id);
  
  res.status(201).json({
    message: "Atividade criada com sucesso!",
    atividade: atividade.toJSON()
  });
}

// Listar atividades de uma trilha específica
export function listarAtividadesPorTrilha(req, res) {
  const { trilhaId } = req.params;
  
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  const atividades = db.atividades
    .filter(a => a.trilhaId === trilhaId && a.ativa === true)
    .sort((a, b) => a.ordem - b.ordem)
    .map(a => a.toJSON());
  
  res.json({
    trilhaId,
    trilhaNome: trilha.nome,
    total: atividades.length,
    atividades
  });
}

// Buscar atividade por ID
export function buscarAtividadePorId(req, res) {
  const { id } = req.params;
  
  const atividade = db.atividades.find(a => a.id === id);
  
  if (!atividade) {
    return res.status(404).json({ error: "Atividade não encontrada" });
  }
  
  res.json(atividade.toJSON());
}

// Atualizar atividade
export function atualizarAtividade(req, res) {
  const { id } = req.params;
  const { nome, descricao, pontosMaximos, ordem, ativa } = req.body;
  
  const atividade = db.atividades.find(a => a.id === id);
  
  if (!atividade) {
    return res.status(404).json({ error: "Atividade não encontrada" });
  }
  
  if (nome) atividade.nome = nome;
  if (descricao) atividade.descricao = descricao;
  if (pontosMaximos) atividade.pontosMaximos = pontosMaximos;
  if (ordem) atividade.ordem = ordem;
  if (ativa !== undefined) atividade.ativa = ativa;
  
  res.json({
    message: "Atividade atualizada com sucesso!",
    atividade: atividade.toJSON()
  });
}

// Remover atividade
export function removerAtividade(req, res) {
  const { id } = req.params;
  
  const atividade = db.atividades.find(a => a.id === id);
  if (!atividade) {
    return res.status(404).json({ error: "Atividade não encontrada" });
  }
  
  // Remover atividade da trilha
  const trilha = db.trilhas.find(t => t.id === atividade.trilhaId);
  if (trilha) {
    trilha.atividades = trilha.atividades.filter(atividadeId => atividadeId !== id);
  }
  
  // Remover entregas relacionadas
  db.entreges = db.entreges.filter(e => e.atividadeId !== id);
  
  // Remover atividade do banco
  const index = db.atividades.findIndex(a => a.id === id);
  db.atividades.splice(index, 1);
  
  res.json({ message: "Atividade removida com sucesso!" });
}