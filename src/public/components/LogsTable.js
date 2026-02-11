window.LogsTable = function(props) {
    if (!props.logs || props.logs.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">暂无请求记录</h3>
            </div>
        );
    }

    const ModelTag = ({ model, upstreamModel }) => {
        if (!model) return <span>-</span>;
        
        if (!upstreamModel || model === upstreamModel) {
            return <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{model}</span>;
        }

        return (
            <div className="group relative inline-block">
                <Badge variant="blue" className="cursor-help font-mono">{model}</Badge>
                <div className="invisible group-hover:visible absolute z-50 w-48 px-3 py-2 text-xs text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg left-full ml-2 top-1/2 -translate-y-1/2 whitespace-normal border border-slate-700 dark:border-slate-600">
                    <div className="font-semibold mb-1 text-slate-300">上游模型（Kiro）：</div>
                    <div className="font-mono text-white">{upstreamModel}</div>
                    <div className="absolute w-2 h-2 bg-slate-800 dark:bg-slate-700 border-l border-b border-slate-700 dark:border-slate-600 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                </div>
            </div>
        );
    };

    const MobileCard = ({ log }) => (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(log.timestamp).toLocaleString()}
                </div>
                {log.success ? (
                    <Badge variant="success">成功</Badge>
                ) : (
                    <Badge variant="error">失败</Badge>
                )}
            </div>
            
            <div className="mb-3 flex flex-wrap gap-2 items-center">
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{log.accountName}</div>
                {log.stream === 1 ? <Badge variant="blue">流式</Badge> : <Badge variant="neutral">非流式</Badge>}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-3 mb-3 text-xs space-y-2">
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">模型:</span>
                    <ModelTag model={log.model} upstreamModel={log.upstreamModel} />
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">密钥:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{log.apiKeyName || '--'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">耗时:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{log.durationMs}ms</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-500 dark:text-slate-400 mb-1">输入 Tokens</div>
                    <div className="font-mono font-medium text-slate-700 dark:text-slate-200">{log.inputTokens || 0}</div>
                </div>
                <div className="text-center p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-500 dark:text-slate-400 mb-1">输出 Tokens</div>
                    <div className="font-mono font-medium text-slate-700 dark:text-slate-200">{log.outputTokens || 0}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">时间</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">账号</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">类型</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">模型</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">密钥</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">输入</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">输出</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">耗时</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                        {props.logs.map((l, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(l.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                    {l.accountName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {l.stream === 1 ? <Badge variant="blue">流式</Badge> : <Badge variant="neutral">非流式</Badge>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ModelTag model={l.model} upstreamModel={l.upstreamModel} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {l.apiKeyName || '--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    {l.inputTokens || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    {l.outputTokens || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    {l.durationMs}ms
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {l.success ? (
                                        <Badge variant="success">成功</Badge>
                                    ) : (
                                        <Badge variant="error">失败</Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {props.logs.map((l, i) => <MobileCard key={i} log={l} />)}
            </div>
        </div>
    );
};