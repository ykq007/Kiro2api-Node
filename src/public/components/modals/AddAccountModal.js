window.AddAccountModal = function AddAccountModal() {
    return (
        <Modal 
            id="addModal" 
            title="添加账号" 
            onClose={() => hideModal('addModal')}
            footer={
                <>
                    <Button variant="secondary" onClick={() => hideModal('addModal')}>取消</Button>
                    <Button variant="primary" onClick={() => addAccount()}>添加</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="acc-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">账号名称</label>
                    <input type="text" id="acc-name" placeholder="例如：Claude Pro" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
                </div>
                
                <div>
                    <label htmlFor="acc-auth" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">认证方式</label>
                    <select id="acc-auth" onChange={() => toggleIdcFields()} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white">
                        <option value="social">Social Login (Google/Email)</option>
                        <option value="idc">IdC / BuilderId</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="acc-refresh" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Refresh Token</label>
                    <textarea id="acc-refresh" placeholder="输入 sk-ant-sid-01..." rows="3" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"></textarea>
                </div>

                <div id="idc-fields" className="hidden space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <label htmlFor="acc-client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client ID</label>
                        <input type="text" id="acc-client-id" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="acc-client-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Secret</label>
                        <textarea id="acc-client-secret" rows="2" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-white font-mono text-sm"></textarea>
                    </div>
                </div>
            </div>
        </Modal>
    );
};