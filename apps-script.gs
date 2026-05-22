/**
 * ================================================
 * CONVITE DIGITAL — 15 ANOS
 * Google Apps Script — Web App Backend
 * ================================================
 *
 * INSTRUÇÕES DE PUBLICAÇÃO:
 * 1. Abra sua Planilha Google
 * 2. Menu: Extensões > Apps Script
 * 3. Cole este código no editor
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Tipo: "App da Web"
 * 6. Executar como: "Eu (seu e-mail)"
 * 7. Quem tem acesso: "Qualquer pessoa"
 * 8. Clique em "Implantar" e copie a URL gerada
 * 9. Cole a URL no arquivo script.js (variável APPS_SCRIPT_URL)
 * ================================================
 */

// ID da planilha — substitua pelo ID da sua planilha
// (encontrado na URL: docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit)
const SHEET_ID = 'SEU_SHEET_ID_AQUI';
const SHEET_NAME = 'Confirmações'; // Nome da aba da planilha

/**
 * Cabeçalhos CORS — necessários para requisições do frontend
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

/**
 * doGet — responde a requisições GET
 * Utilizado para verificar se o serviço está ativo
 */
function doGet(e) {
  const headers = getCORSHeaders();

  // Verificar se é uma requisição de busca de confirmações
  if (e && e.parameter && e.parameter.action === 'list') {
    return listConfirmacoes();
  }

  const response = {
    success: true,
    message: 'Convite 15 Anos — API ativa',
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * doPost — recebe e salva confirmações de presença
 */
function doPost(e) {
  try {
    // Parse do corpo da requisição
    let dados;
    try {
      dados = JSON.parse(e.postData.contents);
    } catch (parseError) {
      dados = e.parameter;
    }

    // Validação dos dados recebidos
    if (!dados || !dados.nome || dados.nome.trim() === '') {
      return criarResposta(false, 'Nome é obrigatório.', null);
    }

    const nome = dados.nome.trim();

    // Verificar tamanho do nome
    if (nome.length < 2) {
      return criarResposta(false, 'Nome muito curto.', null);
    }

    if (nome.length > 100) {
      return criarResposta(false, 'Nome muito longo.', null);
    }

    // Verificar duplicatas (opcional — comentar para desativar)
    if (verificarDuplicata(nome)) {
      return criarResposta(false, 'Este nome já foi confirmado anteriormente.', null);
    }

    // Salvar na planilha
    const resultado = salvarConfirmacao(nome);

    if (resultado.success) {
      return criarResposta(true, 'Presença confirmada com sucesso!', {
        nome: nome,
        dataHora: resultado.dataHora,
        linha: resultado.linha
      });
    } else {
      return criarResposta(false, 'Erro ao salvar confirmação. Tente novamente.', null);
    }

  } catch (error) {
    Logger.log('Erro no doPost: ' + error.message);
    return criarResposta(false, 'Erro interno do servidor: ' + error.message, null);
  }
}

/**
 * Salva a confirmação na planilha Google Sheets
 */
function salvarConfirmacao(nome) {
  try {
    let planilha;

    // Tentar abrir por ID, se configurado
    if (SHEET_ID && SHEET_ID !== 'SEU_SHEET_ID_AQUI') {
      planilha = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    } else {
      // Usar a planilha ativa (quando rodando direto do editor)
      planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    }

    // Criar aba se não existir
    if (!planilha) {
      const ss = SHEET_ID && SHEET_ID !== 'SEU_SHEET_ID_AQUI'
        ? SpreadsheetApp.openById(SHEET_ID)
        : SpreadsheetApp.getActiveSpreadsheet();

      planilha = ss.insertSheet(SHEET_NAME);

      // Criar cabeçalhos com formatação
      const cabecalho = planilha.getRange(1, 1, 1, 2);
      cabecalho.setValues([['Nome Completo', 'Data/Hora Confirmação']]);
      cabecalho.setFontWeight('bold');
      cabecalho.setBackground('#1a237e');
      cabecalho.setFontColor('#ffffff');
      planilha.setColumnWidth(1, 250);
      planilha.setColumnWidth(2, 200);
    }

    // Data e hora formatada em horário de Brasília
    const agora = new Date();
    const dataHoraBrasilia = Utilities.formatDate(
      agora,
      'America/Recife',
      'dd/MM/yyyy HH:mm:ss'
    );

    // Adicionar linha na planilha
    planilha.appendRow([nome, dataHoraBrasilia]);
    const ultimaLinha = planilha.getLastRow();

    // Formatação alternada das linhas
    if (ultimaLinha % 2 === 0) {
      planilha.getRange(ultimaLinha, 1, 1, 2).setBackground('#e8eaf6');
    }

    Logger.log('Confirmação salva: ' + nome + ' às ' + dataHoraBrasilia);

    return {
      success: true,
      dataHora: dataHoraBrasilia,
      linha: ultimaLinha
    };

  } catch (error) {
    Logger.log('Erro ao salvar: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica se o nome já foi confirmado anteriormente
 */
function verificarDuplicata(nome) {
  try {
    let planilha;

    if (SHEET_ID && SHEET_ID !== 'SEU_SHEET_ID_AQUI') {
      planilha = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    } else {
      planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    }

    if (!planilha) return false;

    const ultimaLinha = planilha.getLastRow();
    if (ultimaLinha <= 1) return false; // Apenas cabeçalho

    const dados = planilha.getRange(2, 1, ultimaLinha - 1, 1).getValues();

    const nomeLower = nome.toLowerCase().trim();
    return dados.some(linha => linha[0].toString().toLowerCase().trim() === nomeLower);

  } catch (error) {
    Logger.log('Erro ao verificar duplicata: ' + error.message);
    return false;
  }
}

/**
 * Lista todas as confirmações (para uso interno/admin)
 */
function listConfirmacoes() {
  try {
    let planilha;

    if (SHEET_ID && SHEET_ID !== 'SEU_SHEET_ID_AQUI') {
      planilha = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    } else {
      planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    }

    if (!planilha) {
      return criarResposta(true, 'Nenhuma confirmação ainda', { total: 0, confirmacoes: [] });
    }

    const ultimaLinha = planilha.getLastRow();
    if (ultimaLinha <= 1) {
      return criarResposta(true, 'Nenhuma confirmação', { total: 0, confirmacoes: [] });
    }

    const dados = planilha.getRange(2, 1, ultimaLinha - 1, 2).getValues();
    const confirmacoes = dados.map(linha => ({
      nome: linha[0],
      dataHora: linha[1]
    }));

    return criarResposta(true, 'Lista obtida', {
      total: confirmacoes.length,
      confirmacoes: confirmacoes
    });

  } catch (error) {
    return criarResposta(false, 'Erro ao listar: ' + error.message, null);
  }
}

/**
 * Cria resposta JSON padronizada
 */
function criarResposta(sucesso, mensagem, dados) {
  const resposta = {
    success: sucesso,
    message: mensagem,
    timestamp: new Date().toISOString()
  };

  if (dados !== null) {
    resposta.data = dados;
  }

  return ContentService
    .createTextOutput(JSON.stringify(resposta))
    .setMimeType(ContentService.MimeType.JSON);
}
