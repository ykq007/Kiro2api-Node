window.ProgressBar = function({ value, max, label, sublabel, showPercentage = true }) {
    const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    
    let colorClass = 'bg-emerald-500';
    if (percentage > 90) colorClass = 'bg-rose-500';
    else if (percentage > 75) colorClass = 'bg-amber-500';

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col">
                    {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
                    {sublabel && <span className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</span>}
                </div>
                {showPercentage && (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {percentage}%
                    </span>
                )}
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};
