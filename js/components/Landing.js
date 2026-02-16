const Landing = ({ onLogin }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdfbf7] dark:bg-[#0c0c0c] p-6 relative overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="max-w-md w-full flex flex-col items-center">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
                    <img src="sagak_icon.png" className="w-20 h-20 rounded-[20px] shadow-2xl" alt="Sagak Studio" />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">사각, 생각의 소리</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-zinc-500">흩어진 문장들이 모여 하나의 세계가 되는 곳.<br/>오직 당신의 이야기에만 집중하세요.</p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="w-full px-4">
                    <button onClick={onLogin} className="w-full py-4 border border-slate-300 dark:border-zinc-800 rounded-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-3">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/></svg>
                        <span>구글 계정으로 입장하기</span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};