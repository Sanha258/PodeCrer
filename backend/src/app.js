import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import trilhaRoutes from "./routes/trilha.routes.js";
import alunoRoutes from "./routes/aluno.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/trilhas", trilhaRoutes);
app.use("/alunos", alunoRoutes);

export default app;