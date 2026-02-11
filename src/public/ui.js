// Toast 通知和模态框管理

window.showToast = function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const config = {
        success: { icon: '<svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>', border: 'border-emerald-200 dark:border-emerald-800' },
        error: { icon: '<svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>', border: 'border-rose-200 dark:border-rose-800' },
        warning: { icon: '<svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>', border: 'border-amber-200 dark:border-amber-800' },
        info: { icon: '<svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', border: 'border-blue-200 dark:border-blue-800' }
    };

    const style = config[type] || config.info;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg shadow-lg border ${style.border} animate-slideInRight min-w-[300px] pointer-events-auto select-none`;
    toast.innerHTML = `
        <div class="flex-shrink-0">${style.icon}</div>
        <div class="text-sm font-medium text-slate-900 dark:text-white">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.animation = 'slideOut 0.3s forwards'; 
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
}

function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
}