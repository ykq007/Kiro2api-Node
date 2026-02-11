window.CreateApiKeyModal = function CreateApiKeyModal() {
    return (
        <div id="createApiKeyModal" className="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 animate-scaleIn">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">创建 API 密钥</h3>
                    <button onClick={() => hideModal('createApiKeyModal')} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" id="api-key-name" placeholder="密钥名称（可选）" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
                    <div id="generated-key-display" className="hidden">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">密钥已生成，请妥善保存：</p>
                        <div className="flex gap-2">
                            <input type="text" id="generated-key-value" readOnly className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white" />
                            <button onClick={() => copyGeneratedKey()} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">复制</button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
                    <button id="cancel-key-btn" onClick={() => hideModal('createApiKeyModal')} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">取消</button>
                    <button id="create-key-btn" onClick={() => createApiKey()} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">创建</button>
                    <button id="confirm-key-btn" onClick={() => hideModal('createApiKeyModal')} className="hidden px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">确认</button>
                </div>
            </div>
        </div>
    );
};
