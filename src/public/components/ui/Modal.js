window.Modal = function({ id, title, children, footer, onClose, maxWidth = 'max-w-md' }) {
    return (
        <div id={id} className="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                
                <div className="fixed inset-0 bg-slate-500/75 dark:bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => onClose && onClose()}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className={`inline-block align-bottom bg-white dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${maxWidth} border border-slate-200 dark:border-slate-800 animate-scaleIn`}>
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-semibold text-slate-900 dark:text-white" id="modal-title">
                            {title}
                        </h3>
                        {onClose && (
                            <button 
                                onClick={onClose} 
                                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    <div className="px-6 py-5">
                        {children}
                    </div>

                    {footer && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
