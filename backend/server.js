import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./src/routes/health.routes.js";
import alunoRoutes from "./src/routes/aluno.routes.js";
import trilhaRoutes from "./src/routes/trilha.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROTAS - ESTÃO FALTANDO!
app.use("/health", healthRoutes);
app.use("/alunos", alunoRoutes);
app.use("/trilhas", trilhaRoutes);

app.get("/", (req, res) => {
  res.send("API PodeCrer rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/trilhas`);
});