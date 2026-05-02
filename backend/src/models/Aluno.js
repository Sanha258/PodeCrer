// src/models/Aluno.js
import { randomUUID } from "crypto";

export class Aluno {
  constructor(nome, email, trilhaId) {
    this.id = randomUUID();
    this.nome = nome;
    this.email = email;
    this.trilhaId = trilhaId;
    this.matriculadoEm = new Date();
    this.ativo = true;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      trilhaId: this.trilhaId,
      matriculadoEm: this.matriculadoEm,
      ativo: this.ativo
    };
  }
}