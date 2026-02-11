window.AccountsTable = function(props) {
    if (!props.accounts || props.accounts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">暂无账号</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">点击上方按钮添加新的账号</p>
            </div>
        );
    }

    const getStatusVariant = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'cooldown': return 'warning';
            case 'invalid': return 'error';
            case 'disabled': return 'neutral';
            default: return 'neutral';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: '活跃',
            cooldown: '冷却中',
            invalid: '失效',
            disabled: '已禁用'
        };
        return labels[status] || status;
    };

    // Mobile Card View
    const MobileCard = ({ account }) => (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={props.selectedAccounts.has(account.id)}
                        onChange={(e) => props.onToggleSelect(account.id, e.target.checked)} 
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800"
                    />
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">{account.name}</div>
                        {account.usage?.userEmail && <div className="text-xs text-slate-500 dark:text-slate-400">{account.usage.userEmail}</div>}
                    </div>
                </div>
                <Badge variant={getStatusVariant(account.status)}>{getStatusLabel(account.status)}</Badge>
            </div>
            
            <div className="mb-4">
                <ProgressBar 
                    value={account.usage?.currentUsage || 0} 
                    max={account.usage?.usageLimit || 0} 
                    label="额度使用"
                    sublabel={`${(account.usage?.available || 0).toFixed(1)} / ${(account.usage?.usageLimit || 0).toFixed(0)}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-500 dark:text-slate-400 text-xs">请求数</div>
                    <div className="font-medium text-slate-900 dark:text-white">{account.requestCount}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-500 dark:text-slate-400 text-xs">错误数</div>
                    <div className="font-medium text-slate-900 dark:text-white">{account.errorCount}</div>
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => props.onRefreshUsage(account.id)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                >
                </Button>
                {account.status === 'disabled' ? (
                    <Button variant="success" size="sm" onClick={() => props.onEnable(account.id)}>启用</Button>
                ) : (
                    <Button variant="secondary" size="sm" onClick={() => props.onDisable(account.id)}>禁用</Button>
                )}
                <Button variant="danger" size="sm" onClick={() => props.onRemove(account.id)}>删除</Button>
            </div>
        </div>
    );

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">
                                <input
                                    type="checkbox"
                                    checked={props.accounts.length > 0 && props.accounts.every(a => props.selectedAccounts.has(a.id))}
                                    onChange={(e) => props.onSelectAll(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">账号信息</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">额度使用</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">统计</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                        {props.accounts.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={props.selectedAccounts.has(a.id)}
                                        onChange={(e) => props.onToggleSelect(a.id, e.target.checked)} 
                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{a.name}</div>
                                        {a.usage?.userEmail && <div className="text-xs text-slate-500 dark:text-slate-400">{a.usage.userEmail}</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={getStatusVariant(a.status)}>{getStatusLabel(a.status)}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-full max-w-xs">
                                        <ProgressBar 
                                            value={a.usage?.currentUsage || 0} 
                                            max={a.usage?.usageLimit || 0} 
                                            sublabel={`${(a.usage?.available || 0).toFixed(1)} / ${(a.usage?.usageLimit || 0).toFixed(0)}`}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex gap-3">
                                        <span title="请求数">Req: {a.requestCount}</span>
                                        <span title="错误数" className={a.errorCount > 0 ? "text-rose-500" : ""}>Err: {a.errorCount}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => props.onRefreshUsage(a.id)}
                                            title="刷新额度"
                                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                                        >
                                        </Button>
                                        {a.status === 'disabled' ? (
                                            <Button variant="success" size="xs" onClick={() => props.onEnable(a.id)}>启用</Button>
                                        ) : (
                                            <Button variant="secondary" size="xs" onClick={() => props.onDisable(a.id)}>禁用</Button>
                                        )}
                                        <Button variant="ghost" size="xs" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => props.onRemove(a.id)}>删除</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden">
                {props.accounts.map(a => <MobileCard key={a.id} account={a} />)}
            </div>
        </div>
    );
};