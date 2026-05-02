// src/controllers/aluno.controller.js
import { db } from "../database/memory.db.js";
import { Aluno } from "../models/Aluno.js";

// Criar novo aluno (vinculado a uma trilha)
export function criarAluno(req, res) {
  const { nome, email, trilhaId } = req.body;

  // Validação
  if (!nome || !email || !trilhaId) {
    return res.status(400).json({ 
      error: "Os campos 'nome', 'email' e 'trilhaId' são obrigatórios" 
    });
  }

  // Verificar se a trilha existe
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }

  // Verificar se email já existe na trilha
  const alunoExistente = db.alunos.find(a => a.email === email && a.trilhaId === trilhaId);
  if (alunoExistente) {
    return res.status(400).json({ error: "Aluno já cadastrado nesta trilha" });
  }

  // Criar aluno usando a model
  const aluno = new Aluno(nome, email, trilhaId);
  
  // Armazenar no banco em memória
  db.alunos.push(aluno);
  
  // Adicionar aluno à trilha
  trilha.adicionarAluno(aluno.id);
  
  res.status(201).json({
    message: "Aluno criado com sucesso!",
    aluno: aluno.toJSON()
  });
}

// Listar alunos de uma trilha específica
export function listarAlunosPorTrilha(req, res) {
  const { trilhaId } = req.params;
  
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  const alunos = db.alunos
    .filter(a => a.trilhaId === trilhaId)
    .map(a => a.toJSON());
  
  res.json({
    trilhaId,
    trilhaNome: trilha.nome,
    total: alunos.length,
    alunos
  });
}

// Buscar aluno por ID
export function buscarAlunoPorId(req, res) {
  const { id } = req.params;
  
  const aluno = db.alunos.find(a => a.id === id);
  
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  
  res.json(aluno.toJSON());
}

// Atualizar aluno
export function atualizarAluno(req, res) {
  const { id } = req.params;
  const { nome, email, ativo } = req.body;
  
  const aluno = db.alunos.find(a => a.id === id);
  
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  
  if (nome) aluno.nome = nome;
  if (email) aluno.email = email;
  if (ativo !== undefined) aluno.ativo = ativo;
  
  res.json({
    message: "Aluno atualizado com sucesso!",
    aluno: aluno.toJSON()
  });
}

// Remover aluno
export function removerAluno(req, res) {
  const { id } = req.params;
  
  const aluno = db.alunos.find(a => a.id === id);
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  
  // Remover aluno da trilha
  const trilha = db.trilhas.find(t => t.id === aluno.trilhaId);
  if (trilha) {
    trilha.alunos = trilha.alunos.filter(alunoId => alunoId !== id);
  }
  
  // Remover aluno do banco
  const index = db.alunos.findIndex(a => a.id === id);
  db.alunos.splice(index, 1);
  
  res.json({ message: "Aluno removido com sucesso!" });
}