// src/models/Atividade.js
import { randomUUID } from "crypto";

export class Atividade {
  constructor(nome, trilhaId, descricao = "", pontosMaximos = 10, ordem = 0) {
    this.id = randomUUID();
    this.nome = nome;
    this.descricao = descricao;
    this.trilhaId = trilhaId;
    this.pontosMaximos = pontosMaximos;  // Pontuação máxima desta atividade
    this.ordem = ordem;  // Ordem dentro da trilha (1, 2, 3...)
    this.criadaEm = new Date();
    this.ativa = true;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      trilhaId: this.trilhaId,
      pontosMaximos: this.pontosMaximos,
      ordem: this.ordem,
      criadaEm: this.criadaEm,
      ativa: this.ativa
    };
  }
}