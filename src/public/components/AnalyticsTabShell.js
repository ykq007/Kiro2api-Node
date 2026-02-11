window.AnalyticsTabShell = function AnalyticsTabShell() {
    return (
        <div id="tab-analytics" className="p-6 tab-content hidden">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">数据分析</h2>
            </div>
            <div id="analytics-dashboard"></div>
        </div>
    );
};
