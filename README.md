# PodeCrer 🎓📊

Plataforma educacional para **gestão de Trilhas de Aprendizagem**, onde professores podem:

- Criar **Trilhas** (ex: *Trilha 2 — Pensamento Computacional*)
- Cadastrar alunos
- Propor atividades
- Validar entregas
- Visualizar **ranking automático**
- Acompanhar **estatísticas individuais e gerais**
- Exportar relatórios em PDF e planilhas
- Integrar totalmente com ferramentas do Google Workspace

---

## 🧱 Arquitetura do Projeto

PodeCrer/
 ├─ frontend/      → React + Vite
 ├─ backend/       → Node.js + Express
 └─ docker-compose.yml

A aplicação roda 100% em containers Docker.

---

## 🚀 Tecnologias

### Frontend
- React
- Vite
- HTML, CSS, JavaScript

### Backend
- Node.js
- Express

### Integrações Planejadas
- Login com Google (e-mail institucional do professor)
- Google Sheets (planilhas automáticas)
- Google Docs (relatórios PDF personalizados)
- Looker Studio (dashboards de desempenho)

Sem uso de banco de dados tradicional. Os dados serão persistidos no ecossistema Google.

---

## ✅ Pré-requisitos

Instalar o Docker Desktop.

Verificar:

docker --version
docker compose version

---

## ▶️ Como rodar o projeto com Docker (recomendado)

### 1) Clonar o repositório

git clone https://github.com/Sanha258/PodeCrer.git
cd PodeCrer

### 2) Subir os containers

docker compose up --build

### 3) Acessar a aplicação

Frontend:
http://localhost:5173

Backend (health check):
http://localhost:3000/health

Se aparecer:

{ "status": "API running ✅" }

Está funcionando corretamente.

---

## 🧪 Parar a aplicação

docker compose down

---

## 🔁 Rodar novamente (sem rebuild)

docker compose up

---

## 🛠️ Rodar sem Docker (modo desenvolvimento)

### Frontend

cd frontend
npm install
npm run dev

### Backend

cd backend
npm install
npm run dev

---

## 📂 Estrutura do Projeto

frontend/
 ├─ src/
 │   ├─ pages/
 │   ├─ components/
 │   ├─ services/
 │   └─ App.jsx

backend/
 ├─ src/
 │   ├─ controllers/
 │   ├─ routes/
 │   ├─ services/
 │   ├─ middlewares/
 │   └─ app.js
 └─ server.js

---

## 🔗 Comunicação Frontend ↔ Backend

Dentro do Docker:
http://backend:3000

Fora do Docker:
http://localhost:3000

---

## 🔐 Variáveis de ambiente (backend/.env)

PORT=3000

---

## 👨🏽‍🏫 Público-alvo

Professores que desejam acompanhar o desempenho dos alunos por trilhas de aprendizagem de forma visual, automática e integrada ao Google Workspace.

---

## 📌 Status do Projeto

🚧 Em desenvolvimento — arquitetura base pronta.

---

## 🤝 Contribuição

1. Criar uma branch
2. Commitar
3. Abrir Pull Request

---

## 📄 Licença

MIT