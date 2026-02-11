// Helper hook for theme detection
function useTheme() {
    const [theme, setTheme] = React.useState(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );

    React.useEffect(() => {
        const handleThemeChange = () => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        };
        window.addEventListener('theme-changed', handleThemeChange);
        return () => window.removeEventListener('theme-changed', handleThemeChange);
    }, []);

    return theme;
}

// Common Chart Options
function getChartOptions(theme, overrides = {}) {
    const isDark = theme === 'dark';
    const colors = window.getChartColors ? window.getChartColors(isDark) : (isDark ? {
        text: '#94a3b8', grid: '#334155', background: '#1e293b', 
        title: '#f8fafc', body: '#cbd5e1', border: '#334155'
    } : {
        text: '#64748b', grid: '#e2e8f0', background: '#ffffff',
        title: '#0f172a', body: '#334155', border: '#e2e8f0'
    });

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: colors.text }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: colors.background,
                titleColor: colors.text,
                bodyColor: colors.text,
                borderColor: colors.border,
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { display: false, color: colors.grid },
                ticks: { color: colors.text }
            },
            y: {
                beginAtZero: true,
                grid: { color: colors.grid },
                ticks: { color: colors.text }
            }
        },
        ...overrides
    };
}

// React 图表组件 - 按模型统计
function ModelChart({ timeRange }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const theme = useTheme();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchApi(`/api/stats/timeseries?range=${timeRange}`);
                const data = response.data;

                if (!chartRef.current) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const modelMap = {};
                data.forEach(item => {
                    if (!modelMap[item.model]) {
                        modelMap[item.model] = [];
                    }
                    modelMap[item.model].push({ hour: item.hour, count: item.count });
                });

                const hours = [...new Set(data.map(d => d.hour))].sort();
                const formattedLabels = hours.map(h => formatTimeLabel(h));

                const isDark = theme === 'dark';
                const colors = window.getChartColors ? window.getChartColors(isDark) : {};
                const chartColors = colors.palette || [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                ];
                
                const datasets = Object.keys(modelMap).map((model, idx) => {
                    const modelData = hours.map(hour => {
                        const found = modelMap[model].find(d => d.hour === hour);
                        return found ? found.count : 0;
                    });
                    const color = chartColors[idx % chartColors.length];
                    return {
                        label: model,
                        data: modelData,
                        backgroundColor: color + '40', // 25% opacity
                        borderColor: color,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    };
                });

                const options = getChartOptions(theme, {
                    scales: {
                        x: { stacked: true, grid: { display: false }, ticks: { color: colors.text } },
                        y: { stacked: true, beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.text } }
                    }
                });

                chartInstance.current = new Chart(chartRef.current, {
                    type: 'line',
                    data: { labels: formattedLabels, datasets },
                    options: options
                });
            } catch (e) {
                console.error('加载图表数据失败:', e);
            }
        };

        loadData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, theme]);

    return <canvas ref={chartRef} />;
}

