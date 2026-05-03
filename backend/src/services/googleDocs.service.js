// src/services/googleDocs.service.js
import { google } from 'googleapis';
import fs from 'fs';

export class GoogleDocsService {
  constructor(auth) {
    this.docs = google.docs({ version: 'v1', auth });
    this.drive = google.drive({ version: 'v3', auth });
    this.auth = auth;
  }

  /**
   * Criar relatório individual do aluno
   */
  async criarRelatorioAluno(trilha, aluno, atividades, entregas, ranking, estatisticasAluno) {
    const titulo = `Relatório Individual - ${aluno.nome} - ${trilha.nome}`;
    
    // Criar novo documento
    const doc = await this.docs.documents.create({
      requestBody: {
        title: titulo
      }
    });

    const docId = doc.data.documentId;
    
    // Conteúdo do relatório
    const requests = this._montarRelatorioAluno(trilha, aluno, atividades, entregas, ranking, estatisticasAluno);
    
    await this.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests }
    });

    // Converter para PDF
    const pdfUrl = await this._exportarParaPDF(docId, `${titulo}.pdf`);
    
    return {
      documentId: docId,
      pdfUrl,
      title: titulo
    };
  }

  /**
   * Montar conteúdo do relatório do aluno
   */
  _montarRelatorioAluno(trilha, aluno, atividades, entregas, ranking, estatisticasAluno) {
    const requests = [
      // Título principal
      {
        insertText: {
          location: { index: 1 },
          text: `RELATÓRIO INDIVIDUAL - PODE CRER\n\n`
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 30 },
          paragraphStyle: {
            namedStyleType: 'HEADING_1',
            alignment: 'CENTER'
          },
          fields: 'namedStyleType,alignment'
        }
      },
      // Info do aluno
      {
        insertText: {
          location: { index: 1 },
          text: `DADOS DO ALUNO\n`
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 20 },
          paragraphStyle: { namedStyleType: 'HEADING_2' },
          fields: 'namedStyleType'
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Nome: ${aluno.nome}\nEmail: ${aluno.email}\nMatrícula: ${aluno.matriculadoEm}\n\n`
        }
      },
      // Dados da trilha
      {
        insertText: {
          location: { index: 1 },
          text: `DADOS DA TRILHA\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Trilha: ${trilha.nome}\nStatus: ${aluno.ativo ? 'Ativo' : 'Inativo'}\n\n`
        }
      },
      // Desempenho
      {
        insertText: {
          location: { index: 1 },
          text: `DESEMPENHO ACADÊMICO\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Posição no Ranking: ${ranking.posicao}º lugar\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Total de Entregas: ${estatisticasAluno.totalEntregas} de ${atividades.length}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Taxa de Conclusão: ${estatisticasAluno.percentualConclusao}%\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Pontuação Total: ${estatisticasAluno.pontuacaoTotal} pontos\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Média por Atividade: ${estatisticasAluno.mediaPorAtividade}\n\n`
        }
      },
      // Atividades
      {
        insertText: {
          location: { index: 1 },
          text: `ATIVIDADES REALIZADAS\n`
        }
      }
    ];

    // Adicionar lista de atividades
    let index = 1;
    atividades.forEach((atividade, i) => {
      const entrega = entregas.find(e => e.atividadeId === atividade.id);
      const status = entrega ? '✅ Concluída' : '⏳ Pendente';
      const nota = entrega ? (entrega.nota || atividade.pontosMaximos) : '-';
      
      requests.push({
        insertText: {
          location: { index },
          text: `${i + 1}. ${atividade.nome} - ${status} (Nota: ${nota}/${atividade.pontosMaximos})\n`
        }
      });
    });

    // Conclusão
    requests.push(
      {
        insertText: {
          location: { index: 1 },
          text: `\nCONCLUSÃO\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: this._gerarConclusao(estatisticasAluno.percentualConclusao)
        }
      }
    );

    return requests;
  }

  /**
   * Gerar conclusão automática baseada no desempenho
   */
  _gerarConclusao(percentual) {
    if (percentual >= 90) {
      return `Parabéns! O aluno teve um desempenho EXCELENTE na trilha, demonstrando domínio completo dos conteúdos. Recomenda-se certificado de mérito.`;
    } else if (percentual >= 70) {
      return `O aluno teve um desempenho BOM, cumprindo a maioria das atividades. Continue incentivando a participação nas próximas trilhas.`;
    } else if (percentual >= 50) {
      return `O aluno está em DESENVOLVIMENTO. Recomenda-se reforço em alguns tópicos para melhorar o aproveitamento.`;
    } else {
      return `O aluno precisa de ATENÇÃO ESPECIAL. Considere estratégias adicionais para engajar o aluno nas atividades.`;
    }
  }

  /**
   * Criar relatório da turma
   */
  async criarRelatorioTurma(trilha, alunos, atividades, entregas, ranking, estatisticas) {
    const titulo = `Relatório da Turma - ${trilha.nome}`;
    
    const doc = await this.docs.documents.create({
      requestBody: { title: titulo }
    });

    const docId = doc.data.documentId;
    
    const requests = this._montarRelatorioTurma(trilha, alunos, atividades, entregas, ranking, estatisticas);
    
    await this.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests }
    });

    const pdfUrl = await this._exportarParaPDF(docId, `${titulo}.pdf`);
    
    return {
      documentId: docId,
      pdfUrl,
      title: titulo
    };
  }

  /**
   * Montar relatório da turma
   */
  _montarRelatorioTurma(trilha, alunos, atividades, entregas, ranking, estatisticas) {
    const requests = [
      {
        insertText: {
          location: { index: 1 },
          text: `RELATÓRIO DA TURMA - ${trilha.nome.toUpperCase()}\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `RESUMO GERAL\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Total de Alunos: ${estatisticas.geral.totalAlunos}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Total de Atividades: ${estatisticas.geral.totalAtividades}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Total de Entregas: ${estatisticas.geral.totalEntregas}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Taxa de Conclusão Geral: ${estatisticas.geral.taxaConclusaoGeral}%\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Índice de Engajamento: ${estatisticas.engajamento.indiceEngajamento}%\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `TOP 3 RANKING\n`
        }
      }
    ];

    // Adicionar top 3
    ranking.slice(0, 3).forEach((aluno, i) => {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: `${i + 1}º - ${aluno.nome} - ${aluno.pontuacaoTotal} pontos\n`
        }
      });
    });

    // Tabela de todos os alunos
    requests.push({
      insertText: {
        location: { index: 1 },
        text: `\n\nLISTA COMPLETA DE ALUNOS\n\n`
      }
    });

    ranking.forEach(aluno => {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: `${aluno.posicao}º - ${aluno.nome} - ${aluno.pontuacaoTotal} pts - ${aluno.taxaConclusao.toFixed(1)}%\n`
        }
      });
    });

    return requests;
  }

  /**
   * Criar certificado de conclusão
   */
  async criarCertificado(trilha, aluno, percentualConclusao) {
    if (percentualConclusao < 70) {
      throw new Error('Aluno não atingiu 70% de conclusão para certificado');
    }

    const titulo = `Certificado - ${aluno.nome} - ${trilha.nome}`;
    
    const doc = await this.docs.documents.create({
      requestBody: { title: titulo }
    });

    const docId = doc.data.documentId;
    
    const certificadoTemplate = `
      CERTIFICADO DE CONCLUSÃO\n\n
      O PodeCrer certifica que\n\n
      ${aluno.nome}\n\n
      concluiu com êxito a trilha\n\n
      "${trilha.nome}"\n\n
      com ${percentualConclusao}% de aproveitamento.\n\n
      ${new Date().toLocaleDateString('pt-BR')}\n\n
      ________________________________\n
      Coordenação PodeCrer
    `;

    const requests = [
      {
        insertText: {
          location: { index: 1 },
          text: certificadoTemplate
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 100 },
          paragraphStyle: {
            alignment: 'CENTER',
            spacingAbove: { magnitude: 20, unit: 'PT' }
          },
          fields: 'alignment,spacingAbove'
        }
      }
    ];

    await this.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests }
    });

    const pdfUrl = await this._exportarParaPDF(docId, `${titulo}.pdf`);
    
    return {
      documentId: docId,
      pdfUrl,
      title: titulo
    };
  }

  /**
   * Exportar documento para PDF
   */
  async _exportarParaPDF(documentId, fileName) {
    try {
      const response = await this.drive.files.export(
        {
          fileId: documentId,
          mimeType: 'application/pdf'
        },
        { responseType: 'stream' }
      );

      // Salvar PDF localmente (opcional)
      const pdfPath = `./relatorios/${fileName}`;
      const writer = fs.createWriteStream(pdfPath);
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(pdfPath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return null;
    }
  }
}

export default GoogleDocsService;