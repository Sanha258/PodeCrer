// src/models/Trilha.js
import { randomUUID } from "crypto";

export class Trilha {
  constructor(nome, professorId, descricao = "") {
    this.id = randomUUID();
    this.nome = nome;
    this.descricao = descricao;
    this.professorId = professorId;
    this.alunos = [];      // Array de IDs dos alunos
    this.atividades = [];  // Array de IDs das atividades
    this.googleSheetId = null;  // Será preenchido após integração com Google
    this.criadaEm = new Date();
    this.ativa = true;
  }

  // Método para adicionar aluno
  adicionarAluno(alunoId) {
    if (!this.alunos.includes(alunoId)) {
      this.alunos.push(alunoId);
    }
    return this;
  }

  // Método para adicionar atividade
  adicionarAtividade(atividadeId) {
    if (!this.atividades.includes(atividadeId)) {
      this.atividades.push(atividadeId);
    }
    return this;
  }

  // Método para converter para JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      professorId: this.professorId,
      alunos: this.alunos,
      atividades: this.atividades,
      googleSheetId: this.googleSheetId,
      criadaEm: this.criadaEm,
      ativa: this.ativa
    };
  }
}