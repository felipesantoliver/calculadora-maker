const Templates = {
  getMessages(preco, nomePeca) {
    const valor = Utils.formatCurrency(preco);
    return {
      whatsapp: `Olá! Segue o orçamento da peça *${nomePeca}*: ${valor}. Prazo de entrega de X dias. Podemos ajustar se necessário.`,
      email: `Prezado cliente,\n\nSegue o orçamento para o item "${nomePeca}":\n\nValor: ${valor}\nPrazo: a combinar.\n\nAtenciosamente,\nFelipe Sant'Oliver`,
      simples: `Orçamento: ${valor}`
    };
  },

  copyTemplate(tipo, preco, nomePeca) {
    const msgs = this.getMessages(preco, nomePeca);
    const text = msgs[tipo] || msgs.simples;
    navigator.clipboard.writeText(text).then(() => Utils.toast('Mensagem copiada!'));
  }
};