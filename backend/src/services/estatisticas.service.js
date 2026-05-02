// src/services/estatisticas.service.js

/**
 * Serviço de Estatísticas do PodeCrer
 * Calcula métricas agregadas da trilha
 * Nada é armazenado, tudo calculado sob demanda
 */

export class EstatisticasService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Calcula estatísticas completas de uma trilha
   */
  calcularEstatisticasCompletas(trilhaId) {
    const trilha = this.db.trilhas.find(t => t.id === trilhaId);
    if (!trilha) {
      throw new Error("Trilha não encontrada");
    }

    const alunos = this.db.alunos.filter(a => a.trilhaId === trilhaId && a.ativo);
    const atividades = this.db.atividades.filter(a => a.trilhaId === trilhaId && a.ativa);
    const entregas = this.db.entreges.filter(e => e.trilhaId === trilhaId);

    return {
      geral: this._calcularEstatisticasGerais(alunos, atividades, entregas),
      porAluno: this._calcularEstatisticasPorAluno(alunos, atividades, entregas),
      porAtividade: this._calcularEstatisticasPorAtividade(atividades, entregas, alunos.length),
      progressao: this._calcularProgressaoTemporal(entregas, atividades.length),
      engajamento: this._calcularEngajamento(alunos, entregas, atividades.length)
    };
  }

  /**
   * Estatísticas gerais da trilha
   * @private
   */
  _calcularEstatisticasGerais(alunos, atividades, entregas) {
    const totalAlunos = alunos.length;
    const totalAtividades = atividades.length;
    const totalEntregas = entregas.length;
    const totalEntregasPossiveis = totalAlunos * totalAtividades;
    
    // Taxa de conclusão geral
    const taxaConclusaoGeral = totalEntregasPossiveis > 0 
      ? (totalEntregas / totalEntregasPossiveis) * 100 
      : 0;

    // Média de entregas por aluno
    const mediaEntregasPorAluno = totalAlunos > 0 
      ? totalEntregas / totalAlunos 
      : 0;

    // Aluno com mais entregas
    const entregasPorAluno = {};
    entregas.forEach(entrega => {
      entregasPorAluno[entrega.alunoId] = (entregasPorAluno[entrega.alunoId] || 0) + 1;
    });
    
    let alunoDestaque = null;
    let maxEntregas = 0;
    for (const [alunoId, qtd] of Object.entries(entregasPorAluno)) {
      if (qtd > maxEntregas) {
        maxEntregas = qtd;
        const aluno = alunos.find(a => a.id === alunoId);
        alunoDestaque = aluno ? { id: aluno.id, nome: aluno.nome, entregas: qtd } : null;
      }
    }

    // Atividade com maior adesão
    const entregasPorAtividade = {};
    entregas.forEach(entrega => {
      entregasPorAtividade[entrega.atividadeId] = (entregasPorAtividade[entrega.atividadeId] || 0) + 1;
    });
    
    let atividadeDestaque = null;
    let maxEntregasAtividade = 0;
    for (const [atividadeId, qtd] of Object.entries(entregasPorAtividade)) {
      if (qtd > maxEntregasAtividade) {
        maxEntregasAtividade = qtd;
        const atividade = atividades.find(a => a.id === atividadeId);
        atividadeDestaque = atividade ? { 
          id: atividade.id, 
          nome: atividade.nome, 
          entregas: qtd,
          percentualAdesao: (qtd / totalAlunos) * 100
        } : null;
      }
    }

    return {
      totalAlunos,
      totalAtividades,
      totalEntregas,
      totalEntregasPossiveis,
      taxaConclusaoGeral: taxaConclusaoGeral.toFixed(2),
      mediaEntregasPorAluno: mediaEntregasPorAluno.toFixed(2),
      alunoDestaque,
      atividadeDestaque,
      dataCalculo: new Date()
    };
  }

  /**
   * Estatísticas por aluno
   * @private
   */
  _calcularEstatisticasPorAluno(alunos, atividades, entregas) {
    const estatisticas = [];

    alunos.forEach(aluno => {
      const entregasAluno = entregas.filter(e => e.alunoId === aluno.id);
      const totalEntregas = entregasAluno.length;
      const totalAtividades = atividades.length;
      const percentualConclusao = totalAtividades > 0 
        ? (totalEntregas / totalAtividades) * 100 
        : 0;

      // Soma de pontos
      let pontuacaoTotal = 0;
      entregasAluno.forEach(entrega => {
        const atividade = atividades.find(a => a.id === entrega.atividadeId);
        if (atividade) {
          pontuacaoTotal += entrega.nota !== null ? entrega.nota : atividade.pontosMaximos;
        }
      });

      const pontuacaoMaxima = totalAtividades * 10;
      const percentualPontuacao = pontuacaoMaxima > 0 
        ? (pontuacaoTotal / pontuacaoMaxima) * 100 
        : 0;

      estatisticas.push({
        alunoId: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        totalEntregas,
        totalAtividades,
        percentualConclusao: percentualConclusao.toFixed(2),
        pontuacaoTotal,
        pontuacaoMaxima,
        percentualPontuacao: percentualPontuacao.toFixed(2),
        atividadesPendentes: totalAtividades - totalEntregas,
        mediaPorAtividade: totalEntregas > 0 ? (pontuacaoTotal / totalEntregas).toFixed(2) : 0
      });
    });

    return estatisticas;
  }

  /**
   * Estatísticas por atividade
   * @private
   */
  _calcularEstatisticasPorAtividade(atividades, entregas, totalAlunos) {
    const estatisticas = [];

    atividades.forEach(atividade => {
      const entregasAtividade = entregas.filter(e => e.atividadeId === atividade.id);
      const totalEntregas = entregasAtividade.length;
      const percentualAdesao = totalAlunos > 0 
        ? (totalEntregas / totalAlunos) * 100 
        : 0;

      // Média de nota
      let somaNotas = 0;
      entregasAtividade.forEach(entrega => {
        somaNotas += entrega.nota !== null ? entrega.nota : atividade.pontosMaximos;
      });
      const mediaNota = totalEntregas > 0 ? somaNotas / totalEntregas : 0;

      estatisticas.push({
        atividadeId: atividade.id,
        nome: atividade.nome,
        ordem: atividade.ordem,
        pontosMaximos: atividade.pontosMaximos,
        totalEntregas,
        totalAlunos,
        percentualAdesao: percentualAdesao.toFixed(2),
        mediaNota: mediaNota.toFixed(2),
        taxaSucesso: (totalEntregas / totalAlunos) * 100
      });
    });

    return estatisticas.sort((a, b) => a.ordem - b.ordem);
  }

  /**
   * Progressão temporal (evolução ao longo do tempo)
   * @private
   */
  _calcularProgressaoTemporal(entregas, totalAtividades) {
    if (entregas.length === 0) {
      return { pontos: [], conclusao: [] };
    }

    // Ordenar entregas por data
    const entregasOrdenadas = [...entregas].sort((a, b) => 
      new Date(a.validadaEm) - new Date(b.validadaEm)
    );

    // Agrupar por dia
    const entregasPorDia = {};
    entregasOrdenadas.forEach(entrega => {
      const data = new Date(entrega.validadaEm).toISOString().split('T')[0];
      if (!entregasPorDia[data]) {
        entregasPorDia[data] = 0;
      }
      entregasPorDia[data]++;
    });

    // Calcular acumulado
    let acumulado = 0;
    const progressao = Object.entries(entregasPorDia).map(([data, qtd]) => {
      acumulado += qtd;
      return {
        data,
        entregasDia: qtd,
        totalEntregasAcumulado: acumulado,
        percentualConclusaoEsperado: (acumulado / totalAtividades) * 100
      };
    });

    return progressao;
  }

  /**
   * Métricas de engajamento da turma
   * @private
   */
  _calcularEngajamento(alunos, entregas, totalAtividades) {
    const totalAlunos = alunos.length;
    const totalEntregas = entregas.length;
    const entregasPorAluno = totalAlunos > 0 ? totalEntregas / totalAlunos : 0;
    
    // Alunos inativos (nenhuma entrega)
    const alunosComEntregas = new Set(entregas.map(e => e.alunoId));
    const alunosInativos = alunos.filter(a => !alunosComEntregas.has(a.id)).length;
    
    // Alunos que concluíram 100%
    const entregasPorAlunoMap = {};
    entregas.forEach(entrega => {
      entregasPorAlunoMap[entrega.alunoId] = (entregasPorAlunoMap[entrega.alunoId] || 0) + 1;
    });
    const alunosConcluintes = Object.values(entregasPorAlunoMap).filter(qtd => qtd === totalAtividades).length;

    // Taxa de evasão (alunos com < 30% de conclusão)
    const alunosComBaixaConclusao = Object.values(entregasPorAlunoMap).filter(
      qtd => (qtd / totalAtividades) < 0.3
    ).length;

    return {
      mediaEntregasPorAluno: entregasPorAluno.toFixed(2),
      alunosAtivos: alunosComEntregas.size,
      alunosInativos,
      taxaAtividade: ((alunosComEntregas.size / totalAlunos) * 100).toFixed(2),
      alunosConcluintes,
      taxaConclusaoTotal: ((alunosConcluintes / totalAlunos) * 100).toFixed(2),
      alunosComBaixaConclusao,
      riscoEvasao: ((alunosComBaixaConclusao / totalAlunos) * 100).toFixed(2),
      indiceEngajamento: ((entregasPorAluno / totalAtividades) * 100).toFixed(2)
    };
  }
}

export default EstatisticasService;