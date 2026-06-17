const Templates = {
  getMessages(preco, nomePeca) {
    const valor = Utils.formatCurrency(preco);
    const autor = configEngine.autor_nome || 'Felipe Sant\'Oliver';
    return {
      whatsapp: `Olá! Segue o orçamento da peça *${nomePeca}*: ${valor}. Prazo de entrega de X dias. Podemos ajustar se necessário.`,
      email: `Prezado cliente,\n\nSegue o orçamento para o item "${nomePeca}":\n\nValor: ${valor}\nPrazo: a combinar.\n\nAtenciosamente,\n${autor}`,
      simples: `Orçamento: ${valor}`
    };
  },

  copyTemplate(tipo, preco, nomePeca) {
    const msgs = this.getMessages(preco, nomePeca);
    const text = msgs[tipo] || msgs.simples;
    navigator.clipboard.writeText(text).then(() => Utils.toast('Mensagem copiada!'));
  }
};