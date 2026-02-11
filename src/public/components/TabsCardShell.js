window.TabsCardShell = function TabsCardShell() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-colors duration-200">
            <div id="main-tabs"></div>
            <AccountsTabShell />
            <LogsTabShell />
            <AnalyticsTabShell />
            <SettingsTabShell />
        </div>
    );
};