import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./src/routes/health.routes.js";
import trilhaRoutes from "./src/routes/trilha.routes.js";
import alunoRoutes from "./src/routes/aluno.routes.js";
import atividadeRoutes from "./src/routes/atividade.routes.js";
import entregaRoutes from "./src/routes/entrega.routes.js";
import rankingRoutes from "./src/routes/ranking.routes.js";
import estatisticasRoutes from "./src/routes/estatisticas.routes.js";
import authRoutes from './src/routes/auth.routes.js';
import relatorioRoutes from './src/routes/relatorio.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROTAS 
app.use("/health", healthRoutes);
app.use("/trilhas", trilhaRoutes);
app.use("/alunos", alunoRoutes);
app.use("/atividades", atividadeRoutes); 
app.use("/entregas", entregaRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/estatisticas", estatisticasRoutes);
app.use('/auth', authRoutes);
app.use('/relatorios', relatorioRoutes);

app.get("/", (req, res) => {
  res.send("API PodeCrer rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/trilhas`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/alunos`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/atividades`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/entregas`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/ranking`);
  console.log(`📍 Ranking: http://localhost:${PORT}/ranking/trilha/{id}`);
  console.log(`📍 Estatísticas: http://localhost:${PORT}/estatisticas/trilha/{id}`);
  console.log(`📍 Trilhas: http://localhost:${PORT}/estatisticas`);
   console.log(`📍 Trilhas: http://localhost:${PORT}/relatorios`);
});