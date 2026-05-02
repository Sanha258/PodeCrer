import { db } from "../services/database.js";
import { randomUUID } from "crypto";

export function criarTrilha(req, res) {
  const { nome } = req.body;

  const trilha = {
    id: randomUUID(),
    nome
  };

  db.trilhas.push(trilha);
  res.status(201).json(trilha);
}

export function listarTrilhas(req, res) {
  res.json(db.trilhas);
}