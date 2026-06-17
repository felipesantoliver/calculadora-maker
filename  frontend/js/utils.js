const Utils = {
  toast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  },

  showConfirm(title, message, onConfirm) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    window._confirmCallback = onConfirm;
    document.getElementById('confirm-modal').classList.remove('hidden');
  },

  ceilToHalfReal(val) {
    return Math.ceil(val / 0.5) * 0.5;
  },

  formatCurrency(val) {
    return 'R$ ' + val.toFixed(2).replace('.', ',');
  },

  validateField(el) {
    if (!el.checkValidity()) {
      el.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
    } else {
      el.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500');
    }
  },

  generateId() {
    return 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }
};