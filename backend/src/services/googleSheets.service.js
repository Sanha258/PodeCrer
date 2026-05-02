// src/services/googleSheets.service.js
import { google } from 'googleapis';

/**
 * Serviço de Integração com Google Sheets
 * O Google Sheets vira o BANCO DE DADOS permanente do PodeCrer
 */

export class GoogleSheetsService {
  constructor(auth) {
    this.sheets = google.sheets({ version: 'v4', auth });
    this.sheetId = null;
  }

  /**
   * Inicializar com ID da planilha
   */
  setSheetId(sheetId) {
    this.sheetId = sheetId;
  }

  /**
   * Criar nova planilha para uma trilha
   */
  async criarPlanilhaTrilha(trilhaNome, trilhaId) {
    try {
      // Criar nova planilha
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `📚 PodeCrer - ${trilhaNome}`,
          },
          sheets: [
            {
              properties: {
                title: 'Dashboard',
                gridProperties: { rowCount: 100, columnCount: 20 }
              }
            },
            {
              properties: {
                title: 'Entregas',
                gridProperties: { rowCount: 1000, columnCount: 10 }
              }
            },
            {
              properties: {
                title: 'Alunos',
                gridProperties: { rowCount: 500, columnCount: 10 }
              }
            },
            {
              properties: {
                title: 'Atividades',
                gridProperties: { rowCount: 100, columnCount: 10 }
              }
            },
            {
              properties: {
                title: 'Ranking',
                gridProperties: { rowCount: 500, columnCount: 10 }
              }
            }
          ]
        }
      });

      const spreadsheetId = response.data.spreadsheetId;
      
      // Adicionar metadados da trilha
      await this._adicionarMetadados(spreadsheetId, trilhaId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Erro ao criar planilha:', error);
      throw error;
    }
  }

  /**
   * Sincronizar TODOS os dados da trilha para o Sheets
   */
  async sincronizarTrilhaCompleta(trilha, alunos, atividades, entregas, ranking, estatisticas) {
    if (!this.sheetId) {
      throw new Error("Sheet ID não configurado");
    }

    try {
      // 1. Sincronizar alunos
      await this._sincronizarAlunos(alunos);
      
      // 2. Sincronizar atividades
      await this._sincronizarAtividades(atividades);
      
      // 3. Sincronizar entregas
      await this._sincronizarEntregas(entregas, alunos, atividades);
      
      // 4. Sincronizar dashboard (estatísticas)
      await this._sincronizarDashboard(trilha, estatisticas);
      
      // 5. Sincronizar ranking
      await this._sincronizarRanking(ranking);
      
      console.log(`✅ Planilha ${this.sheetId} sincronizada com sucesso!`);
      
      return { success: true, sheetId: this.sheetId };
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      throw error;
    }
  }

  /**
   * Sincronizar dados dos alunos
   * @private
   */
  async _sincronizarAlunos(alunos) {
    const headers = [['ID', 'Nome', 'Email', 'Matriculado Em', 'Status']];
    const rows = alunos.map(aluno => [
      aluno.id,
      aluno.nome,
      aluno.email,
      aluno.matriculadoEm.toISOString(),
      aluno.ativo ? 'Ativo' : 'Inativo'
    ]);

    const data = [...headers, ...rows];
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: 'Alunos!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data }
    });
  }

  /**
   * Sincronizar dados das atividades
   * @private
   */
  async _sincronizarAtividades(atividades) {
    const headers = [['ID', 'Nome', 'Descrição', 'Pontos Máximos', 'Ordem', 'Criada Em']];
    const rows = atividades.map(atividade => [
      atividade.id,
      atividade.nome,
      atividade.descricao,
      atividade.pontosMaximos,
      atividade.ordem,
      atividade.criadaEm.toISOString()
    ]);

    const data = [...headers, ...rows];
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: 'Atividades!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data }
    });
  }

  /**
   * Sincronizar entregas (O MAIS IMPORTANTE)
   * @private
   */
  async _sincronizarEntregas(entregas, alunos, atividades) {
    const headers = [
      ['ID Entrega', 'Aluno', 'Atividade', 'Nota', 'Validada Em', 'Status', 'Pontos']
    ];
    
    const rows = entregas.map(entrega => {
      const aluno = alunos.find(a => a.id === entrega.alunoId);
      const atividade = atividades.find(a => a.id === entrega.atividadeId);
      const pontos = entrega.nota !== null ? entrega.nota : (atividade?.pontosMaximos || 0);
      
      return [
        entrega.id,
        aluno?.nome || 'N/A',
        atividade?.nome || 'N/A',
        entrega.nota || 'Completo',
        new Date(entrega.validadaEm).toLocaleString('pt-BR'),
        entrega.status,
        pontos
      ];
    });

    const data = [...headers, ...rows];
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: 'Entregas!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data }
    });
  }

  /**
   * Sincronizar dashboard com estatísticas
   * @private
   */
  async _sincronizarDashboard(trilha, estatisticas) {
    const dashboardData = [
      ['📊 DASHBOARD PODE CRER', ''],
      ['', ''],
      ['TRILHA', trilha.nome],
      ['ID Trilha', trilha.id],
      ['Data Atualização', new Date().toLocaleString('pt-BR')],
      ['', ''],
      ['📈 ESTATÍSTICAS GERAIS', ''],
      ['Total Alunos', estatisticas.geral.totalAlunos],
      ['Total Atividades', estatisticas.geral.totalAtividades],
      ['Total Entregas', estatisticas.geral.totalEntregas],
      ['Taxa de Conclusão Geral', `${estatisticas.geral.taxaConclusaoGeral}%`],
      ['Média Entregas por Aluno', estatisticas.geral.mediaEntregasPorAluno],
      ['', ''],
      ['🏆 DESTAQUES', ''],
      ['Aluno Destaque', estatisticas.geral.alunoDestaque?.nome || 'N/A'],
      ['Atividade Destaque', estatisticas.geral.atividadeDestaque?.nome || 'N/A']
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: 'Dashboard!A1',
      valueInputOption: 'RAW',
      requestBody: { values: dashboardData }
    });
  }

  /**
   * Sincronizar ranking
   * @private
   */
  async _sincronizarRanking(ranking) {
    const headers = [
      ['Posição', 'Aluno', 'Total Entregas', 'Pontuação Total', 'Taxa Conclusão', 'Status']
    ];
    
    const rows = ranking.ranking.map(aluno => [
      aluno.posicao,
      aluno.nome,
      aluno.totalEntregas,
      aluno.pontuacaoTotal,
      `${aluno.taxaConclusao.toFixed(1)}%`,
      aluno.posicao === 1 ? '🏆 Líder' : aluno.posicao <= 3 ? '🥇 Top 3' : 'Participante'
    ]);

    const data = [...headers, ...rows];
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: 'Ranking!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data }
    });
  }

  /**
   * Adicionar metadados da trilha
   * @private
   */
  async _adicionarMetadados(spreadsheetId, trilhaId) {
    const response = await this.sheets.spreadsheets.get({ spreadsheetId });
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    return { spreadsheetId, spreadsheetUrl };
  }

  /**
   * Buscar dados da planilha (para cálculos)
   */
  async buscarDadosPlanilha() {
    if (!this.sheetId) {
      throw new Error("Sheet ID não configurado");
    }

    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.sheetId,
      ranges: ['Alunos!A2:E', 'Atividades!A2:F', 'Entregas!A2:G']
    });

    return {
      alunos: this._parseAlunos(response.data.valueRanges[0]?.values || []),
      atividades: this._parseAtividades(response.data.valueRanges[1]?.values || []),
      entregas: this._parseEntregas(response.data.valueRanges[2]?.values || [])
    };
  }

  /**
   * Parse dados dos alunos
   * @private
   */
  _parseAlunos(rows) {
    return rows.map(row => ({
      id: row[0],
      nome: row[1],
      email: row[2],
      matriculadoEm: new Date(row[3]),
      ativo: row[4] === 'Ativo'
    }));
  }

  /**
   * Parse dados das atividades
   * @private
   */
  _parseAtividades(rows) {
    return rows.map(row => ({
      id: row[0],
      nome: row[1],
      descricao: row[2],
      pontosMaximos: parseInt(row[3]),
      ordem: parseInt(row[4]),
      criadaEm: new Date(row[5])
    }));
  }

  /**
   * Parse dados das entregas
   * @private
   */
  _parseEntregas(rows) {
    return rows.map(row => ({
      id: row[0],
      alunoId: row[1], // Nota: idealmente teria ID, não nome
      atividadeId: row[2],
      nota: row[3] === 'Completo' ? null : parseFloat(row[3]),
      validadaEm: new Date(row[4]),
      status: row[5]
    }));
  }
}

export default GoogleSheetsService;