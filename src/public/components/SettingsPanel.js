window.SettingsPanel = function(props) {
    const subTabs = [
        { id: 'general', label: '常规设置' },
        { id: 'models', label: '模型管理' },
        { id: 'mappings', label: '模型映射' }
    ];

    return (
        <>
            {/* 子标签导航 */}
            <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
                <nav className="flex space-x-8">
                    {subTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => props.onSubTabChange(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                props.activeSubTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* 常规设置 */}
            <div className={`settings-content ${props.activeSubTab !== 'general' ? 'hidden' : ''}`}>
                <div className="max-w-3xl space-y-8">
                    {/* API 端点信息 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">API 端点</h3>
                        <div className="mb-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Anthropic 格式</p>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="success">GET</Badge>
                                    <span className="text-slate-700 dark:text-slate-300">/v1/models</span>
                                    <button onClick={() => copyText(location.origin + '/v1/models')} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 text-xs">复制</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="blue">POST</Badge>
                                    <span className="text-slate-700 dark:text-slate-300">/v1/messages</span>
                                    <button onClick={() => copyText(location.origin + '/v1/messages')} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 text-xs">复制</button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Base URL: <span className="text-slate-700 dark:text-slate-300 select-all">{props.baseUrl}</span></p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">管理密钥</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">用于登录管理面板</p>
                        <div className="flex gap-3">
                            <input type="password" id="new-admin-key" placeholder="输入新的管理密钥" className="flex-1 max-w-xs px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
                            <Button onClick={props.onChangeAdminKey}>修改密钥</Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">API 密钥</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">用于 API 调用认证，支持多个</p>
                        <div className="flex gap-3 mb-4">
                            <Button variant="success" onClick={props.onCreateApiKey}>创建密钥</Button>
                            <Button variant="secondary" onClick={props.onLoadApiKeys}>刷新</Button>
                        </div>
                        <div id="api-keys-list"></div>
                    </div>
                </div>
            </div>

            {/* 模型管理 */}
            <div className={`settings-content ${props.activeSubTab !== 'models' ? 'hidden' : ''}`}>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">模型列表</h3>
                    <div className="flex gap-2">
                        <Button variant="success" onClick={props.onAddModel}>添加模型</Button>
                        <Button variant="secondary" onClick={props.onResetModels}>重置默认</Button>
                        <Button variant="ghost" onClick={props.onLoadModels}>刷新</Button>
                    </div>
                </div>
                <div id="models-table" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"></div>
            </div>

            {/* 模型映射 */}
            <div className={`settings-content ${props.activeSubTab !== 'mappings' ? 'hidden' : ''}`}>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">映射规则</h3>
                    <div className="flex gap-2">
                        <Button variant="success" onClick={props.onAddMapping}>添加映射</Button>
                        <Button variant="secondary" onClick={props.onResetMappings}>重置默认</Button>
                        <Button variant="ghost" onClick={props.onLoadMappings}>刷新</Button>
                    </div>
                </div>
                <div id="mappings-table" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"></div>
            </div>
        </>
    );
};