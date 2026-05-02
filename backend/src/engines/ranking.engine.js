// src/engines/ranking.engine.js

/**
 * Motor de Ranking do PodeCrer
 * TODO ranking é calculado dinamicamente, NUNCA armazenado
 * Baseado APENAS nas entregas validadas
 */

export class RankingEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Calcula o ranking completo de uma trilha
   * @param {string} trilhaId - ID da trilha
   * @returns {Object} Ranking e estatísticas da trilha
   */
  calcularRanking(trilhaId) {
    // Buscar dados da trilha
    const trilha = this.db.trilhas.find(t => t.id === trilhaId);
    if (!trilha) {
      throw new Error("Trilha não encontrada");
    }

    // Buscar alunos da trilha
    const alunos = this.db.alunos.filter(a => a.trilhaId === trilhaId && a.ativo);
    
    // Buscar atividades da trilha
    const atividades = this.db.atividades.filter(a => a.trilhaId === trilhaId && a.ativa);
    
    // Buscar entregas da trilha
    const entregas = this.db.entreges.filter(e => e.trilhaId === trilhaId);

    // Calcular pontuação de cada aluno
    const pontuacoesAlunos = this._calcularPontuacoes(alunos, atividades, entregas);
    
    // Ordenar por pontuação total (ranking)
    const ranking = this._gerarRanking(pontuacoesAlunos);
    
    // Calcular estatísticas do ranking
    const estatisticasRanking = this._calcularEstatisticasRanking(ranking, atividades.length);

    return {
      trilha: {
        id: trilha.id,
        nome: trilha.nome,
        totalAtividades: atividades.length
      },
      ranking,
      estatisticas: estatisticasRanking,
      calculadoEm: new Date()
    };
  }

  /**
   * Calcula pontuação individual de cada aluno
   * @private
   */
  _calcularPontuacoes(alunos, atividades, entregas) {
    const pontuacoes = {};

    // Inicializar pontuação de cada aluno
    alunos.forEach(aluno => {
      pontuacoes[aluno.id] = {
        alunoId: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        entregasPorAtividade: {},
        totalEntregas: 0,
        pontuacaoTotal: 0,
        pontuacaoMaximaPossivel: atividades.length * 10, // Cada atividade vale 10 pts
        atividadesConcluidas: [],
        atividadesPendentes: []
      };
    });

    // Processar cada entrega
    entregas.forEach(entrega => {
      const atividade = atividades.find(a => a.id === entrega.atividadeId);
      if (!atividade) return;

      const alunoId = entrega.alunoId;
      if (!pontuacoes[alunoId]) return;

      const pontos = entrega.nota !== null ? entrega.nota : atividade.pontosMaximos;
      
      // Registrar entrega
      pontuacoes[alunoId].entregasPorAtividade[entrega.atividadeId] = {
        atividadeId: entrega.atividadeId,
        atividadeNome: atividade.nome,
        pontos,
        validadaEm: entrega.validadaEm,
        nota: entrega.nota
      };
      
      pontuacoes[alunoId].totalEntregas++;
      pontuacoes[alunoId].pontuacaoTotal += pontos;
    });

    // Identificar atividades concluídas e pendentes
    alunos.forEach(aluno => {
      atividades.forEach(atividade => {
        if (pontuacoes[aluno.id].entregasPorAtividade[atividade.id]) {
          pontuacoes[aluno.id].atividadesConcluidas.push({
            id: atividade.id,
            nome: atividade.nome,
            pontos: atividade.pontosMaximos
          });
        } else {
          pontuacoes[aluno.id].atividadesPendentes.push({
            id: atividade.id,
            nome: atividade.nome
          });
        }
      });
      
      // Calcular taxa de conclusão
      pontuacoes[aluno.id].taxaConclusao = 
        (pontuacoes[aluno.id].totalEntregas / atividades.length) * 100;
      
      // Calcular percentual de pontuação
      pontuacoes[aluno.id].percentualPontuacao = 
        (pontuacoes[aluno.id].pontuacaoTotal / pontuacoes[aluno.id].pontuacaoMaximaPossivel) * 100;
    });

    return pontuacoes;
  }

  /**
   * Gera o ranking ordenado por pontuação total
   * @private
   */
  _gerarRanking(pontuacoes) {
    const rankingArray = Object.values(pontuacoes);
    
    // Ordenar por pontuação total (decrescente)
    rankingArray.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);
    
    // Adicionar posição no ranking
    return rankingArray.map((aluno, index) => ({
      posicao: index + 1,
      ...aluno,
      // Se houver empate, mesma posição
      estaEmpatado: index > 0 && aluno.pontuacaoTotal === rankingArray[index - 1].pontuacaoTotal
    }));
  }

  /**
   * Calcula estatísticas do ranking
   * @private
   */
  _calcularEstatisticasRanking(ranking, totalAtividades) {
    if (ranking.length === 0) {
      return {
        totalAlunos: 0,
        mediaPontuacao: 0,
        mediaConclusao: 0,
        maiorPontuacao: 0,
        menorPontuacao: 0,
        alunosAcimaMedia: 0,
        distribuicao: {}
      };
    }

    const totalAlunos = ranking.length;
    const somaPontuacoes = ranking.reduce((sum, aluno) => sum + aluno.pontuacaoTotal, 0);
    const mediaPontuacao = somaPontuacoes / totalAlunos;
    const mediaConclusao = ranking.reduce((sum, aluno) => sum + aluno.taxaConclusao, 0) / totalAlunos;
    const maiorPontuacao = Math.max(...ranking.map(a => a.pontuacaoTotal));
    const menorPontuacao = Math.min(...ranking.map(a => a.pontuacaoTotal));
    const alunosAcimaMedia = ranking.filter(a => a.pontuacaoTotal > mediaPontuacao).length;

    // Distribuição por faixa de pontuação
    const distribuicao = {
      excelente: ranking.filter(a => a.percentualPontuacao >= 90).length, // 90-100%
      bom: ranking.filter(a => a.percentualPontuacao >= 70 && a.percentualPontuacao < 90).length,
      regular: ranking.filter(a => a.percentualPontuacao >= 50 && a.percentualPontuacao < 70).length,
      abaixo: ranking.filter(a => a.percentualPontuacao < 50).length
    };

    return {
      totalAlunos,
      mediaPontuacao: mediaPontuacao.toFixed(2),
      mediaConclusao: mediaConclusao.toFixed(2),
      maiorPontuacao,
      menorPontuacao,
      alunosAcimaMedia,
      distribuicao
    };
  }

  /**
   * Calcula ranking apenas para um aluno específico
   * @param {string} trilhaId 
   * @param {string} alunoId 
   */
  calcularPosicaoAluno(trilhaId, alunoId) {
    const rankingCompleto = this.calcularRanking(trilhaId);
    const posicaoAluno = rankingCompleto.ranking.find(a => a.alunoId === alunoId);
    
    if (!posicaoAluno) {
      throw new Error("Aluno não encontrado no ranking");
    }
    
    return posicaoAluno;
  }
}

export default RankingEngine;