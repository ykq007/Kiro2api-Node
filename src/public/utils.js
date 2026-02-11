// 工具函数

function formatUptime(secs) {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${secs % 60}s`;
}

function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

function formatStatus(status) {
    const styles = { active: 'bg-green-100 text-green-700', cooldown: 'bg-yellow-100 text-yellow-700', invalid: 'bg-red-100 text-red-700', disabled: 'bg-slate-100 text-slate-700' };
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.disabled}">${status}</span>`;
}

function formatUsage(usage) {
    if (!usage) return '<span class="text-slate-400 text-sm">未知</span>';
    if (usage.error) return `<span class="text-red-500 text-sm" title="${usage.error}">错误</span>`;
    const used = usage.currentUsage || 0, limit = usage.usageLimit || 0, available = usage.available || 0;
    const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;
    const barColor = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500';
    const textColor = percent > 90 ? 'text-red-600' : percent > 70 ? 'text-yellow-600' : 'text-green-600';
    return `<div class="w-32"><div class="flex justify-between text-xs mb-1"><span class="${textColor} font-medium">${available.toFixed(1)}</span><span class="text-slate-400">/ ${limit.toFixed(0)}</span></div><div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="${barColor} h-full rounded-full transition-all" style="width: ${percent}%"></div></div><div class="text-xs text-slate-400 mt-1">${percent}% 已用</div></div>`;
}

function formatModelDisplay(model, upstreamModel) {
    if (!model) return '-';

    // 如果没有上游模型或两者相同，只显示一个
    if (!upstreamModel || model === upstreamModel) {
        return `<span class="text-slate-700 dark:text-slate-300">${model}</span>`;
    }

    // 如果不同，显示带 tooltip 的 tag
    return `
        <div class="group relative inline-block">
            <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 cursor-help border border-blue-200">
                ${model}
            </span>
            <div class="invisible group-hover:visible absolute z-10 w-48 px-3 py-2 text-xs text-white bg-slate-900 rounded-lg shadow-lg left-full ml-2 top-1/2 -translate-y-1/2 whitespace-normal">
                <div class="font-semibold mb-1">上游模型（Kiro）：</div>
                <div class="font-mono">${upstreamModel}</div>
                <div class="absolute w-2 h-2 bg-slate-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
            </div>
        </div>
    `;
}

function formatTimeLabel(timeStr) {
    // 格式化时间标签
    // 24小时格式: "2026-02-04 10:00:00" -> "10:00"
    // 7天格式: "2026-02-04" -> "02-04"
    if (timeStr.includes(':')) {
        // 24小时格式，提取小时
        const hour = timeStr.split(' ')[1].split(':')[0];
        return `${parseInt(hour)}:00`;
    } else {
        // 7天格式，提取月-日
        const parts = timeStr.split('-');
        return `${parts[1]}-${parts[2]}`;
    }
}

function maskKey(key) {
    if (!key || key.length <= 8) return key;
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

// Chart Colors Theme Configuration
const ChartTheme = {
    light: {
        text: '#64748b', // slate-500
        grid: '#e2e8f0', // slate-200
        primary: '#4f46e5', // indigo-600
        primaryBg: '#4f46e540',
        success: '#059669', // emerald-600
        successBg: '#05966940',
        danger: '#e11d48', // rose-600
        dangerBg: '#e11d4840',
        warning: '#d97706', // amber-600
        info: '#2563eb', // blue-600
        background: '#ffffff',
        border: '#e2e8f0', // slate-200
        palette: ['#4f46e5', '#059669', '#d97706', '#e11d48', '#8b5cf6', '#db2777', '#0d9488', '#ea580c']
    },
    dark: {
        text: '#94a3b8', // slate-400
        grid: '#334155', // slate-700
        primary: '#6366f1', // indigo-500
        primaryBg: '#6366f140',
        success: '#10b981', // emerald-500
        successBg: '#10b98140',
        danger: '#f43f5e', // rose-500
        dangerBg: '#f43f5e40',
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
        background: '#0f172a', // slate-900
        border: '#1e293b', // slate-800
        palette: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c']
    }
};

window.getChartColors = function(isDark) {
    return isDark ? ChartTheme.dark : ChartTheme.light;
};

// Dark Mode Logic
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
    window.dispatchEvent(new Event('theme-changed'));
}
