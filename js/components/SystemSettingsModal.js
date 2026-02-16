const SystemSettingsModal = ({ onClose, user, onLogin, onLogout, onWithdrawal, isDarkMode, toggleDarkMode, fontMode, toggleFont, activeProject, onUpdateProject, focusPosition, setFocusPosition, defaultTargetCount, setDefaultTargetCount, editorWidth, setEditorWidth, editorFontSize, setEditorFontSize, showDocWordCount, setShowDocWordCount, enableHistory, setEnableHistory, cloudAutoSaveInterval, setCloudAutoSaveInterval }) => {
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [withdrawInput, setWithdrawInput] = useState('');

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-darkpanel p-8 rounded-sm shadow-2xl w-[450px] border border-slate-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2"><IconSettings className="w-5 h-5 text-indigo-500" />시스템 설정</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
                <div className="space-y-6">
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">계정</h3>
                        {user ? (
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                                <div className="text-sm font-bold">{user.email}</div>
                                <button onClick={onLogout} className="text-xs font-black text-red-500">로그아웃</button>
                            </div>
                        ) : (
                            <button onClick={onLogin} className="w-full py-3 bg-white border rounded-sm text-xs font-black">구글 로그인</button>
                        )}
                    </section>
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">화면 및 폰트</h3>
                        <div className="flex gap-4">
                            <button onClick={toggleDarkMode} className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 rounded-sm text-xs font-bold">{isDarkMode ? '다크 모드' : '라이트 모드'}</button>
                            <button onClick={toggleFont} className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 rounded-sm text-xs font-bold">{FONT_DISPLAY_NAMES[fontMode]}</button>
                        </div>
                    </section>
                </div>
                <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 text-white font-black rounded-sm shadow-md">저장 및 닫기</button>
            </motion.div>
        </div>
    );
};