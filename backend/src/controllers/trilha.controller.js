// src/controllers/trilha.controller.js
import { db } from "../database/memory.db.js"
import { Trilha } from "../models/Trilha.js";

// Criar nova trilha
export function criarTrilha(req, res) {
  const { nome, professorId, descricao } = req.body;

  // Validação
  if (!nome || !professorId) {
    return res.status(400).json({ 
      error: "Os campos 'nome' e 'professorId' são obrigatórios" 
    });
  }

  // Criar trilha usando a model
  const trilha = new Trilha(nome, professorId, descricao || "");
  
  // Armazenar no banco em memória
  db.trilhas.push(trilha);
  
  res.status(201).json({
    message: "Trilha criada com sucesso!",
    trilha: trilha.toJSON()
  });
}

// Listar todas as trilhas
export function listarTrilhas(req, res) {
  const trilhas = db.trilhas.map(t => t.toJSON());
  res.json({
    total: trilhas.length,
    trilhas
  });
}

// Buscar trilha por ID
export function buscarTrilhaPorId(req, res) {
  const { id } = req.params;
  
  const trilha = db.trilhas.find(t => t.id === id);
  
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  res.json(trilha.toJSON());
}

// Atualizar trilha
export function atualizarTrilha(req, res) {
  const { id } = req.params;
  const { nome, descricao, ativa } = req.body;
  
  const trilha = db.trilhas.find(t => t.id === id);
  
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  if (nome) trilha.nome = nome;
  if (descricao) trilha.descricao = descricao;
  if (ativa !== undefined) trilha.ativa = ativa;
  
  res.json({
    message: "Trilha atualizada com sucesso!",
    trilha: trilha.toJSON()
  });
}

// Remover trilha (soft delete)
export function removerTrilha(req, res) {
  const { id } = req.params;
  
  const index = db.trilhas.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  db.trilhas.splice(index, 1);
  
  res.json({ message: "Trilha removida com sucesso!" });
}

// Adicionar aluno à trilha
export function adicionarAlunoNaTrilha(req, res) {
  const { trilhaId, alunoId } = req.params;
  
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  const aluno = db.alunos.find(a => a.id === alunoId);
  
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  
  if (aluno.trilhaId !== trilhaId) {
    return res.status(400).json({ error: "Aluno não pertence a esta trilha" });
  }
  
  trilha.adicionarAluno(alunoId);
  
  res.json({
    message: "Aluno adicionado à trilha com sucesso!",
    trilha: trilha.toJSON()
  });
}