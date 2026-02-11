window.LogsToolbar = function(props) {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">请求记录</h2>
                <div className="flex gap-3 items-center">
                    <button onClick={props.onRefresh} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 transition">刷新</button>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={props.autoRefresh}
                            onChange={props.onToggleAutoRefresh}
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">自动刷新</span>
                    </label>
                </div>
            </div>
            <div id="logs-table" className="overflow-x-auto"></div>
            
            {/* 分页器 */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">共 {props.totalRecords} 条记录</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">每页显示：</span>
                        <select 
                            value={props.pageSize}
                            onChange={(e) => props.onPageSizeChange(Number(e.target.value))}
                            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => props.onPageChange(-1)}
                        disabled={props.currentPage <= 1}
                        className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        上一页
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">第 {props.currentPage} 页 / 共 {props.totalPages} 页</span>
                    <button 
                        onClick={() => props.onPageChange(1)}
                        disabled={props.currentPage >= props.totalPages}
                        className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </>
    );
};
