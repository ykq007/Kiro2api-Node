window.Badge = function({ children, variant = 'neutral', className = '' }) {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        error: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        neutral: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };

    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
    
    return (
        <span className={`${baseClass} ${variants[variant] || variants.neutral} ${className}`}>
            {children}
        </span>
    );
};
