// src/models/Entrega.js
import { randomUUID } from "crypto";

export class Entrega {
  constructor(trilhaId, alunoId, atividadeId, professorId, nota = null) {
    this.id = randomUUID();
    this.trilhaId = trilhaId;
    this.alunoId = alunoId;
    this.atividadeId = atividadeId;
    this.professorId = professorId;
    this.nota = nota;  // Se null, usa pontosMaximos da atividade
    this.validadaEm = new Date();
    this.status = "VALIDADA";  // VALIDADA, PENDENTE, REPROVADA
  }

  // Calcula pontos efetivos (se nota for null, usa pontos máximos)
  getPontos(atividade) {
    if (this.nota !== null) {
      return this.nota;
    }
    return atividade.pontosMaximos;
  }

  toJSON() {
    return {
      id: this.id,
      trilhaId: this.trilhaId,
      alunoId: this.alunoId,
      atividadeId: this.atividadeId,
      professorId: this.professorId,
      nota: this.nota,
      validadaEm: this.validadaEm,
      status: this.status
    };
  }
}