const App = () => {
    const [view, setView] = useState('library');
    const [user, setUser] = useState(null);
    const hasFetchedCloud = useRef(false);
    const [books, setBooks] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const isInitialLoad = useRef(true);

    // Supabase 세션 감시
    useEffect(() => {
        if (!window.supabase) return;
        const config = window.SAGAK_CONFIG || {};
        const supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_OUT') {
                setBooks([]);
                setView('library');
                localStorage.removeItem('sagak_library');
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // 로컬 데이터 로딩
    useEffect(() => {
        if (!user) {
            const saved = localStorage.getItem('sagak_library');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setBooks(parsed);
                } catch(e) { console.error(e); }
            }
        }
    }, [user]);

    const [currentBookId, setCurrentBookId] = useState(null);
    const [toast, setToast] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [fontMode, setFontMode] = useState(() => localStorage.getItem('sagak_font') || 'maruburi');
    const [focusPosition, setFocusPosition] = useState(() => parseFloat(localStorage.getItem('sagak_focus_pos')) || 0.5);
    const [defaultTargetCount, setDefaultTargetCount] = useState(() => parseInt(localStorage.getItem('sagak_default_goal')) || 5000);
    const [editorWidth, setEditorWidth] = useState(() => localStorage.getItem('sagak_editor_width') || 'default');
    const [editorFontSize, setEditorFontSize] = useState(() => parseInt(localStorage.getItem('sagak_editor_fontsize')) || 18);
    const [showDocWordCount, setShowDocWordCount] = useState(() => localStorage.getItem('sagak_show_doc_wordcount') !== 'false');
    const [enableHistory, setEnableHistory] = useState(() => localStorage.getItem('sagak_enable_history') !== 'false');
    const [cloudAutoSaveInterval, setCloudAutoSaveInterval] = useState(() => parseInt(localStorage.getItem('sagak_cloud_autosave_interval')) || 10);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const toggleFont = () => {
        const modes = ['maruburi', 'Ridibatang', 'Galmuri14', 'pretendard'];
        setFontMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
    };

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2000);
    }, []);

    const currentBook = useMemo(() => books.find(b => b.id === currentBookId), [books, currentBookId]);

    return (
        <div className={`w-full font-pretendard antialiased text-slate-800 flex flex-col ${isDarkMode ? 'dark' : ''} ${fontMode}`} style={{ height: '100%' }}>
            <AnimatePresence> {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />} </AnimatePresence>
            {!user ? (
                <Landing onLogin={() => { /* Login Logic */ }} />
            ) : view === 'library' ? (
                <Library
                    books={books}
                    user={user}
                    onCloudUpload={() => { /* Cloud Logic */ }}
                    onLogin={() => { /* Login Logic */ }}
                    onLogout={() => { /* Logout Logic */ }}
                    onWithdrawal={() => { /* Withdrawal Logic */ }}
                    onSelectBook={(id) => { setCurrentBookId(id); setView('workspace'); }}
                    onCreateBook={(newBook) => setBooks([...books, newBook])}
                    onDeleteBook={(id) => setBooks(prev => prev.filter(b => b.id !== id))}
                    onUpdateBook={(updated) => setBooks(prev => prev.map(b => b.id === updated.id ? updated : b))}
                    onReorderBooks={setBooks}
                    onImport={(imported, shouldReplace) => setBooks(shouldReplace ? imported : [...books, ...imported])}
                    isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} fontMode={fontMode} toggleFont={toggleFont} focusPosition={focusPosition} setFocusPosition={setFocusPosition} defaultTargetCount={defaultTargetCount} setDefaultTargetCount={setDefaultTargetCount} editorWidth={editorWidth} setEditorWidth={setEditorWidth} editorFontSize={editorFontSize} setEditorFontSize={setEditorFontSize} showDocWordCount={showDocWordCount} setShowDocWordCount={setShowDocWordCount} enableHistory={enableHistory} setEnableHistory={setEnableHistory} cloudAutoSaveInterval={cloudAutoSaveInterval} setCloudAutoSaveInterval={setCloudAutoSaveInterval}
                />
            ) : view === 'workspace' && currentBook && (
                <Workspace
                    currentBook={currentBook} user={user} onLogin={() => {}} onLogout={() => {}} onWithdrawal={() => {}} onUpdateBook={(updated) => setBooks(prev => prev.map(b => b.id === updated.id ? updated : b))} onExit={() => setView('library')} showToast={showToast} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} fontMode={fontMode} toggleFont={toggleFont} focusPosition={focusPosition} setFocusPosition={setFocusPosition} defaultTargetCount={defaultTargetCount} setDefaultTargetCount={setDefaultTargetCount} editorWidth={editorWidth} editorFontSize={editorFontSize} showDocWordCount={showDocWordCount} setShowDocWordCount={setShowDocWordCount} enableHistory={enableHistory} setEnableHistory={setEnableHistory} cloudAutoSaveInterval={cloudAutoSaveInterval} setCloudAutoSaveInterval={setCloudAutoSaveInterval}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);