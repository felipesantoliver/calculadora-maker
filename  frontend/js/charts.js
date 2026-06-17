let financeChart, typeChart, marginChart;

const Charts = {
  updateDashboard() {
    const filterPeriod = document.getElementById('dash-filter-period').value;
    const filterType = document.getElementById('dash-filter-type').value;
    const filterMonth = document.getElementById('dash-filter-month').value;
    const filterYear = document.getElementById('dash-filter-year').value;

    const filtered = historico.filter(item => {
      let matchesPeriod = true;
      const itemDate = new Date(item.data);
      if (filterPeriod === '7d') {
        const diffDays = (Date.now() - itemDate.getTime()) / 86400000;
        matchesPeriod = diffDays <= 7;
      } else if (filterPeriod === '30d') {
        const diffDays = (Date.now() - itemDate.getTime()) / 86400000;
        matchesPeriod = diffDays <= 30;
      } else if (filterPeriod === 'mes' && filterMonth) {
        const [ano, mes] = filterMonth.split('-').map(Number);
        matchesPeriod = itemDate.getFullYear() === ano && itemDate.getMonth() === mes - 1;
      } else if (filterPeriod === 'ano' && filterYear) {
        matchesPeriod = itemDate.getFullYear() === parseInt(filterYear);
      }
      let matchesType = filterType === 'todos' || item.service_type === filterType;
      return matchesPeriod && matchesType;
    });

    let lucroTotal = 0, somaMargens = 0, itensMargem = 0, countPerdidas = 0;
    filtered.forEach(item => {
      if (item.tipo === 'perdida') {
        countPerdidas++;
        lucroTotal -= item.custo_total;
      } else if (item.tipo === 'brinde') {
        lucroTotal -= item.custo_total;
      } else {
        lucroTotal += item.lucro_real;
        somaMargens += item.margem;
        itensMargem++;
      }
    });
    const margemMedia = itensMargem > 0 ? somaMargens / itensMargem : 0;
    const taxaErro = filtered.length > 0 ? (countPerdidas / filtered.length) * 100 : 0;

    document.getElementById('kpi-lucro-total').innerText = (lucroTotal >= 0 ? 'R$ ' : '-R$ ') + Math.abs(lucroTotal).toFixed(2);
    document.getElementById('kpi-margem-media').innerText = margemMedia.toFixed(1) + '%';
    document.getElementById('kpi-pecas-perdidas').innerText = taxaErro.toFixed(1) + '%';

    // Preparar dados
    const datasMap = {};
    const margensPorData = {};
    filtered.forEach(item => {
      if (!datasMap[item.data]) datasMap[item.data] = { receita: 0, lucro: 0 };
      if (!margensPorData[item.data]) margensPorData[item.data] = { total: 0, count: 0 };

      if (item.tipo === 'normal' || item.service_type === 'projeto') {
        datasMap[item.data].receita += item.preco_vendido;
        datasMap[item.data].lucro += item.lucro_real;
      } else {
        datasMap[item.data].lucro -= item.custo_total;
      }
      if (item.tipo === 'normal' || item.service_type === 'projeto') {
        margensPorData[item.data].total += item.margem;
        margensPorData[item.data].count++;
      }
    });

    const sortedDates = Object.keys(datasMap).sort();
    const receitas = sortedDates.map(d => datasMap[d].receita);
    const lucros = sortedDates.map(d => datasMap[d].lucro);
    const margensMedias = sortedDates.map(d => {
      const m = margensPorData[d];
      return m && m.count > 0 ? m.total / m.count : null;
    });

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#f1f5f9';
    const labelColor = isDark ? '#94a3b8' : '#475569';

    // Atualizar gráfico financeiro
    if (financeChart) {
      financeChart.data.labels = sortedDates.map(d => d.split('-').reverse().slice(0,2).join('/'));
      financeChart.data.datasets[0].data = receitas;
      financeChart.data.datasets[1].data = lucros;
      financeChart.data.datasets[2].data = margensMedias;
      financeChart.update();
    } else {
      const ctx = document.getElementById('financeChart').getContext('2d');
      financeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates.map(d => d.split('-').reverse().slice(0,2).join('/')),
          datasets: [
            { label: 'Faturamento (R$)', data: receitas, borderColor: '#4f46e5', tension: 0.3, fill: true, backgroundColor: 'rgba(79,70,229,0.1)' },
            { label: 'Lucro (R$)', data: lucros, borderColor: '#10b981', tension: 0.3, fill: true, backgroundColor: 'rgba(16,185,129,0.1)' },
            { label: 'Margem Média (%)', data: margensMedias, borderColor: '#f59e0b', borderDash: [5,5], tension: 0.3, fill: false, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: labelColor } },
            y1: { position: 'right', beginAtZero: true, max: 100, grid: { display: false }, ticks: { color: '#f59e0b', callback: v => v + '%' } },
            x: { grid: { display: false }, ticks: { color: labelColor } }
          },
          plugins: { legend: { labels: { color: labelColor } } }
        }
      });
    }

    // Gráfico de pizza (categoria)
    let fat3d = 0, fatProj = 0;
    filtered.forEach(item => {
      if (item.service_type === '3d') fat3d += item.preco_vendido;
      else fatProj += item.preco_vendido;
    });
    if (typeChart) {
      typeChart.data.datasets[0].data = [fat3d, fatProj];
      typeChart.update();
    } else {
      const ctx2 = document.getElementById('typeChart').getContext('2d');
      typeChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Impressão 3D', 'Projetos'],
          datasets: [{ data: [fat3d, fatProj], backgroundColor: ['#6366f1', '#10b981'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: labelColor } } }, cutout: '65%' }
      });
    }
  }
};