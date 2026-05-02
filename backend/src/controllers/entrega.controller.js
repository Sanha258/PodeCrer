// src/controllers/entrega.controller.js
import { db } from "../database/memory.db.js"
import { Entrega } from "../models/Entrega.js";

// Registrar entrega validada (EVENTO PRINCIPAL)
export function registrarEntrega(req, res) {
  const { trilhaId, alunoId, atividadeId, professorId, nota } = req.body;

  // Validação
  if (!trilhaId || !alunoId || !atividadeId || !professorId) {
    return res.status(400).json({ 
      error: "Os campos 'trilhaId', 'alunoId', 'atividadeId' e 'professorId' são obrigatórios" 
    });
  }

  // Verificar se a trilha existe
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }

  // Verificar se o aluno existe e pertence à trilha
  const aluno = db.alunos.find(a => a.id === alunoId && a.trilhaId === trilhaId);
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado ou não pertence à trilha" });
  }

  // Verificar se a atividade existe e pertence à trilha
  const atividade = db.atividades.find(a => a.id === atividadeId && a.trilhaId === trilhaId);
  if (!atividade) {
    return res.status(404).json({ error: "Atividade não encontrada ou não pertence à trilha" });
  }

  // Verificar se já existe entrega para esta atividade pelo aluno
  const entregaExistente = db.entreges.find(e => 
    e.alunoId === alunoId && e.atividadeId === atividadeId
  );

  if (entregaExistente) {
    return res.status(400).json({ 
      error: "Aluno já possui entrega registrada para esta atividade",
      entrega: entregaExistente.toJSON()
    });
  }

  // Criar entrega usando a model
  const entrega = new Entrega(trilhaId, alunoId, atividadeId, professorId, nota || null);
  
  // Armazenar no banco em memória
  db.entreges.push(entrega);
  
  // TODO: Aqui vamos disparar os eventos:
  // 1. Recalcular ranking
  // 2. Atualizar estatísticas
  // 3. Sincronizar com Google Sheets
  // 4. Gerar relatórios se necessário
  
  res.status(201).json({
    message: "✅ Entrega validada com sucesso!",
    entrega: entrega.toJSON(),
    // Por enquanto retorna informação básica
    info: {
      aluno: aluno.nome,
      atividade: atividade.nome,
      pontos: entrega.getPontos(atividade)
    }
  });
}

// Listar entregas de uma trilha
export function listarEntregasPorTrilha(req, res) {
  const { trilhaId } = req.params;
  
  const trilha = db.trilhas.find(t => t.id === trilhaId);
  if (!trilha) {
    return res.status(404).json({ error: "Trilha não encontrada" });
  }
  
  const entregas = db.entreges
    .filter(e => e.trilhaId === trilhaId)
    .map(e => {
      const aluno = db.alunos.find(a => a.id === e.alunoId);
      const atividade = db.atividades.find(a => a.id === e.atividadeId);
      return {
        ...e.toJSON(),
        alunoNome: aluno?.nome,
        atividadeNome: atividade?.nome,
        pontos: atividade ? e.getPontos(atividade) : 0
      };
    });
  
  res.json({
    trilhaId,
    trilhaNome: trilha.nome,
    total: entregas.length,
    entregas
  });
}

// Listar entregas de um aluno específico
export function listarEntregasPorAluno(req, res) {
  const { alunoId } = req.params;
  
  const aluno = db.alunos.find(a => a.id === alunoId);
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  
  const entregas = db.entreges
    .filter(e => e.alunoId === alunoId)
    .map(e => {
      const atividade = db.atividades.find(a => a.id === e.atividadeId);
      return {
        ...e.toJSON(),
        atividadeNome: atividade?.nome,
        pontos: atividade ? e.getPontos(atividade) : 0
      };
    });
  
  res.json({
    aluno: aluno.nome,
    trilhaId: aluno.trilhaId,
    total: entregas.length,
    entregas
  });
}

// Verificar se aluno já entregou uma atividade específica
export function verificarEntrega(req, res) {
  const { alunoId, atividadeId } = req.params;
  
  const entrega = db.entreges.find(e => 
    e.alunoId === alunoId && e.atividadeId === atividadeId
  );
  
  res.json({
    entregue: !!entrega,
    entrega: entrega ? entrega.toJSON() : null
  });
}

// Remover entrega (caso professor queira desfazer)
export function removerEntrega(req, res) {
  const { id } = req.params;
  
  const entrega = db.entreges.find(e => e.id === id);
  if (!entrega) {
    return res.status(404).json({ error: "Entrega não encontrada" });
  }
  
  const index = db.entreges.findIndex(e => e.id === id);
  db.entreges.splice(index, 1);
  
  res.json({ 
    message: "Entrega removida com sucesso!",
    // TODO: Recalcular ranking e estatísticas
  });
}