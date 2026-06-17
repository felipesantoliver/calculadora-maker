const Engine = {
  calculate3DPrice(params) {
    const { peso, tempo, material_id, complexidade, tipo, precoRealInput } = params;
    if (!material_id) return null;

    const materialObj = materiais.find(m => m.id === material_id);
    if (!materialObj) return null;

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
    if (complexidade === 2) multiplicador = configEngine.multiplicador_n2 || 1.5;
    if (complexidade === 3) multiplicador = configEngine.multiplicador_n3;

    const mao_obra = (tipo === 'normal') ? tempo * configEngine.mao_obra_hora * multiplicador : 0;
    const margemPadrao = (configEngine.margem_padrao || 150) / 100;
    const margemPremium = (configEngine.margem_premium || 200) / 100;

    let preco_padrao = Utils.ceilToHalfReal((custo_total + mao_obra) * (1 + margemPadrao));
    let preco_premium = Utils.ceilToHalfReal((custo_total + mao_obra) * (1 + margemPremium));
    if (configEngine.preco_minimo && preco_padrao < configEngine.preco_minimo) preco_padrao = configEngine.preco_minimo;
    if (configEngine.preco_minimo && preco_premium < configEngine.preco_minimo) preco_premium = configEngine.preco_minimo;

    return {
      service_type: "3d",
      custo_material, energia, capex_base, manutencao, custo_total, mao_obra,
      preco_padrao, preco_premium,
      peso, tempo, material_id, tipo, complexidade,
      preco_real_venda: isNaN(precoRealInput) ? null : precoRealInput,
      multiplicador
    };
  },

  calculateProjectPrice(params) {
    const { horas, custo_direto, complexidade } = params;
    let multiplicador = complexidade === 2 ? 1.5 : complexidade === 3 ? configEngine.proj_multiplicador_n3 : 1.0;
    const mao_obra = horas * configEngine.proj_hora_base * multiplicador;
    let custo_total = custo_direto;
    if (custo_total < 3.00) custo_total = 3.00;

    const margemPadrao = (configEngine.margem_padrao || 150) / 100;
    const margemPremium = (configEngine.margem_premium || 200) / 100;

    const preco_padrao = Utils.ceilToHalfReal((custo_total + mao_obra) * (1 + margemPadrao));
    const preco_premium = Utils.ceilToHalfReal((custo_total + mao_obra) * (1 + margemPremium));

    return {
      service_type: "projeto",
      custo_material: 0, energia: 0, capex_base: 0, manutencao: 0,
      custo_total, mao_obra, preco_padrao, preco_premium,
      peso: 0, tempo: horas, material_id: null, tipo: "normal", complexidade,
      preco_real_venda: null,
      custo_direto,
      horas
    };
  }
};