// React 图表组件 - 成功率
function SuccessRateChart({ timeRange }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const theme = useTheme();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchApi(`/api/stats/success-rate?range=${timeRange}`);
                const data = response.data;

                if (!chartRef.current) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const successCount = data.successCount || 0;
                const failureCount = data.failureCount || 0;
                const total = successCount + failureCount;
                
                const isDark = theme === 'dark';
                const colors = window.getChartColors ? window.getChartColors(isDark) : {
                    success: '#10b981', danger: '#ef4444', border: isDark ? '#1e293b' : '#ffffff', text: '#64748b'
                };

                chartInstance.current = new Chart(chartRef.current, {
                    type: 'doughnut',
                    data: {
                        labels: ['成功', '失败'],
                        datasets: [{
                            data: [successCount, failureCount],
                            backgroundColor: [colors.success, colors.danger],
                            borderColor: colors.background || (isDark ? '#1e293b' : '#ffffff'),
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: colors.text }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.parsed;
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return `${context.label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            } catch (e) {
                console.error('加载图表数据失败:', e);
            }
        };

        loadData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, theme]);

    return <canvas ref={chartRef} />;
}

// React 图表组件 - Token趋势
function TokenTrendsChart({ timeRange }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const theme = useTheme();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchApi(`/api/stats/tokens?range=${timeRange}`);
                const data = response.data;

                if (!chartRef.current) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const hours = data.map(d => d.hour);
                const formattedLabels = hours.map(h => formatTimeLabel(h));
                const inputTokens = data.map(d => d.inputTokens || 0);
                const outputTokens = data.map(d => d.outputTokens || 0);

                const isDark = theme === 'dark';
                const colors = window.getChartColors ? window.getChartColors(isDark) : {
                     info: '#3b82f6', success: '#10b981', infoBg: '#3b82f640', successBg: '#10b98140'
                };
                
                // Fallback if Bg colors are missing in theme (should be there if Task 1.1 done correctly)
                const infoBg = colors.infoBg || (colors.info + '40');
                const successBg = colors.successBg || (colors.success + '40');

                const options = getChartOptions(theme);

                chartInstance.current = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: formattedLabels,
                        datasets: [
                            {
                                label: '输入 Tokens',
                                data: inputTokens,
                                borderColor: colors.info,
                                backgroundColor: infoBg,
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                yAxisID: 'y'
                            },
                            {
                                label: '输出 Tokens',
                                data: outputTokens,
                                borderColor: colors.success,
                                backgroundColor: successBg,
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                yAxisID: 'y'
                            }
                        ]
                    },
                    options: options
                });
            } catch (e) {
                console.error('加载图表数据失败:', e);
            }
        };

        loadData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, theme]);

    return <canvas ref={chartRef} />;
}

// React 图表组件 - Top账号
function TopAccountsChart({ timeRange }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const theme = useTheme();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchApi(`/api/stats/by-account?limit=10&range=${timeRange}`);
                const data = response.data;

                if (!chartRef.current) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const accounts = data.map(d => d.accountName);
                const counts = data.map(d => d.count);
                
                const isDark = theme === 'dark';
                const colors = window.getChartColors ? window.getChartColors(isDark) : {
                    text: isDark ? '#94a3b8' : '#64748b',
                    grid: isDark ? '#334155' : '#e2e8f0',
                    info: '#3b82f6'
                };

                const options = getChartOptions(theme, {
                    indexAxis: 'y',
                    scales: {
                        x: { beginAtZero: true, grid: { display: true, color: colors.grid }, ticks: { color: colors.text } },
                        y: { grid: { display: false }, ticks: { color: colors.text } }
                    }
                });

                chartInstance.current = new Chart(chartRef.current, {
                    type: 'bar',
                    data: {
                        labels: accounts,
                        datasets: [{
                            label: '请求次数',
                            data: counts,
                            backgroundColor: colors.info,
                            borderRadius: 6
                        }]
                    },
                    options: options
                });
            } catch (e) {
                console.error('加载图表数据失败:', e);
            }
        };

        loadData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, theme]);

    return <canvas ref={chartRef} />;
}

// React 图表组件 - API Key统计
function ApiKeyStatsChart({ timeRange }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const theme = useTheme();

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchApi(`/api/stats/by-api-key?limit=10&range=${timeRange}`);
                const data = response.data;

                if (!chartRef.current) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const isDark = theme === 'dark';
                const colors = window.getChartColors ? window.getChartColors(isDark) : {
                    text: isDark ? '#94a3b8' : '#64748b',
                    grid: isDark ? '#334155' : '#e2e8f0',
                    info: '#3b82f6',
                    success: '#22c55e',
                    border: isDark ? '#334155' : '#e5e7eb'
                };

                if (!data || data.length === 0) {
                    chartInstance.current = new Chart(chartRef.current, {
                        type: 'bar',
                        data: {
                            labels: ['暂无数据'],
                            datasets: [{
                                label: '请求数',
                                data: [0],
                                backgroundColor: colors.border
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                x: { display: false },
                                y: { display: false }
                            }
                        }
                    });
                    return;
                }

                const labels = data.map(d => {
                    if (d.apiKey) return d.apiKey;
                    if (d.apiKeyValue) return d.apiKeyValue.substring(0, 12) + '...';
                    return '未命名密钥';
                });
                const requestCounts = data.map(d => d.count || 0);
                const successRates = data.map(d => {
                    const total = d.count || 0;
                    const success = d.successCount || 0;
                    return total > 0 ? ((success / total) * 100).toFixed(1) : 0;
                });

                const options = getChartOptions(theme, {
                    scales: {
                        x: { grid: { display: false }, ticks: { color: colors.text } },
                        y: { type: 'linear', display: true, position: 'left', beginAtZero: true, title: { display: true, text: '请求数', color: colors.text }, grid: { color: colors.grid }, ticks: { color: colors.text } },
                        y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 100, title: { display: true, text: '成功率 (%)', color: colors.text }, grid: { drawOnChartArea: false }, ticks: { color: colors.text } }
                    }
                });

                chartInstance.current = new Chart(chartRef.current, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: '请求数',
                                data: requestCounts,
                                backgroundColor: colors.info + 'CC', // 0.8 alpha
                                borderColor: colors.info,
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: '成功率 (%)',
                                data: successRates,
                                backgroundColor: colors.success + 'CC', // 0.8 alpha
                                borderColor: colors.success,
                                borderWidth: 1,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: options
                });
            } catch (e) {
                console.error('加载图表数据失败:', e);
            }
        };

        loadData();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange, theme]);

    return <canvas ref={chartRef} />;
}

// Export components to window
window.ModelChart = ModelChart;
window.SuccessRateChart = SuccessRateChart;
window.TokenTrendsChart = TokenTrendsChart;
window.TopAccountsChart = TopAccountsChart;
window.ApiKeyStatsChart = ApiKeyStatsChart;