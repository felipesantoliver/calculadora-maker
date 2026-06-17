const UI = {
  sortColumn: 'data',
  sortDirection: 'desc',

  switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) activeTab.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white');
      btn.classList.add('text-slate-400');
    });
    const activeNav = document.getElementById('nav-' + tabId);
    if (activeNav) {
      activeNav.classList.add('bg-indigo-600', 'text-white');
      activeNav.classList.remove('text-slate-400');
    }

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.remove('text-indigo-600');
      btn.classList.add('text-slate-400');
    });
    const activeMobileNav = document.getElementById('mobile-nav-' + tabId);
    if (activeMobileNav) {
      activeMobileNav.classList.add('text-indigo-600');
      activeMobileNav.classList.remove('text-slate-400');
    }

    const titles = {
      dashboard: { title: "Dashboard Geral", subtitle: "Acompanhe a saúde financeira do seu ecossistema 3D e de projetos." },
      precificar: { title: "Precificador Híbrido", subtitle: "Simulador de custos dinâmicos e precificação com faturamento instantâneo." },
      historico: { title: "Histórico de Cobranças", subtitle: "Listagem de peças impressas e contratos salvos no sistema." },
      configuracoes: { title: "Configurações da Engine", subtitle: "Altere as tarifas de energia, taxas de CAPEX, mão de obra e gerencie filamentos." }
    };
    document.getElementById('header-title').innerText = titles[tabId].title;
    document.getElementById('header-subtitle').innerText = titles[tabId].subtitle;

    if (tabId === 'dashboard') Charts.updateDashboard();
    else if (tabId === 'historico') UI.renderHistoryTable();
    else if (tabId === 'configuracoes') UI.renderMaterialsList();
    this.currentTab = tabId;
  },

  toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (this.currentTab === 'dashboard') Charts.updateDashboard();
  },

  toggleServiceMode(mode) {
    window.currentServiceMode = mode;
    const btn3d = document.getElementById('btn-mode-3d');
    const btnProjeto = document.getElementById('btn-mode-projeto');
    const inputs3d = document.getElementById('inputs-3d');
    const inputsProjeto = document.getElementById('inputs-projeto');
    const copyMarkdownBtn = document.getElementById('btn-copy-markdown');

    if (mode === '3d') {
      btn3d.className = "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-indigo-600 bg-white dark:bg-slate-900 shadow-sm";
      btnProjeto.className = "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-500 dark:text-slate-400";
      inputs3d.classList.remove('hidden');
      inputsProjeto.classList.add('hidden');
      if (copyMarkdownBtn) copyMarkdownBtn.classList.remove('hidden');
    } else {
      btnProjeto.className = "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-indigo-600 bg-white dark:bg-slate-900 shadow-sm";
      btn3d.className = "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-500 dark:text-slate-400";
      inputsProjeto.classList.remove('hidden');
      inputs3d.classList.add('hidden');
      if (copyMarkdownBtn) copyMarkdownBtn.classList.add('hidden');
    }
    UI.calculatePrice();
  },

  getSelectedType() {
    const radios = document.getElementsByName('calc-tipo');
    for (let r of radios) if (r.checked) return r.value;
    return 'normal';
  },

  handleTypeChange(tipo) {
    const lblNormal = document.getElementById('lbl-tipo-normal');
    const lblBrinde = document.getElementById('lbl-tipo-brinde');
    const lblPerdida = document.getElementById('lbl-tipo-perdida');
    const specialAlert = document.getElementById('special-rule-alert');
    [lblNormal, lblBrinde, lblPerdida].forEach(lbl => lbl && lbl.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'ring-2', 'ring-indigo-500/20'));
    if (tipo === 'normal') {
      if (lblNormal) lblNormal.classList.add('border-indigo-600', 'bg-indigo-50/50');
      if (specialAlert) specialAlert.classList.add('hidden');
    } else {
      const target = tipo === 'brinde' ? lblBrinde : lblPerdida;
      if (target) target.classList.add('border-indigo-600', 'bg-indigo-50/50');
      if (specialAlert) specialAlert.classList.remove('hidden');
      document.getElementById('special-rule-text').innerText = "Regra Especial Ativada (Brinde/Perdida): Gasto com Energia = R$ 0,00 • CAPEX por peso = R$ 0,00 • Apenas Manutenção (5% sobre material) • Baseado em material real utilizado.";
    }
    UI.calculatePrice();
  },

  calculatePrice() {
    if (window.currentServiceMode === '3d') Engine.calculate3DPrice();
    else Engine.calculateProjectPrice();
  },

  render3DBreakdown(custo_material, energia, capex_base, manutencao, mao_obra, custo_total, preco_150, preco_200, tempo, multiplicador) {
    document.getElementById('breakdown-container').innerHTML = `
      <div class="flex justify-between items-center text-slate-300"><span>Custo de Material:</span><span class="font-semibold text-white">${Utils.formatCurrency(custo_material)}</span></div>
      <div class="flex justify-between items-center text-slate-300"><span>Gasto com Energia:</span><span class="font-semibold text-white">${Utils.formatCurrency(energia)}</span></div>
      <div class="flex justify-between items-center text-slate-300"><span>CAPEX (Perda por peso):</span><span class="font-semibold text-white">${Utils.formatCurrency(capex_base)}</span></div>
      <div class="flex justify-between items-center text-slate-300 border-b border-indigo-900/60 pb-3"><span>Taxa Manutenção:</span><span class="font-semibold text-white">${Utils.formatCurrency(manutencao)}</span></div>
      <div class="flex justify-between items-center text-slate-300 pt-1"><span>Mão de Obra Total (${tempo}h x R$ ${configEngine.mao_obra_hora.toFixed(2)} x ${multiplicador}):</span><span class="font-semibold text-emerald-400">${Utils.formatCurrency(mao_obra)}</span></div>
      <div class="flex justify-between items-center border-b border-indigo-900/60 pb-3"><span class="font-semibold text-white text-base">CUSTO TOTAL DE IMPRESSÃO:</span><span class="font-extrabold text-white text-base">${Utils.formatCurrency(custo_total)}</span></div>
      <div class="space-y-3 pt-2">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cenários de Faturamento</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-indigo-900/50 p-3 rounded-xl border border-indigo-800"><span class="text-xs text-indigo-300 font-medium">Cenário 150% (Equilibrado)</span><p class="text-lg font-bold text-white mt-1">${Utils.formatCurrency(preco_150)}</p><p class="text-[10px] text-indigo-400">Lucro Real: ${Utils.formatCurrency(preco_150 - custo_total)}</p></div>
          <div class="bg-indigo-900/50 p-3 rounded-xl border border-indigo-800"><span class="text-xs text-emerald-400 font-medium">Cenário 200% (Premium)</span><p class="text-lg font-bold text-white mt-1">${Utils.formatCurrency(preco_200)}</p><p class="text-[10px] text-emerald-400">Lucro Real: ${Utils.formatCurrency(preco_200 - custo_total)}</p></div>
        </div>
      </div>`;
    document.getElementById('panel-title-finance').innerText = "Custos de Manufatura 3D";
  },

  renderProjectBreakdown(custo_direto, mao_obra, custo_total, preco_150, preco_200, horas) {
    document.getElementById('breakdown-container').innerHTML = `
      <div class="flex justify-between items-center text-slate-300"><span>Despesas Diretas:</span><span class="font-semibold text-white">${Utils.formatCurrency(custo_direto)}</span></div>
      <div class="flex justify-between items-center text-slate-300 border-b border-indigo-900/60 pb-3"><span>Mão de Obra (${horas}h):</span><span class="font-semibold text-emerald-400">${Utils.formatCurrency(mao_obra)}</span></div>
      <div class="flex justify-between items-center border-b border-indigo-900/60 pb-3 pt-2"><span class="font-semibold text-white text-base">CUSTO OPERACIONAL:</span><span class="font-extrabold text-white text-base">${Utils.formatCurrency(custo_total)}</span></div>
      <div class="space-y-3 pt-2">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cenários de Faturamento</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-indigo-900/50 p-3 rounded-xl border border-indigo-800"><span class="text-xs text-indigo-300 font-medium">Margem Saudável (150%)</span><p class="text-lg font-bold text-white mt-1">${Utils.formatCurrency(preco_150)}</p><p class="text-[10px] text-indigo-400">Lucro: ${Utils.formatCurrency(preco_150 - custo_total)}</p></div>
          <div class="bg-indigo-900/50 p-3 rounded-xl border border-indigo-800"><span class="text-xs text-emerald-400 font-medium">Alta Margem (200%)</span><p class="text-lg font-bold text-white mt-1">${Utils.formatCurrency(preco_200)}</p><p class="text-[10px] text-emerald-400">Lucro: ${Utils.formatCurrency(preco_200 - custo_total)}</p></div>
        </div>
      </div>`;
    document.getElementById('panel-title-finance').innerText = "Custos do Projeto Tecnológico";
  },

  // ---------- MATERIAIS ----------
  populateMaterialDropdowns() {
    const dropdown = document.getElementById('calc-material');
    dropdown.innerHTML = '';
    materiais.forEach(mat => {
      const custo_por_grama = mat.preco_total / mat.peso_total;
      const option = document.createElement('option');
      option.value = mat.id;
      option.text = `${mat.tipo} - ${mat.marca} (R$ ${custo_por_grama.toFixed(3)}/g)`;
      dropdown.add(option);
    });
  },

  toggleAddMaterialForm() {
    document.getElementById('add-material-form').classList.toggle('hidden');
  },

  addNewMaterial() {
    const tipo = document.getElementById('mat-tipo').value;
    const marca = document.getElementById('mat-marca').value.trim();
    const forma = document.getElementById('mat-forma').value.trim();
    const peso = parseFloat(document.getElementById('mat-peso').value);
    const preco = parseFloat(document.getElementById('mat-preco').value);
    if (!marca || !forma || isNaN(peso) || isNaN(preco)) return Utils.toast("Preencha todos os campos.");
    materiais.push({ id: 'mat-' + Date.now(), tipo, marca, forma, peso_total: peso, preco_total: preco });
    UI.populateMaterialDropdowns();
    UI.renderMaterialsList();
    UI.toggleAddMaterialForm();
    Utils.toast("Material adicionado!");
    scheduleSync();
  },

  deleteMaterial(id) {
    if (materiais.length <= 1) return Utils.toast("Mantenha ao menos um material.");
    Utils.showConfirm("Remover Material", "Apagar permanentemente?", () => {
      const dropdown = document.getElementById('calc-material');
      if (dropdown.value === id) dropdown.value = materiais.find(m => m.id !== id).id;
      materiais = materiais.filter(m => m.id !== id);
      UI.populateMaterialDropdowns();
      UI.renderMaterialsList();
      scheduleSync();
      Utils.toast("Filamento removido.");
    });
  },

  renderMaterialsList() {
    const container = document.getElementById('materials-list-container');
    container.innerHTML = '';
    materiais.forEach(mat => {
      const custo_por_grama = mat.preco_total / mat.peso_total;
      const card = document.createElement('div');
      card.className = "p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-4";
      
      const leftDiv = document.createElement('div');
      leftDiv.className = "flex-1";
      const flexDiv = document.createElement('div');
      flexDiv.className = "flex items-center gap-2";
      
      const tipoSpan = document.createElement('span');
      tipoSpan.className = "px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] rounded";
      tipoSpan.textContent = mat.tipo;
      
      const nomeH4 = document.createElement('h4');
      nomeH4.className = "font-bold text-sm text-slate-800 dark:text-slate-100";
      nomeH4.textContent = mat.marca;
      
      flexDiv.appendChild(tipoSpan);
      flexDiv.appendChild(nomeH4);
      
      const infoP = document.createElement('p');
      infoP.className = "text-xs text-slate-400 mt-1";
      infoP.textContent = `${mat.forma} de ${mat.peso_total}g • ${Utils.formatCurrency(mat.preco_total)}`;
      
      leftDiv.appendChild(flexDiv);
      leftDiv.appendChild(infoP);
      
      const rightDiv = document.createElement('div');
      rightDiv.className = "flex items-center gap-4";
      
      const precoDiv = document.createElement('div');
      precoDiv.className = "text-right";
      const labelSpan = document.createElement('span');
      labelSpan.className = "text-[10px] font-bold text-slate-500 uppercase block";
      labelSpan.textContent = "Por Grama";
      const valorP = document.createElement('p');
      valorP.className = "font-extrabold text-sm text-indigo-900 dark:text-indigo-300";
      valorP.textContent = `R$ ${custo_por_grama.toFixed(3)}`;
      precoDiv.appendChild(labelSpan);
      precoDiv.appendChild(valorP);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = "p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition-colors";
      deleteBtn.setAttribute('onclick', `UI.deleteMaterial('${mat.id}')`);
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'trash-2');
      icon.className = "w-4 h-4";
      deleteBtn.appendChild(icon);
      
      rightDiv.appendChild(precoDiv);
      rightDiv.appendChild(deleteBtn);
      
      card.appendChild(leftDiv);
      card.appendChild(rightDiv);
      container.appendChild(card);
    });
    lucide.createIcons();
  },

  // ---------- CONFIGURAÇÕES ----------
  fillConfigForm() {
    document.getElementById('cfg-energia').value = configEngine.energia_hora;
    document.getElementById('cfg-capex').value = configEngine.capex_base;
    document.getElementById('cfg-manutencao').value = configEngine.manutencao_porcentagem * 100;
    document.getElementById('cfg-mao-obra').value = configEngine.mao_obra_hora;
    document.getElementById('cfg-mult-n3').value = configEngine.multiplicador_n3;
    document.getElementById('cfg-preco-minimo').value = configEngine.preco_minimo || 0;
    document.getElementById('cfg-proj-hora-base').value = configEngine.proj_hora_base;
    document.getElementById('cfg-proj-mult-n3').value = configEngine.proj_multiplicador_n3;
    document.getElementById('proj-lbl-hora-base').innerText = `R$ ${configEngine.proj_hora_base.toFixed(2)}/h`;
  },

  saveEngineConfigs() {
    configEngine.energia_hora = parseFloat(document.getElementById('cfg-energia').value) || 0;
    configEngine.capex_base = parseFloat(document.getElementById('cfg-capex').value) || 0;
    configEngine.manutencao_porcentagem = (parseFloat(document.getElementById('cfg-manutencao').value) || 0) / 100;
    configEngine.mao_obra_hora = parseFloat(document.getElementById('cfg-mao-obra').value) || 0;
    configEngine.multiplicador_n3 = parseFloat(document.getElementById('cfg-mult-n3').value) || 2.2;
    configEngine.preco_minimo = parseFloat(document.getElementById('cfg-preco-minimo').value) || 0;
    configEngine.proj_hora_base = parseFloat(document.getElementById('cfg-proj-hora-base').value) || 0;
    configEngine.proj_multiplicador_n3 = parseFloat(document.getElementById('cfg-proj-mult-n3').value) || 0;
    document.getElementById('proj-lbl-hora-base').innerText = `R$ ${configEngine.proj_hora_base.toFixed(2)}/h`;
    
    Storage.setLocal(materiais, historico, configEngine, localStorage.getItem('app_password'));
    scheduleSync();
    Utils.toast("Variáveis da Engine atualizadas!");
    UI.calculatePrice();
  },

  changePassword() {
    const newPwd = document.getElementById('cfg-new-password').value;
    const confirmPwd = document.getElementById('cfg-confirm-password').value;
    if (!newPwd || newPwd.length < 6) return Utils.toast('A senha deve ter no mínimo 6 caracteres.');
    if (newPwd !== confirmPwd) return Utils.toast('As senhas não coincidem.');
    localStorage.setItem('app_password', newPwd);
    API.setPassword(newPwd);
    document.getElementById('cfg-new-password').value = '';
    document.getElementById('cfg-confirm-password').value = '';
    Utils.toast('Senha alterada com sucesso!');
    scheduleSync();
  },

  // ---------- MARKDOWN / TEMPLATES ----------
  generateMarkdown() {
    if (window.currentCalculatedResults?.service_type !== '3d') return Utils.toast("Selecione Manufatura 3D.");
    const pecaNome = document.getElementById('calc-peca-nome').value.trim() || "Peça Exemplo";
    const clienteNome = document.getElementById('calc-cliente-nome').value.trim() || "Consumidor Final";
    const markdown = UI.buildMarkdown(pecaNome, clienteNome);
    navigator.clipboard.writeText(markdown).then(() => Utils.toast("Relatório copiado!"));
  },

  buildMarkdown(pecaNome, clienteNome) {
    const c = window.currentCalculatedResults;
    const materialObj = materiais.find(m => m.id === c.material_id);
    const materialStr = materialObj ? `${materialObj.tipo} (${materialObj.marca})` : "Material não encontrado";
    const capex_manut = c.capex_base + c.manutencao;
    const lucro_real_150 = c.preco_150 - c.custo_total;
    const margem_150 = (lucro_real_150 / c.preco_150) * 100;
    const lucro_real_200 = c.preco_200 - c.custo_total;
    const margem_200 = (lucro_real_200 / c.preco_200) * 100;
    const multVal = c.complexidade === 2 ? "1.5" : c.complexidade === 3 ? configEngine.multiplicador_n3.toFixed(1) : "1.0";

    return `**Precificação — ${pecaNome}**\n\nCliente: ${clienteNome}\nMaterial: ${materialStr}\nPeso: ${c.peso}g\nTempo: ${c.tempo}h\nComplexidade: Nível ${c.complexidade}\n\n---\n\n### Tabela de custos\n| Descrição | Valor |\n| :--- | :--- |\n| Custo de material | ${Utils.formatCurrency(c.custo_material)} |\n| CAPEX (perda + manutenção) | ${Utils.formatCurrency(capex_manut)} |\n| Gasto com energia | ${Utils.formatCurrency(c.energia)} |\n| **Custo total de impressão** | **${Utils.formatCurrency(c.custo_total)}** |\n\n### Tabela de mão de obra\n| Descrição | Valor |\n| :--- | :--- |\n| Tempo | ${c.tempo}h |\n| Valor base/h | R$ ${configEngine.mao_obra_hora.toFixed(2)} |\n| Multiplicador | ${multVal} |\n| **Mão de obra total** | **${Utils.formatCurrency(c.mao_obra)}** |\n\n### Tabela de cenários de venda\n| Cenário | Preço final | Lucro total | Margem líquida |\n| :--- | :--- | :--- | :--- |\n| 150% | ${Utils.formatCurrency(c.preco_150)} | ${Utils.formatCurrency(lucro_real_150)} | ${margem_150.toFixed(2).replace('.', ',')}% |\n| 200% | ${Utils.formatCurrency(c.preco_200)} | ${Utils.formatCurrency(lucro_real_200)} | ${margem_200.toFixed(2).replace('.', ',')}% |`;
  },

  openTemplateModal() { document.getElementById('template-modal').classList.remove('hidden'); },
  closeTemplateModal() { document.getElementById('template-modal').classList.add('hidden'); },
  copyTemplate(tipo) {
    const preco = window.currentCalculatedResults?.preco_150 || 0;
    const nome = document.getElementById('calc-peca-nome').value || 'Peça';
    Templates.copyTemplate(tipo, preco, nome);
    this.closeTemplateModal();
  },

  // ---------- SALVAR E EDITAR ----------
  openSaveModal() {
    document.getElementById('modal-nome').value = document.getElementById('calc-peca-nome').value;
    document.getElementById('modal-cliente').value = document.getElementById('calc-cliente-nome').value;
    document.getElementById('modal-preco-real').value = document.getElementById('calc-preco-real-input').value;
    document.getElementById('modal-preview-custo').innerText = Utils.formatCurrency(window.currentCalculatedResults.custo_total);
    document.getElementById('modal-preview-venda').innerText = Utils.formatCurrency(window.currentCalculatedResults.preco_150);
    document.getElementById('save-modal').classList.remove('hidden');
  },
  closeSaveModal() { document.getElementById('save-modal').classList.add('hidden'); },
  copyPresetPrice() { document.getElementById('modal-preco-real').value = window.currentCalculatedResults.preco_150; },

  savePieceRecord() {
    const nome = document.getElementById('modal-nome').value.trim();
    const cliente = document.getElementById('modal-cliente').value.trim();
    let preco_real = parseFloat(document.getElementById('modal-preco-real').value);
    if (!nome || !cliente) return Utils.toast("Preencha nome e cliente.");
    if (isNaN(preco_real)) preco_real = window.currentCalculatedResults.preco_150;
    if (window.currentCalculatedResults.service_type === '3d' && window.currentCalculatedResults.tipo !== 'normal') preco_real = 0;
    const lucro_real = preco_real - window.currentCalculatedResults.custo_total;
    const margem = preco_real > 0 ? (lucro_real / preco_real) * 100 : 0;

    historico.unshift({
      id: Utils.generateId(),
      data: new Date().toISOString().split('T')[0],
      service_type: window.currentCalculatedResults.service_type,
      nome, cliente,
      material_id: window.currentCalculatedResults.material_id,
      peso: window.currentCalculatedResults.peso,
      tempo: window.currentCalculatedResults.tempo,
      tipo: window.currentCalculatedResults.tipo,
      complexidade: window.currentCalculatedResults.complexidade,
      custo_material: window.currentCalculatedResults.custo_material,
      capex: window.currentCalculatedResults.capex_base,
      energia: window.currentCalculatedResults.energia,
      manutencao: window.currentCalculatedResults.manutencao,
      custo_total: window.currentCalculatedResults.custo_total,
      mao_obra: window.currentCalculatedResults.mao_obra,
      preco_150: window.currentCalculatedResults.preco_150,
      preco_200: window.currentCalculatedResults.preco_200,
      preco_vendido: preco_real,
      lucro_real, margem
    });
    this.closeSaveModal();
    Utils.toast("Item salvo no Histórico!");
    scheduleSync();
    if (this.currentTab === 'historico') this.renderHistoryTable();
    if (this.currentTab === 'dashboard') Charts.updateDashboard();
  },

  openEditModal(id) {
    const record = historico.find(r => r.id === id);
    if (!record) return;
    document.getElementById('edit-id').value = record.id;
    document.getElementById('edit-nome').value = record.nome;
    document.getElementById('edit-cliente').value = record.cliente;
    document.getElementById('edit-preco-real').value = record.preco_vendido;
    document.getElementById('edit-modal').classList.remove('hidden');
  },
  closeEditModal() { document.getElementById('edit-modal').classList.add('hidden'); },

  saveEditRecord() {
    const id = document.getElementById('edit-id').value;
    const record = historico.find(r => r.id === id);
    if (!record) return;
    record.nome = document.getElementById('edit-nome').value.trim();
    record.cliente = document.getElementById('edit-cliente').value.trim();
    record.preco_vendido = parseFloat(document.getElementById('edit-preco-real').value) || record.preco_150;
    record.lucro_real = record.preco_vendido - record.custo_total;
    record.margem = record.preco_vendido > 0 ? (record.lucro_real / record.preco_vendido) * 100 : 0;
    this.closeEditModal();
    Utils.toast("Registro atualizado!");
    scheduleSync();
    this.renderHistoryTable();
    Charts.updateDashboard();
  },

  deleteRecord(id) {
    Utils.showConfirm("Remover Registro", "Deletar permanentemente?", () => {
      historico = historico.filter(item => item.id !== id);
      UI.renderHistoryTable();
      Utils.toast("Registro deletado.");
      scheduleSync();
    });
  },

  // ---------- HISTÓRICO ----------
  applyHistoryFilters() { this.renderHistoryTable(); },

  sortHistory(column) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortColumn = column; this.sortDirection = 'asc'; }
    this.renderHistoryTable();
  },

  renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    const emptyState = document.getElementById('history-empty-state');
    tbody.innerHTML = '';
    const searchQuery = document.getElementById('hist-search-client').value.toLowerCase();
    const filterPeriod = document.getElementById('hist-filter-period').value;
    const filterType = document.getElementById('hist-filter-type').value;

    let filtered = historico.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchQuery) || item.cliente.toLowerCase().includes(searchQuery);
      let matchesPeriod = true;
      if (filterPeriod === '7d') matchesPeriod = (Date.now() - new Date(item.data).getTime()) / 86400000 <= 7;
      else if (filterPeriod === '30d') matchesPeriod = (Date.now() - new Date(item.data).getTime()) / 86400000 <= 30;
      let matchesType = filterType === 'todos' || item.service_type === filterType;
      return matchesSearch && matchesPeriod && matchesType;
    });

    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (col === 'nome') return a.nome.localeCompare(b.nome) * dir;
      if (col === 'data') return (new Date(a.data) - new Date(b.data)) * dir;
      return (a[col] - b[col]) * dir;
    });

    if (filtered.length === 0) { emptyState.classList.remove('hidden'); return; }
    emptyState.classList.add('hidden');

    filtered.forEach(item => {
      const mat = materiais.find(m => m.id === item.material_id) || { tipo: "?", marca: "?" };
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors";

      // Coluna 1
      const td1 = document.createElement('td');
      td1.className = "px-6 py-4";
      const nomeDiv = document.createElement('div');
      nomeDiv.className = "font-bold text-slate-900 dark:text-slate-100";
      nomeDiv.textContent = item.nome;
      const clienteDataDiv = document.createElement('div');
      clienteDataDiv.className = "text-xs text-slate-400 mt-0.5";
      clienteDataDiv.textContent = `${item.cliente} • ${item.data}`;
      td1.appendChild(nomeDiv);
      td1.appendChild(clienteDataDiv);

      // Coluna 2
      const td2 = document.createElement('td');
      td2.className = "px-6 py-4";
      const infoMatDiv = document.createElement('div');
      infoMatDiv.className = "text-xs font-semibold flex items-center gap-1.5";
      const iconMat = document.createElement('i');
      iconMat.setAttribute('data-lucide', item.service_type === '3d' ? 'printer' : 'drafting-compass');
      iconMat.className = item.service_type === '3d' ? 'w-3.5 h-3.5 text-indigo-500' : 'w-3.5 h-3.5 text-emerald-400';
      infoMatDiv.appendChild(iconMat);
      const matText = document.createTextNode(` ${item.service_type === '3d' ? mat.tipo + ' - ' + mat.marca : 'Projeto / Engenharia'}`);
      infoMatDiv.appendChild(matText);
      
      const badgeDiv = document.createElement('div');
      badgeDiv.className = "mt-1";
      const badgeSpan = document.createElement('span');
      const typeBadge = item.service_type === 'projeto' ? 'Serviço Técnico' : item.tipo === 'normal' ? 'Produção' : item.tipo === 'brinde' ? 'Brinde' : 'Perdida';
      badgeSpan.className = `px-2 py-0.5 rounded text-[10px] font-bold ${
        typeBadge === 'Produção' ? 'bg-slate-100 text-slate-700' : 
        typeBadge === 'Brinde' ? 'bg-amber-100 text-amber-700' : 
        typeBadge === 'Perdida' ? 'bg-rose-100 text-rose-700' : 
        'bg-emerald-100 text-emerald-700'
      }`;
      badgeSpan.textContent = typeBadge;
      badgeDiv.appendChild(badgeSpan);
      td2.appendChild(infoMatDiv);
      td2.appendChild(badgeDiv);

      // Coluna 3
      const td3 = document.createElement('td');
      td3.className = "px-6 py-4 text-right";
      const pesoDiv = document.createElement('div');
      pesoDiv.className = "font-bold";
      pesoDiv.textContent = item.service_type === '3d' ? item.peso + 'g' : item.tempo + 'h';
      const subtipoDiv = document.createElement('div');
      subtipoDiv.className = "text-xs text-slate-400";
      subtipoDiv.textContent = item.service_type === '3d' ? item.tempo + 'h runtime' : 'Honorário Técnico';
      td3.appendChild(pesoDiv);
      td3.appendChild(subtipoDiv);

      // Coluna 4
      const td4 = document.createElement('td');
      td4.className = "px-6 py-4 text-right font-medium";
      td4.textContent = Utils.formatCurrency(item.custo_total);

      // Coluna 5
      const td5 = document.createElement('td');
      td5.className = "px-6 py-4 text-right font-bold";
      td5.textContent = Utils.formatCurrency(item.preco_vendido);

      // Coluna 6
      const td6 = document.createElement('td');
      td6.className = "px-6 py-4 text-right";
      const lucroDiv = document.createElement('div');
      lucroDiv.className = `font-extrabold ${item.lucro_real >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
      lucroDiv.textContent = Utils.formatCurrency(item.lucro_real);
      const margemDiv = document.createElement('div');
      margemDiv.className = "text-xs mt-0.5";
      const margemBadge = item.tipo === 'perdida' ? '-100% (Refação)' : item.tipo === 'brinde' ? `Custo ${Utils.formatCurrency(item.custo_total)}` : `${item.margem?.toFixed(1) || 0}% de Margem`;
      margemDiv.textContent = margemBadge;
      td6.appendChild(lucroDiv);
      td6.appendChild(margemDiv);

      // Coluna 7
      const td7 = document.createElement('td');
      td7.className = "px-6 py-4 text-center flex gap-1 justify-center";
      const editBtn = document.createElement('button');
      editBtn.className = "p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500";
      editBtn.setAttribute('onclick', `UI.openEditModal('${item.id}')`);
      const editIcon = document.createElement('i');
      editIcon.setAttribute('data-lucide', 'edit');
      editIcon.className = "w-4 h-4";
      editBtn.appendChild(editIcon);
      const deleteBtn = document.createElement('button');
      deleteBtn.className = "p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-slate-400 hover:text-rose-500";
      deleteBtn.setAttribute('onclick', `UI.deleteRecord('${item.id}')`);
      const deleteIcon = document.createElement('i');
      deleteIcon.setAttribute('data-lucide', 'trash-2');
      deleteIcon.className = "w-4 h-4";
      deleteBtn.appendChild(deleteIcon);
      td7.appendChild(editBtn);
      td7.appendChild(deleteBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tr.appendChild(td7);
      tbody.appendChild(tr);
    });
    lucide.createIcons();
  },

  // ---------- QUICK MODE & VALIDAÇÃO ----------
  toggleQuickMode() {
    document.getElementById('tab-precificar').classList.toggle('quick-mode');
  },

  validateField(el) {
    if (el.value && parseFloat(el.value) <= 0) el.classList.add('validation-error');
    else el.classList.remove('validation-error');
  },

  // ---------- IMPORTAR BACKUP ----------
  async importBackupFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const success = await Storage.importBackup(file);
    if (success) {
      UI.populateMaterialDropdowns();
      UI.renderMaterialsList();
      UI.renderHistoryTable();
      UI.fillConfigForm();
      UI.calculatePrice();
      Charts.updateDashboard();
      scheduleSync();
    }
    event.target.value = '';
  }
};