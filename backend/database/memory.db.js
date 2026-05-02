// src/services/database.js
import { Trilha } from "../src/models/Trilha.js";
import { Aluno } from "../src/models/Aluno.js";
import { Atividade } from "../src/models/Atividade.js";
import { Entrega } from "../src/models/Entrega.js";

// Banco em memória (temporário para testes)
export const db = {
  trilhas: [],
  alunos: [],
  atividades: [],
  entreges: []
};

// Funções auxiliares para buscar dados
export function findTrilhaById(id) {
  return db.trilhas.find(t => t.id === id);
}

export function findAlunoById(id) {
  return db.alunos.find(a => a.id === id);
}

export function findAtividadeById(id) {
  return db.atividades.find(a => a.id === id);
}

export function findEntregasByAluno(alunoId) {
  return db.entreges.filter(e => e.alunoId === alunoId);
}

export function findEntregasByTrilha(trilhaId) {
  return db.entreges.filter(e => e.trilhaId === trilhaId);
}

export function findEntregasByAtividade(atividadeId) {
  return db.entreges.filter(e => e.atividadeId === atividadeId);
}