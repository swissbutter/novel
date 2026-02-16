const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;

// BookSettingsModal
const BookSettingsModal = ({ onClose, onConfirm, initialData, onDelete }) => {
    const [title, setTitle] = useState(initialData?.title || '새 작품');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [selectedColor, setSelectedColor] = useState(initialData?.color || BOOK_COLORS[0]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    const handleExportToWord = async () => {
        if (!initialData) return;
        if (!window.docx || !window.JSZip || !window.saveAs) {
            alert("필수 라이브러리(docx, jszip, FileSaver)가 로드되지 않았습니다.");
            return;
        }

        try {
            const zip = new JSZip();
            const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

            const boardProjects = initialData.projects.filter(p => p.type === 'board');
            for (const proj of boardProjects) {
                const doc = new Document({
                    sections: [{
                        children: [
                            new Paragraph({ text: `${proj.name} - 보드 데이터`, heading: HeadingLevel.HEADING_1 }),
                            ...proj.nodes.flatMap(node => [
                                new Paragraph({ text: "" }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `${node.data.emoji || '📍'} ${node.label}`, bold: true, size: 28 }),
                                        new TextRun({ text: ` [${node.type}]`, size: 20, color: "666666" })
                                    ]
                                }),
                                new Paragraph({
                                    text: "Node Info Placeholder", // Simplified for brevity
                                    italic: true
                                }),
                                new Paragraph({ text: node.data.memo || "내용 없음" }),
                                new Paragraph({ text: "--------------------------------------------------" })
                            ])
                        ]
                    }]
                });
                const blob = await Packer.toBlob(doc);
                zip.file(`보드_${proj.name.replace(/[\/\*\?|:<>"]/g, '_')}.docx`, blob);
            }

            const docProjects = initialData.projects.filter(p => p.type === 'doc');
            for (const proj of docProjects) {
                const lines = (proj.content || "").split('
');
                const doc = new Document({
                    sections: [{
                        children: [
                            new Paragraph({ text: proj.name, heading: HeadingLevel.HEADING_1 }),
                            ...lines.map(line => new Paragraph({
                                children: [new TextRun({ text: line })],
                                spacing: { line: 360, before: 120 }
                            }))
                        ]
                    }]
                });
                const blob = await Packer.toBlob(doc);
                zip.file(`원고_${proj.name.replace(/[\/\*\?|:<>"]/g, '_')}.docx`, blob);
            }

            const content = await zip.generateAsync({ type: "blob" });
            window.saveAs(content, `${initialData.title}_word.zip`);
        } catch (e) {
            console.error(e);
            alert("파일 생성 중 오류가 발생했습니다: " + e.message);
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) { alert("작품 제목을 입력해주세요."); return; }
        onConfirm(title, author, selectedColor);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-darkpanel p-8 rounded-[3px] shadow-2xl w-[450px] border border-slate-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100">{initialData ? '작품 설정 수정' : '새 작품 만들기'}</h2>
                    {initialData && (
                        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-sm">
                            <IconTrash className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black">삭제</span>
                        </button>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase">작품 제목</label>
                    <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[3px] text-slate-900 dark:text-zinc-100 font-bold focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase">작가 이름</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[3px] text-slate-900 dark:text-zinc-100 font-bold focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-3 uppercase">표지 색상</label>
                    <div className="flex flex-wrap gap-2">
                        {BOOK_COLORS.map(color => (
                            <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-[3px] shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`} style={{ backgroundColor: color }}>
                                {selectedColor === color && <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-[3px]">취소</button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-[3px] shadow-md">{initialData ? '저장하기' : '만들기'}</button>
                </div>
            </motion.div>
        </div>
    );
};

// NameGenerator
const NameGenerator = ({ onConfirm, onClose, settings, onSettingsChange }) => {
    const [genre, setGenre] = useState(settings?.genre || 'korean');
    const [role, setRole] = useState(settings?.role || 'modern');
    const [gender, setGender] = useState(settings?.gender || 'random');
    const [generatedName, setGeneratedName] = useState(null);

    useEffect(() => {
        if (onSettingsChange) onSettingsChange({ genre, role, gender });
    }, [genre, role, gender]);

    const handleGenerate = () => {
        const dataSet = NAME_DB[genre][role];
        if (!dataSet) return;
        let targetGender = gender === 'random' ? (Math.random() < 0.5 ? 'm' : 'f') : gender;
        const nameList = targetGender === 'm' ? dataSet.m : dataSet.f;
        const surnameList = dataSet.s;
        const rawName = nameList[Math.floor(Math.random() * nameList.length)];
        const rawSurname = surnameList[Math.floor(Math.random() * surnameList.length)];
        let fullName = genre === 'fantasy' ? `${rawName.split('|')[0]} ${rawSurname.split('|')[0]}` : `${rawSurname}${rawName}`;
        setGeneratedName(fullName);
    };

    useEffect(() => { if (!generatedName) handleGenerate(); }, []);

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 border-t border-slate-200 dark:border-zinc-700 pt-4">
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-[3px] border border-slate-200 dark:border-zinc-700 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase dark:text-zinc-400">🎲 이름 생성기</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <select value={genre} onChange={(e) => setGenre(e.target.value)} className="p-2 text-xs font-bold rounded-[3px] border dark:bg-zinc-800 dark:text-zinc-200">
                        <option value="korean">🏙️ 현대 한국</option>
                        <option value="fantasy">⚔️ 판타지</option>
                        <option value="wuxia">🐉 무협</option>
                    </select>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="p-2 text-xs font-bold rounded-[3px] border dark:bg-zinc-800 dark:text-zinc-200">
                        <option value="random">🎲 성별 랜덤</option>
                        <option value="m">‍♂️ 남성</option>
                        <option value="f">‍♀️ 여성</option>
                    </select>
                </div>
                <div onClick={() => generatedName && onConfirm(generatedName)} className="bg-white dark:bg-zinc-700 p-3 rounded-[3px] border border-dashed border-indigo-300 text-center cursor-pointer hover:bg-indigo-50">
                    <div className="text-sm font-black text-slate-800 dark:text-white">{generatedName || "생성 중..."}</div>
                </div>
                <button onClick={handleGenerate} className="w-full mt-2 py-2 bg-indigo-600 text-white text-xs font-black rounded-[3px]">새로운 이름 생성</button>
            </div>
        </motion.div>
    );
};

// ExportModal and ImportModal can be added here as well...
