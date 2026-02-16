const Library = ({ books, user, onLogin, onLogout, onWithdrawal, onSelectBook, onCreateBook, onDeleteBook, onUpdateBook, onImport, onReorderBooks, onCloudUpload, isDarkMode, toggleDarkMode, fontMode, toggleFont, focusPosition, setFocusPosition, defaultTargetCount, setDefaultTargetCount, editorWidth, setEditorWidth, editorFontSize, setEditorFontSize, showDocWordCount, setShowDocWordCount, enableHistory, setEnableHistory, cloudAutoSaveInterval, setCloudAutoSaveInterval }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'create', targetBook: null });
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    
    const quote = useMemo(() => {
        const quotes = [
            { "author": "어니스트 헤밍웨이", "quote": "모든 초고는 쓰레기다." },
            { "author": "안톤 체호프", "quote": "달이 빛난다고 말하지 말고, 깨진 유리 조각에 비치는 빛을 보여줘라." },
            { "author": "프란츠 카프카", "quote": "책은 우리 내면의 얼어붙은 바다를 깨는 도끼여야 한다." },
            { "author": "조디 피콜트", "quote": "나쁜 글은 고칠 수 있지만, 빈 페이지는 고칠 수 없다." },
            { "author": "토니 모리슨", "quote": "읽고 싶은 책이 있는데 아직 쓰이지 않았다면, 당신이 직접 써야 한다." },
            { "author": "커트 보니것", "quote": "낯선 사람의 시간을 낭비하지 않도록 글을 써라." },
            { "author": "앤 라모트", "quote": "인생이 갈지자로 비틀거리거나 마구 짓밟힐 때 조차 그 모든 상황이 관찰의 대상이 된다." },
            { "author": "플래너리 오코너", "quote": "작가는 관찰하는 사람이다. 눈앞의 세상을 정직하게 응시하는 법부터 배워라." },
            { "author": "무라카미 하루키", "quote": "글쓰기는 자기 자신을 향한 정직한 노동이다." },
            { "author": "잭 하트", "quote": "위대한 문장의 신화는 없다. 글쓰기는 마술이 아니라 기술이다." },
            { "author": "애거사 크리스티", "quote": "설거지를 하다가 최고의 아이디어가 떠오른다." },
            { "author": "랄프 왈도 에머슨", "quote": "자신의 생각을 믿는 것, 그것이 천재성이다." },
            { "author": "E.B. 화이트", "quote": "글을 쓰는 것은 믿음의 행위이지, 요령의 행위가 아니다." },
            { "author": "장 폴 사르트르", "quote": "글쓰기는 세계에 질문을 던지는 방식이다." },
            { "author": "블라디미르 나보코프", "quote": "최고의 작가는 마법사다." },
            { "author": "표도르 도스토옙스키", "quote": "작가는 영혼의 해부학자다." },
            { "author": "스티븐 킹", "quote": "많이 읽고, 많이 써라. 지름길은 없다." },
            { "author": "미야자키 하야오", "quote": "판타지에는 리얼리티가 필요하고, 리얼리티에는 판타지가 필요하다." },
            { "author": "스티븐 킹", "quote": "여러분이 해야 할 일은 날마다 작업을 한다는 사실을 뮤즈에게 알려주는 것이다." },
            { "author": "앨런 무어", "quote": "예술은 사람들의 인식을 바꾸는 유일한 도구다." },
            { "author": "월트 휘트먼", "quote": "단순함은 모든 예술의 마지막 단계다." },
            { "author": "제임스 디키", "quote": "글을 쓰는 것은 어둠 속에서 빛을 찾는 과정이다." },
            { "author": "조안 디디온", "quote": "내가 무슨 생각을 하는지 알기 위해 나는 글을 쓴다." },
            { "author": "작자 미상", "quote": "작품은 세계에 대한 작가의 논문이다." },
            { "author": "앤 라모트", "quote": "완벽주의는 당신의 글쓰기를 망치고, 창조성과 장난기와 생명력을 방해한다." },
            { "author": "앤 라모트", "quote": "좋은 글쓰기는 진실을 말하는 것이다." }
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }, []);

    const [dragState, setDragState] = useState({ draggingId: null, overId: null });
    const dragDataRef = useRef({ draggingId: null, overId: null });

    const handleDragStart = (e, bookId) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', bookId);
        dragDataRef.current = { draggingId: bookId, overId: null };
        setTimeout(() => setDragState({ draggingId: bookId, overId: null }), 0);
    };

    const handleDragOver = (e, overId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragDataRef.current.draggingId && dragDataRef.current.draggingId !== overId) {
            if (dragDataRef.current.overId !== overId) {
                dragDataRef.current.overId = overId;
                setDragState(prev => ({ ...prev, overId }));
            }
        }
    };

    const handleDrop = (e, dropId) => {
        e.preventDefault();
        const dragId = e.dataTransfer.getData('text/plain') || dragDataRef.current.draggingId;
        if (dragId && dropId && dragId !== dropId) {
            const dragIndex = books.findIndex(b => b.id === dragId);
            const dropIndex = books.findIndex(b => b.id === dropId);
            if (dragIndex !== -1 && dropIndex !== -1) {
                const newBooks = [...books];
                const [removed] = newBooks.splice(dragIndex, 1);
                newBooks.splice(dropIndex, 0, removed);
                onReorderBooks(newBooks);
            }
        }
        dragDataRef.current = { draggingId: null, overId: null };
        setDragState({ draggingId: null, overId: null });
    };

    const [filePanel, setFilePanel] = useState({ isOpen: false, mode: 'save' });
    const [importData, setImportData] = useState(null);

    const closeFilePanel = () => { setFilePanel({ isOpen: false, mode: filePanel.mode }); setImportData(null); };

    const handleExportFromPanel = (filename, exportType, password) => {
        const jsonString = JSON.stringify(books);
        if (exportType === 'vel') {
            const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
            const blob = new Blob([encrypted], { type: "text/plain;charset=utf-8" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.vel`;
            link.click();
            URL.revokeObjectURL(link.href);
        } else {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${filename}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    };

    const handleFileSelectFromPanel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            let isEncrypted = false;
            try { JSON.parse(fileContent); isEncrypted = false; } catch (jsonError) { isEncrypted = true; }
            setImportData({ content: fileContent, isEncrypted });
        };
        reader.readAsText(file);
    };

    const handleConfirmModal = (title, author, color) => {
        if (modalConfig.mode === 'create') {
            const newId = generateUUID();
            const defaultProjectId = generateUUID();
            onCreateBook({ id: newId, title, author, color, projects: [{ id: defaultProjectId, type: 'board', name: '새 보드', nodes: [], edges: [] }], activeProjectId: defaultProjectId });
        } else {
            onUpdateBook({ ...modalConfig.targetBook, title, author, color });
        }
        setModalConfig({ isOpen: false, mode: 'create', targetBook: null });
    };

    const stats = useMemo(() => {
        let totalChars = 0, totalDocs = 0, totalNodes = 0, completedDocs = 0;
        books.forEach(book => {
            (book.projects || []).forEach(project => {
                if (project.type === 'doc') { totalDocs++; totalChars += (project.content || '').length; if (project.status === '완료') completedDocs++; }
                else if (project.type === 'board') totalNodes += (project.nodes || []).length;
            });
        });
        return { totalChars, totalDocs, totalNodes, completedDocs };
    }, [books]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: '좋은 아침이에요', emoji: '🌅', sub: '오늘도 좋은 글이 탄생하길' };
        if (hour >= 12 && hour < 17) return { text: '좋은 오후예요', emoji: '☀️', sub: '잠시 커피 한 잔 어떠세요?' };
        if (hour >= 17 && hour < 21) return { text: '좋은 저녁이에요', emoji: '🌆', sub: '오늘 하루도 수고했어요' };
        return { text: '고요한 밤이에요', emoji: '🌙', sub: '야행성 작가님, 무리하지 마세요' };
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col bg-slate-100 dark:bg-zinc-950 overflow-hidden">
            {modalConfig.isOpen && (<BookSettingsModal initialData={modalConfig.targetBook} onClose={() => setModalConfig({ isOpen: false, mode: 'create', targetBook: null })} onConfirm={handleConfirmModal} onDelete={onDeleteBook} />)}
            {showSystemSettings && (
                <SystemSettingsModal onClose={() => setShowSystemSettings(false)} user={user} onLogin={onLogin} onLogout={onLogout} onWithdrawal={onWithdrawal} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} fontMode={fontMode} toggleFont={toggleFont} focusPosition={focusPosition} setFocusPosition={setFocusPosition} defaultTargetCount={defaultTargetCount} setDefaultTargetCount={setDefaultTargetCount} editorWidth={editorWidth} setEditorWidth={setEditorWidth} editorFontSize={editorFontSize} setEditorFontSize={setEditorFontSize} showDocWordCount={showDocWordCount} setShowDocWordCount={setShowDocWordCount} enableHistory={enableHistory} setEnableHistory={setEnableHistory} cloudAutoSaveInterval={cloudAutoSaveInterval} setCloudAutoSaveInterval={setCloudAutoSaveInterval} />
            )}
            <AnimatePresence>
                {filePanel.isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-[99]" onClick={closeFilePanel} />
                        <FilePanel isOpen={filePanel.isOpen} mode={filePanel.mode} onClose={closeFilePanel} books={books} onExport={handleExportFromPanel} onFileSelect={handleFileSelectFromPanel} importData={importData} onConfirmImport={(data, shouldReplace) => { if (data && Array.isArray(data)) onImport(data, shouldReplace); else alert("올바르지 않은 형식"); closeFilePanel(); }} />
                    </>
                )}
            </AnimatePresence>

            <header className="h-14 px-8 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-50 border-b dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <img src="sagak_icon.png" className="w-8 h-8 rounded-sm shadow-md" alt="Logo" />
                    <span className="text-base font-black text-slate-800 dark:text-zinc-100">사각 스튜디오</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {user && (
                        <button onClick={onCloudUpload} className="h-9 px-4 flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-xs font-black">
                            <span className="hidden sm:inline">클라우드 동기화</span>
                        </button>
                    )}
                    <button onClick={() => setShowSystemSettings(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                        {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" /> : <IconSettings className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-end justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">{greeting.emoji}</span>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100">{greeting.text}</h1>
                                <p className="text-slate-500 text-sm">{greeting.sub}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border dark:border-zinc-800">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">총 작품수</div>
                            <div className="text-2xl font-black dark:text-zinc-100">{books.length}</div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border dark:border-zinc-800">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">총 글자수</div>
                            <div className="text-2xl font-black dark:text-zinc-100">{stats.totalChars.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold dark:text-zinc-200">내 서재</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setFilePanel({ isOpen: true, mode: 'save' })} className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 rounded-sm text-sm font-medium"><IconSave className="w-4 h-4" /></button>
                            <button onClick={() => setFilePanel({ isOpen: true, mode: 'load' })} className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 rounded-sm text-sm font-medium"><IconUpload className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book, index) => (
                            <div key={book.id} onDragOver={e => handleDragOver(e, book.id)} onDrop={e => handleDrop(e, book.id)}>
                                <BookCover book={book} onClick={() => !dragState.draggingId && onSelectBook(book.id)} onDelete={onDeleteBook} onEdit={target => setModalConfig({ isOpen: true, mode: 'edit', targetBook: target })} isDragging={dragState.draggingId === book.id} isDropTarget={dragState.overId === book.id} dragHandleProps={{ draggable: true, onDragStart: e => handleDragStart(e, book.id), onDragEnd: () => setDragState({ draggingId: null, overId: null }) }} />
                            </div>
                        ))}
                        <button onClick={() => setModalConfig({ isOpen: true, mode: 'create', targetBook: null })} className="group flex flex-col items-center justify-center gap-4 aspect-[2/3] rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-indigo-400">
                            <div className="w-14 h-14 rounded-[3px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><IconPlus className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-slate-500">새 작품 시작하기</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};