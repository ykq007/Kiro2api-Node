// React 图表容器组件
function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = React.useState('24h');

    const timeRanges = [
        { value: '24h', label: '24小时' },
        { value: '7d', label: '7天' }
    ];

    return (
        <div>
            {/* 时间范围选择器 */}
            <div className="flex justify-end mb-6 space-x-2">
                {timeRanges.map(range => (
                    <button
                        key={range.value}
                        onClick={() => setTimeRange(range.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            timeRange === range.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* 图表网格 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 按模型统计 */}
                <Card title="按模型统计">
                    <div className="h-80">
                        <ModelChart timeRange={timeRange} />
                    </div>
                </Card>

                {/* 成功率 */}
                <Card title="请求成功率">
                    <div className="h-80">
                        <SuccessRateChart timeRange={timeRange} />
                    </div>
                </Card>

                {/* Token消耗趋势 */}
                <Card title="Token 消耗趋势">
                    <div className="h-80">
                        <TokenTrendsChart timeRange={timeRange} />
                    </div>
                </Card>

                {/* Top账号 */}
                <Card title="Top 10 账号">
                    <div className="h-80">
                        <TopAccountsChart timeRange={timeRange} />
                    </div>
                </Card>

                {/* API Key统计 */}
                <div className="lg:col-span-2">
                    <Card title="API Key 统计">
                        <div className="h-80">
                            <ApiKeyStatsChart timeRange={timeRange} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}