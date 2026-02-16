const { useState } = React;
const { motion } = window.Motion;

const PomodoroTimer = ({
    minutes, setMinutes,
    seconds, setSeconds,
    isActive, setIsActive,
    initialTotal, setInitialTotal,
    remaining, setRemaining,
    isSetting, setIsSetting,
    showToast
}) => {
    const start = () => {
        if (remaining <= 0) return;
        setIsActive(true);
    };
    const stop = () => setIsActive(false);
    const reset = () => {
        setIsActive(false);
        setRemaining(initialTotal);
    };

    const handleSetTime = () => {
        const total = minutes * 60 + seconds;
        if (total > 0) {
            setInitialTotal(total);
            setRemaining(total);
            setIsSetting(false);
        } else {
            showToast("시간을 설정하세요", "error");
        }
    };

    const format = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-darkpanel border border-slate-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden w-52 mt-2 pointer-events-auto"
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-700 rounded-full animate-pulse"></span>
                        뽀모도로 타이머
                    </span>
                    <button onClick={() => setIsSetting(!isSetting)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                        <IconSettings className="w-3.5 h-3.5" />
                    </button>
                </div>

                {isSetting ? (
                    <div className="space-y-4 py-1">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase">분</label>
                                <input type="number" value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)} className="w-full p-2 text-sm font-black bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded outline-none focus:border-indigo-500 dark:text-zinc-200" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase">초</label>
                                <input type="number" value={seconds} onChange={e => setSeconds(parseInt(e.target.value) || 0)} className="w-full p-2 text-sm font-black bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded outline-none focus:border-indigo-500 dark:text-zinc-200" />
                            </div>
                        </div>
                        <button onClick={handleSetTime} className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-black rounded hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">적용하기</button>
                    </div>
                ) : (
                    <>
                        <div className="relative w-32 h-32 mx-auto my-2">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-zinc-800" />
                                <circle
                                    cx="50" cy="50" r="22.5"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="45"
                                    strokeDasharray={2 * Math.PI * 22.5}
                                    style={{
                                        strokeDashoffset: (2 * Math.PI * 22.5) * (remaining / initialTotal),
                                        transition: isActive ? 'stroke-dashoffset 1s linear' : 'none',
                                    }}
                                    className="opacity-80"
                                />
                                {[...Array(12)].map((_, i) => (
                                    <line
                                        key={i}
                                        x1="50" y1="10" x2="50" y2="15"
                                        transform={`rotate(${i * 30} 50 50)`}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        className="text-slate-300 dark:text-zinc-600"
                                    />
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-full shadow-sm border border-slate-100 dark:border-zinc-700 pointer-events-none">
                                    {format(remaining)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-center mt-4">
                            <button
                                onClick={() => isActive ? stop() : start()}
                                className={`flex-1 py-2.5 rounded-lg font-black text-[11px] transition-all tracking-widest ${isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}
                            >
                                {isActive ? "멈춤" : "시작"}
                            </button>
                            <button onClick={reset} className="px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-slate-200 dark:border-zinc-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};