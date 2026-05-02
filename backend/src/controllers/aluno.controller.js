import { db } from "../services/database.js";
import { randomUUID } from "crypto";

// aluno.controller.js - VERSÃO MELHORADA
export function criarAluno(req, res) {
  const { nome, trilhaId } = req.body;
  
  // Validação básica
  if (!nome || !trilhaId) {
    return res.status(400).json({ 
      error: "Os campos 'nome' e 'trilhaId' são obrigatórios" 
    });
  }
  
  const aluno = {
    id: randomUUID(),
    nome,
    trilhaId
  };
  
  db.alunos.push(aluno);
  res.status(201).json(aluno);
}