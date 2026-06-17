const Engine = {
  calculate3DPrice() {
    const peso = parseFloat(document.getElementById('calc-peso').value) || 0;
    const tempo = parseFloat(document.getElementById('calc-tempo').value) || 0;
    const material_id = document.getElementById('calc-material').value;
    const complexidade = parseInt(document.getElementById('calc-complexidade').value);
    const tipo = UI.getSelectedType();
    const precoRealInput = parseFloat(document.getElementById('calc-preco-real-input').value);

    if (!material_id) return;

    const materialObj = materiais.find(m => m.id === material_id);
    const custo_por_grama = materialObj.preco_total / materialObj.peso_total;
    const custo_material = peso * custo_por_grama;

    let energia = 0, capex_base = 0, manutencao = 0;
    if (tipo === 'normal') {
      energia = tempo * configEngine.energia_hora;
      capex_base = (peso / 50) * configEngine.capex_base;
      manutencao = configEngine.manutencao_porcentagem * (custo_material + capex_base + energia);
    } else {
      energia = 0;
      capex_base = 0;
      manutencao = configEngine.manutencao_porcentagem * custo_material;
    }

    let subtotal = custo_material + capex_base + energia;
    if (subtotal < 3.00) subtotal = 3.00;
    const custo_total = subtotal + manutencao;

    let multiplicador = 1.0;
    if (complexidade === 2) multiplicador = configEngine.multiplicador_n2;
    if (complexidade === 3) multiplicador = configEngine.multiplicador_n3;

    const mao_obra = (tipo === 'normal') ? tempo * configEngine.mao_obra_hora * multiplicador : 0;
    let preco_150 = Utils.ceilToHalfReal((custo_total + mao_obra) * 1.5);
    if (configEngine.preco_minimo && preco_150 < configEngine.preco_minimo) preco_150 = configEngine.preco_minimo;
    const preco_200 = Utils.ceilToHalfReal((custo_total + mao_obra) * 2.0);

    // Atualiza painel de detalhamento (UI.handleBreakdown)
    UI.render3DBreakdown(custo_material, energia, capex_base, manutencao, mao_obra, custo_total, preco_150, preco_200, tempo, multiplicador);

    window.currentCalculatedResults = {
      service_type: "3d",
      custo_material, energia, capex_base, manutencao, custo_total, mao_obra,
      preco_150, preco_200, peso, tempo, material_id, tipo, complexidade,
      preco_real_venda: isNaN(precoRealInput) ? null : precoRealInput
    };
  },

  calculateProjectPrice() {
    const horas = parseFloat(document.getElementById('proj-horas').value) || 0;
    const custo_direto = parseFloat(document.getElementById('proj-custo-direto').value) || 0;
    const complexidade = parseInt(document.getElementById('proj-complexidade').value);
    let multiplicador = complexidade === 2 ? 1.5 : complexidade === 3 ? configEngine.proj_multiplicador_n3 : 1.0;
    const mao_obra = horas * configEngine.proj_hora_base * multiplicador;
    let custo_total = custo_direto;
    if (custo_total < 3.00) custo_total = 3.00;
    const preco_150 = Utils.ceilToHalfReal((custo_total + mao_obra) * 1.5);
    const preco_200 = Utils.ceilToHalfReal((custo_total + mao_obra) * 2.0);

    UI.renderProjectBreakdown(custo_direto, mao_obra, custo_total, preco_150, preco_200, horas);
    window.currentCalculatedResults = {
      service_type: "projeto",
      custo_material: 0, energia: 0, capex_base: 0, manutencao: 0,
      custo_total, mao_obra, preco_150, preco_200,
      peso: 0, tempo: horas, material_id: null, tipo: "normal", complexidade,
      preco_real_venda: null
    };
  }
};