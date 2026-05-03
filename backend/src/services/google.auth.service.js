
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GoogleAuthService {
  constructor() {
    this.SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents'
    ];
    this.TOKEN_PATH = path.join(__dirname, '../../token.json');
    this.CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
    this.auth = null;
  }

  async loadSavedCredentials() {
    try {
      if (fs.existsSync(this.TOKEN_PATH)) {
        const content = fs.readFileSync(this.TOKEN_PATH, 'utf8');
        const credentials = JSON.parse(content);
        console.log('✅ Credenciais carregadas do arquivo token.json');
        return google.auth.fromJSON(credentials);
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar credenciais:', err);
      return null;
    }
  }

  async saveCredentials(client) {
    try {
      const content = fs.readFileSync(this.CREDENTIALS_PATH, 'utf8');
      const keys = JSON.parse(content);
      const key = keys.web || keys.installed;
      
      const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
      });
      
      fs.writeFileSync(this.TOKEN_PATH, payload);
      console.log('✅ Credenciais salvas em token.json');
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  }

  async authorize() {
    console.log('🔑 Iniciando autenticação com Google...');
    
    let client = await this.loadSavedCredentials();
    if (client) {
      this.auth = client;
      return client;
    }

    // Criar cliente OAuth2
    const content = fs.readFileSync(this.CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.web || keys.installed;
    
    const oAuth2Client = new google.auth.OAuth2(
      key.client_id,
      key.client_secret,
      key.redirect_uris[0]
    );
    
    this.auth = oAuth2Client;
    return oAuth2Client;
  }

  getAuth() {
    return this.auth;
  }

  isAuthenticated() {
    return this.auth !== null && this.auth.credentials;
  }

  // Gerar URL para autenticação
  getAuthUrl() {
    const auth = this.getAuth();
    if (!auth) return null;
    
    return auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent'
    });
  }

  // Trocar código por tokens
  async setCredentials(code) {
    const auth = this.getAuth();
    if (!auth) throw new Error('Cliente OAuth não inicializado');
    
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    await this.saveCredentials(auth);
    return tokens;
  }
}

export default GoogleAuthService;