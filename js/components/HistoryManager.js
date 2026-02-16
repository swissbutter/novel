const { useState } = React;
const { motion, AnimatePresence } = window.Motion;

const HistoryManager = ({ doc, onClose, onRestore, onSnapshot, onDelete }) => {
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [memoInput, setMemoInput] = useState('');
    const history = doc.history || [];

    const handleSnapshot = () => {
        onSnapshot(memoInput);
        setIsInputOpen(false);
        setMemoInput('');
    };

    const handleDeleteConfirm = () => {
        if (deleteTargetId) {
            onDelete(deleteTargetId);
            if (selectedSnapshot?.id === deleteTargetId) setSelectedSnapshot(null);
            setDeleteTargetId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-darkpanel w-[710px] h-[450px] rounded-xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-slate-200 dark:border-zinc-700">
                <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-black flex items-center gap-2"><IconHistory className="w-5 h-5 text-indigo-500" />문서 히스토리</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsInputOpen(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded text-xs font-bold">현재 상태 스냅샷</button>
                        <button onClick={onClose} className="p-2 text-slate-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white">
                        {selectedSnapshot ? (
                            <>
                                <div className="p-3 border-b flex justify-between items-center bg-slate-50/30">
                                    <span className="text-xs font-bold text-slate-500">{new Date(selectedSnapshot.timestamp).toLocaleString()} 버전</span>
                                    <button onClick={() => { if (confirm("복원하시겠습니까?")) { onRestore(selectedSnapshot); onClose(); } }} className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded">복원하기</button>
                                </div>
                                <textarea readOnly className="flex-1 w-full p-8 resize-none outline-none text-slate-600" value={selectedSnapshot.content} />
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3">
                                <IconHistory className="w-12 h-12 opacity-50" />
                                <span className="text-sm">버전을 선택하세요</span>
                            </div>
                        )}
                    </div>
                    <div className="w-64 border-l overflow-y-auto bg-slate-50/30">
                        <div className="p-2 space-y-1">
                            {[...history].reverse().map((snap) => (
                                <div key={snap.id} onClick={() => setSelectedSnapshot(snap)} className={`p-3 rounded-[3px] cursor-pointer border ${selectedSnapshot?.id === snap.id ? 'bg-white border-indigo-200 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                    <div className="text-[10px] font-bold text-slate-500">{new Date(snap.timestamp).toLocaleString()}</div>
                                    <div className="text-xs font-medium text-slate-700 line-clamp-2">{snap.summary}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};