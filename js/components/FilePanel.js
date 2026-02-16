const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;

const FilePanel = ({ isOpen, mode, onClose, books, onExport, onFileSelect, importData, onConfirmImport }) => {
    const [filename, setFilename] = useState('sagak_backup');
    const [exportType, setExportType] = useState('json');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [importMode, setImportMode] = useState('replace');
    const [importPassword, setImportPassword] = useState('');
    const [decryptedData, setDecryptedData] = useState(null);
    const [importStep, setImportStep] = useState('select');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'save') {
                setFilename('sagak_backup');
                setExportType('json');
                setPassword('');
                setPasswordConfirm('');
            } else {
                setImportStep('select');
                setImportPassword('');
                setDecryptedData(null);
                setImportMode('replace');
            }
        }
    }, [isOpen, mode]);

    useEffect(() => {
        if (importData) {
            if (importData.isEncrypted) setImportStep('password');
            else setImportStep('mode');
        }
    }, [importData]);

    const handleSave = () => {
        if (!filename.trim()) { alert("파일명을 입력해주세요."); return; }
        if (exportType === 'vel') {
            if (!password.trim()) { alert("암호를 입력해주세요."); return; }
            if (password !== passwordConfirm) { alert("암호가 일치하지 않습니다."); return; }
        }
        onExport(filename, exportType, password);
        onClose();
    };

    const handleDecrypt = () => {
        try {
            const bytes = CryptoJS.AES.decrypt(importData.content, importPassword);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedText) throw new Error();
            setDecryptedData(JSON.parse(decryptedText));
            setImportStep('mode');
        } catch (error) {
            alert("비밀번호가 틀리거나 손상된 파일입니다.");
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-darkpanel shadow-2xl z-[100] flex flex-col border-l border-slate-200 dark:border-zinc-700"
        >
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-zinc-700">
                <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100">{mode === 'save' ? '파일 저장' : '파일 불러오기'}</h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {mode === 'save' ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">파일명</label>
                            <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">저장 형식</label>
                            <div className="space-y-2">
                                <button onClick={() => setExportType('json')} className={`w-full p-4 border-2 rounded-sm text-left ${exportType === 'json' ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                                    <div className="font-black">일반 저장 (.json)</div>
                                </button>
                                <button onClick={() => setExportType('vel')} className={`w-full p-4 border-2 rounded-sm text-left ${exportType === 'vel' ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                                    <div className="font-black">암호화 저장 (.vel)</div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {importStep === 'select' && (
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-indigo-600 text-white font-black rounded-sm shadow-md">파일 선택</button>
                        )}
                        {importStep === 'password' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">암호 입력</label>
                                <input type="password" value={importPassword} onChange={(e) => setImportPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-bold" />
                                <button onClick={handleDecrypt} className="w-full mt-4 py-3 bg-indigo-600 text-white font-black rounded-sm">확인</button>
                            </div>
                        )}
                        {importStep === 'mode' && (
                            <div className="space-y-2">
                                <button onClick={() => setImportMode('replace')} className={`w-full p-4 border-2 rounded-sm text-left ${importMode === 'replace' ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                                    <div className="font-black">덮어쓰기</div>
                                </button>
                                <button onClick={() => setImportMode('append')} className={`w-full p-4 border-2 rounded-sm text-left ${importMode === 'append' ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                                    <div className="font-black">추가하기</div>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-6 border-t border-slate-200">
                <button onClick={mode === 'save' ? handleSave : () => onConfirmImport(importData.isEncrypted ? decryptedData : JSON.parse(importData.content), importMode === 'replace')} className="w-full py-4 bg-slate-900 text-white font-black rounded-sm">{mode === 'save' ? '저장하기' : '불러오기'}</button>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => onFileSelect(e.target.files[0])} className="hidden" accept=".json,.vel" />
        </motion.div>
    );
};