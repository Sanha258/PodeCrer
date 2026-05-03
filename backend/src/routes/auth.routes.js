// src/routes/auth.routes.js
import { Router } from 'express';
import GoogleAuthService from '../services/google.auth.service.js';

const router = Router();
const authService = new GoogleAuthService();

// Inicializar auth
await authService.authorize();

// Iniciar autenticação
router.get('/google', (req, res) => {
  const authUrl = authService.getAuthUrl();
  if (authUrl) {
    res.redirect(authUrl);
  } else {
    res.status(500).json({ error: 'Erro ao gerar URL de autenticação' });
  }
});

// Callback do OAuth
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido' });
  }
  
  try {
    await authService.setCredentials(code);
    res.json({ 
      message: '✅ Autenticado com Google com sucesso!',
      status: 'authenticated'
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar status
router.get('/google/status', (req, res) => {
  res.json({ 
    authenticated: authService.isAuthenticated(),
    message: authService.isAuthenticated() ? 
      '✅ Autenticado' : '❌ Não autenticado. Acesse /auth/google'
  });
});

export default router;