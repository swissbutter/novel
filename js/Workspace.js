        const Workspace = ({ currentBook, user, onLogin, onLogout, onWithdrawal, onUpdateBook, onExit, showToast, isDarkMode, toggleDarkMode, fontMode, toggleFont, focusPosition, setFocusPosition, defaultTargetCount, setDefaultTargetCount, editorWidth, editorFontSize, showDocWordCount, setShowDocWordCount, enableHistory, setEnableHistory, cloudAutoSaveInterval, setCloudAutoSaveInterval }) => {
            const [projects, setProjects] = useState(currentBook.projects || []);
            const [trash, setTrash] = useState(currentBook.trash || []); // 휴지통
            const [isTrashOpen, setIsTrashOpen] = useState(false); // 휴지통 열림 상태
            const [activeProjectId, setActiveProjectId] = useState(currentBook.activeProjectId || (currentBook.projects[0] ? currentBook.projects[0].id : 'default'));
            const [expandedProjects, setExpandedProjects] = useState(currentBook.expandedProjects || (currentBook.projects[0] ? { [currentBook.projects[0].id]: true } : {}));
            const [scale, setScale] = useState(currentBook.scale || 1);
            const [pan, setPan] = useState(currentBook.pan || { x: 0, y: 0 });
            const panAnimationRef = useRef(null);
            const [isZenMode, setIsZenMode] = useState(false);
            const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
            const [showSystemSettings, setShowSystemSettings] = useState(false);
            const [showHistoryModal, setShowHistoryModal] = useState(false);
            const [showSynopsisModal, setShowSynopsisModal] = useState(false);
            const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
            const [corkboardMode, setCorkboardMode] = useState(false);
            const [corkboardSearch, setCorkboardSearch] = useState('');
            const [corkboardStatusFilter, setCorkboardStatusFilter] = useState(null);

            const [mention, setMention] = useState({ active: false, type: null, search: '', x: 0, y: 0, pos: 0, selectedIndex: 0 });
            const [showNodeDropdown, setShowNodeDropdown] = useState(false);
            const [compareMode, setCompareMode] = useState(false);
            const [compareDocIds, setCompareDocIds] = useState([null, null]);
            const [activeComparePane, setActiveComparePane] = useState(0);
            const [editingProjectId, setEditingProjectId] = useState(null);
            const [corkboardEditingId, setCorkboardEditingId] = useState(null);
            const textareaRef = useRef(null);
            const [pomoMinutes, setPomoMinutes] = useState(25);
            const [pomoSeconds, setPomoSeconds] = useState(0);
            const [isPomoActive, setIsPomoActive] = useState(false);
            const [pomoInitialTotal, setPomoInitialTotal] = useState(25 * 60);
            const [pomoRemaining, setPomoRemaining] = useState(25 * 60);
            const [isPomoSetting, setIsPomoSetting] = useState(false);
            const [isNameGenOpen, setIsNameGenOpen] = useState(false);
            const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
            const [nameGenSettings, setNameGenSettings] = useState(null);

            // 화면 크기에 따른 초기 모드 설정
            useEffect(() => {
                const handleResize = () => {
                    const isLarge = window.innerWidth > 1024;
                    if (isLarge) {
                        setIsSidebarOpen(true);
                    } else {
                        // 태블릿/모바일에서는 보드일 경우 코르크보드로 강제 전환
                        const currentProject = projects.find(p => p.id === activeProjectId);
                        if (currentProject && currentProject.type === 'board') {
                            setCorkboardMode(true);
                        }
                    }
                };

                // 초기 실행
                if (window.innerWidth <= 1024) {
                    setIsZenMode(true); // 모바일은 집중 모드(사이드바 닫힘)로 시작
                    const currentProject = projects.find(p => p.id === activeProjectId);
                    if (currentProject && currentProject.type === 'board') {
                        setCorkboardMode(true);
                    }
                }

                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, [activeProjectId, projects]);
            const [todoInput, setTodoInput] = useState('');
            const [docFilter, setDocFilter] = useState(null);
            const [isEditingTitle, setIsEditingTitle] = useState(false);
            const titleInputRef = useRef(null);
            const isDraggingSplitter = useRef(false);
            const [isSplitterDragging, setIsSplitterDragging] = useState(false);
            const [splitRatio, setSplitRatio] = useState(50);
            const containerRef = useRef(null);
            const nodeDropdownRef = useRef(null);
            const compareTextareaRefs = useRef([null, null]);

            const renderStatusSelector = (doc) => {
                const isOpen = openStatusDropdownId === doc.id;
                const currentStatus = doc.status || '초고';
                
                return (
                    <div 
                        className={`relative z-50 flex items-center p-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isZenMode && !isOpen ? 'opacity-10 hover:opacity-100' : 'opacity-100'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isOpen) setOpenStatusDropdownId(doc.id);
                            else setOpenStatusDropdownId(null);
                        }}
                    >
                        {['초고', '수정', '완료'].map(status => {
                            const isActive = currentStatus === status;
                            const show = isActive || isOpen;
                            
                            return (
                                <div 
                                    key={status}
                                    className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden ${show ? 'max-w-[60px] opacity-100 mx-0.5' : 'max-w-0 opacity-0 mx-0'}`}
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isOpen) {
                                                setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, status } : p));
                                                setOpenStatusDropdownId(null);
                                            } else {
                                                setOpenStatusDropdownId(doc.id);
                                            }
                                        }} 
                                        className={`px-3 py-1 text-[10px] font-black rounded-[3px] transition-all whitespace-nowrap ${
                                            isActive 
                                            ? (status === '완료' ? 'bg-emerald-600 text-white shadow-sm' : status === '수정' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-white shadow-sm text-indigo-600 dark:bg-zinc-700 dark:text-indigo-300 border border-slate-200 dark:border-zinc-600') 
                                            : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                );
            };

            const scrollTargetRef = useRef(0);
            const scrollAnimRef = useRef(null);
            const scrollLockRef = useRef(false);
            const getCaretCoordinates = (element, position) => {
                const div = document.createElement('div');
                const style = window.getComputedStyle(element);
                const props = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'padding', 'border', 'width', 'boxSizing', 'whiteSpace', 'wordWrap'];
                props.forEach(prop => div.style[prop] = style[prop]);
                div.style.position = 'absolute';
                div.style.visibility = 'hidden';
                div.textContent = element.value.substring(0, position);
                const span = document.createElement('span');
                span.textContent = element.value.substring(position) || '.';
                div.appendChild(span);
                document.body.appendChild(div);
                const rect = element.getBoundingClientRect();
                const coordinates = { top: rect.top + span.offsetTop + element.scrollTop, left: rect.left + span.offsetLeft };
                document.body.removeChild(div);
                return coordinates;
            };

            const updateFocusScroll = useCallback(() => {
                if (!isZenMode || scrollLockRef.current) return;

                const textarea = compareMode
                    ? compareTextareaRefs.current[activeComparePane]
                    : textareaRef.current;

                if (!textarea) return;

                const coords = getCaretCoordinates(textarea, textarea.selectionStart);
                const rect = textarea.getBoundingClientRect();
                const contentOffsetTop = coords.top - rect.top - textarea.scrollTop;
                const targetScroll = contentOffsetTop - (textarea.clientHeight * focusPosition);

                const currentDiff = Math.abs(targetScroll - scrollTargetRef.current);
                if (currentDiff > 30) {
                    scrollTargetRef.current = targetScroll;
                }
            }, [isZenMode, compareMode, activeComparePane, focusPosition]);

            useEffect(() => {
                if (!isZenMode) {
                    if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
                    return;
                }

                // Zen 모드 진입 시 현재 스크롤 위치로 초기화
                const textarea = compareMode
                    ? compareTextareaRefs.current[activeComparePane]
                    : textareaRef.current;
                if (textarea) {
                    scrollTargetRef.current = textarea.scrollTop;
                }

                // 약간의 딜레이 후 목표 위치 계산
                setTimeout(() => {
                    updateFocusScroll();
                }, 100);

                const loop = () => {
                    const textarea = compareMode
                        ? compareTextareaRefs.current[activeComparePane]
                        : textareaRef.current;

                    if (textarea && !scrollLockRef.current) {
                        const current = textarea.scrollTop;
                        const target = scrollTargetRef.current;
                        const diff = target - current;

                        if (Math.abs(diff) > 3) {
                            textarea.scrollTop = current + diff * 0.12;
                        }
                    }
                    scrollAnimRef.current = requestAnimationFrame(loop);
                };

                loop();
                return () => cancelAnimationFrame(scrollAnimRef.current);
            }, [isZenMode, updateFocusScroll, compareMode, activeComparePane]);

            const animateViewport = useCallback((targetPan, targetScale) => {
                if (panAnimationRef.current) cancelAnimationFrame(panAnimationRef.current);
                
                const startPan = { ...pan };
                const startScale = scale;
                const startTime = performance.now();
                const duration = 500;

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    
                    const t = ease(progress);
                    
                    setPan({
                        x: startPan.x + (targetPan.x - startPan.x) * t,
                        y: startPan.y + (targetPan.y - startPan.y) * t
                    });
                    
                    if (targetScale !== undefined) {
                        setScale(startScale + (targetScale - startScale) * t);
                    }

                    if (progress < 1) {
                        panAnimationRef.current = requestAnimationFrame(animate);
                    }
                };
                
                panAnimationRef.current = requestAnimationFrame(animate);
            }, [pan, scale]);

            useEffect(() => {
                let interval = null;
                if (isPomoActive && pomoRemaining > 0) {
                    interval = setInterval(() => {
                        setPomoRemaining(prev => {
                            if (prev <= 1) {
                                setIsPomoActive(false);
                                showToast("뽀모도로 타이머가 종료되었습니다! ☕", "success");
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else if (pomoRemaining === 0) {
                    setIsPomoActive(false);
                }
                return () => clearInterval(interval);
            }, [isPomoActive, pomoRemaining, showToast]);

            // 히스토리 관리 함수들
            const createSnapshot = useCallback((docId, memo) => {
                setProjects(prev => prev.map(p => {
                    if (p.id !== docId) return p;
                    const newHistory = [
                        ...(p.history || []),
                        {
                            id: generateUUID(),
                            timestamp: Date.now(),
                            content: p.content || "",
                            summary: memo || ((p.content || "").slice(0, 50) + ((p.content || "").length > 50 ? "..." : ""))
                        }
                    ];
                    // 최대 20개 유지
                    if (newHistory.length > 20) newHistory.shift();
                    return { ...p, history: newHistory };
                }));
                showToast("스냅샷이 저장되었습니다.");
            }, [showToast]);

            const restoreSnapshot = useCallback((snapshot) => {
                setProjects(prev => prev.map(p => {
                    if (p.id !== activeProjectId) return p;

                    // 복원 전 현재 상태도 자동 스냅샷 (실수 방지)
                    const currentHistory = p.history || [];
                    const autoSnapshot = {
                        id: generateUUID(),
                        timestamp: Date.now(),
                        content: p.content || "",
                        summary: "복원 전 자동 저장: " + ((p.content || "").slice(0, 30) || "내용 없음")
                    };
                    const newHistory = [...currentHistory, autoSnapshot];
                    if (newHistory.length > 20) newHistory.shift();

                    return { ...p, content: snapshot.content, history: newHistory };
                }));
                showToast("선택한 버전으로 복원되었습니다.");
            }, [activeProjectId, showToast]);

            const deleteSnapshot = useCallback((snapshotId) => {
                setProjects(prev => prev.map(p => {
                    if (p.id !== activeProjectId) return p;
                    const newHistory = (p.history || []).filter(h => h.id !== snapshotId);
                    return { ...p, history: newHistory };
                }));
                showToast("기록이 삭제되었습니다.");
            }, [activeProjectId, showToast]);


            const setSidebarCols = (projectId, cols) => {
                setProjects(prev => prev.map(p =>
                    p.id === projectId ? { ...p, sidebarColumns: cols } : p
                ));
            };

            useEffect(() => {
                const handleClickOutside = (e) => {
                    if (!mention.active) return;
                    const mentionList = document.querySelector('.mention-list');
                    const isTextAreaClick = e.target === textareaRef.current;
                    if (mentionList && !mentionList.contains(e.target) && !isTextAreaClick) {
                        setMention(prev => ({ ...prev, active: false }));
                    }
                };
                if (mention.active) {
                    document.addEventListener('mousedown', handleClickOutside);
                }
                return () => document.removeEventListener('mousedown', handleClickOutside);
            }, [mention.active]);

            useEffect(() => {
                const handleDropdownClickOutside = (e) => {
                    if (showNodeDropdown && !e.target.closest('.relative')) {
                        setShowNodeDropdown(false);
                    }
                    if (openStatusDropdownId && !e.target.closest('.relative.z-50')) {
                        setOpenStatusDropdownId(null);
                    }
                };
                if (showNodeDropdown || openStatusDropdownId) {
                    document.addEventListener('mousedown', handleDropdownClickOutside);
                }
                return () => document.removeEventListener('mousedown', handleDropdownClickOutside);
            }, [showNodeDropdown, openStatusDropdownId]);

            // Auto-save to parent component
            useEffect(() => {
                onUpdateBook({
                    ...currentBook,
                    projects,
                    trash,
                    activeProjectId,
                    expandedProjects,
                    scale,
                    pan
                });
            }, [projects, trash, activeProjectId, expandedProjects, scale, pan]);

            const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || projects[0], [projects, activeProjectId]);

            const nodes = activeProject?.nodes || [];
            
            const fitToScreen = useCallback((nodesToFit = nodes) => {
                if (!nodesToFit || nodesToFit.length === 0) return;
                
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                nodesToFit.forEach(node => {
                    const w = node.type === '그룹' ? (node.data.width || 400) : CARD_W;
                    let h = CARD_H;
                    if (node.type === '그룹') {
                        h = node.data.height || 300;
                    } else if (node.type === '할일') {
                        // 할일 노드는 높이가 가변적이므로, 항목 수에 따라 대략적으로 계산하거나 넉넉하게 잡음
                        // 기본 헤더 + 패딩(60px) + 항목당 높이(24px) + 입력창(30px) + 여유분
                        const itemsHeight = (node.data.items || []).length * 24 + 100; 
                        h = Math.max(CARD_H, itemsHeight);
                    }

                    minX = Math.min(minX, node.x);
                    maxX = Math.max(maxX, node.x + w);
                    minY = Math.min(minY, node.y);
                    maxY = Math.max(maxY, node.y + h);
                });

                const contentW = maxX - minX;
                const contentH = maxY - minY;
                
                const containerEl = containerRef.current;
                const containerW = containerEl ? containerEl.clientWidth : window.innerWidth;
                const containerH = containerEl ? containerEl.clientHeight : window.innerHeight;
                
                const padding = 100;
                const scaleX = (containerW - padding * 2) / contentW;
                const scaleY = (containerH - padding * 2) / contentH;
                
                // Use Math.min(scaleX, scaleY) to ensure both dimensions fit.
                // Clamp the result between 0.05 (to allow zooming out for huge boards) and 1.5.
                const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.05), 1.5);

                const centerX = minX + contentW / 2;
                const centerY = minY + contentH / 2;
                
                const targetPan = {
                    x: containerW / 2 - centerX * newScale,
                    y: containerH / 2 - centerY * newScale
                };
                
                animateViewport(targetPan, newScale);
            }, [nodes, animateViewport]);

            const edges = activeProject?.edges || [];
            const allBoardNodes = useMemo(() => projects.filter(p => p.type === 'board').flatMap(p => (p.nodes || []).map(node => ({ ...node, projectName: p.name, projectId: p.id }))), [projects]);
            const filteredMentionNodes = useMemo(() => { 
                if (!mention.active) return []; 
                return allBoardNodes.filter(n => {
                    const targetType = mention.type === '@' ? '인물' : mention.type === '#' ? '사건' : mention.type === '$' ? '메모' : mention.type === '%' ? '할일' : '메모';
                    return n.type === targetType && (n.label.includes(mention.search) || mention.search === "");
                }); 
            }, [allBoardNodes, mention]);

            const handleToggleTodoInMention = (projectId, nodeId, itemId) => {
                setProjects(prev => prev.map(p => {
                    if (p.id !== projectId) return p;
                    return {
                        ...p,
                        nodes: p.nodes.map(n => {
                            if (n.id !== nodeId) return n;
                            const newItems = (n.data.items || []).map(item => 
                                item.id === itemId ? { ...item, done: !item.done } : item
                            );
                            return { ...n, data: { ...n.data, items: newItems } };
                        })
                    };
                }));
            };

            const handleSelectProject = (id, e) => {
                const target = projects.find(p => p.id === id);

                // Shift+클릭으로 문서 비교 모드 활성화 (doc 타입만)
                if (e && e.shiftKey && target && target.type === 'doc') {
                    if (!compareMode) {
                        // 현재 활성 문서가 doc이면 비교 모드 시작
                        const currentDoc = projects.find(p => p.id === activeProjectId);
                        if (currentDoc && currentDoc.type === 'doc' && activeProjectId !== id) {
                            setCompareMode(true);
                            setCompareDocIds([activeProjectId, id]);
                            setActiveComparePane(1);
                            return;
                        } else if (!currentDoc || currentDoc.type !== 'doc') {
                            // 현재가 doc이 아니면 선택한 문서를 왼쪽에 배치하고 다음 선택 대기
                            setActiveProjectId(id);
                            return;
                        }
                    } else {
                        // 이미 비교 모드 중이면 활성 패널의 문서 교체
                        setCompareDocIds(prev => {
                            const newIds = [...prev];
                            newIds[activeComparePane] = id;
                            return newIds;
                        });
                        showToast("문서가 교체되었습니다");
                        return;
                    }
                }

                // 비교 모드 종료 (일반 클릭 시)
                if (compareMode) {
                    setCompareMode(false);
                    setCompareDocIds([null, null]);
                    setIsZenMode(false);
                }

                setActiveProjectId(id);
                if (target && target.type !== 'doc') {
                    setIsZenMode(false);
                    // 모바일/태블릿에서 보드 선택 시 자동으로 코르크 보드 모드로 전환
                    if (window.innerWidth <= 1024 && target.type === 'board') {
                        setCorkboardMode(true);
                    } else {
                        setCorkboardMode(false);
                    }
                } else {
                    setCorkboardMode(false);
                }
                
                setIsTrashOpen(false);
                // 프로젝트 전환 시 선택 상태 및 임시 상태 초기화 (메모리 관리)
                setSelectedNodeIds(new Set());
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
                setTempEdge(null);
            };

            // 비교 모드 키보드 단축키 (ESC: 종료, Tab: 패널 전환)
            useEffect(() => {
                if (!compareMode) return;
                const handleCompareKeydown = (e) => {
                    if (e.key === 'Escape') {
                        setCompareMode(false);
                        setCompareDocIds([null, null]);
                        setIsZenMode(false);
                        showToast("비교 모드 종료");
                    } else if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        setCompareDocIds(prev => [prev[1], prev[0]]);
                    }
                };
                window.addEventListener('keydown', handleCompareKeydown);
                return () => window.removeEventListener('keydown', handleCompareKeydown);
            }, [compareMode, activeComparePane]);
            const toggleProjectFolder = (id, e) => { if (e) e.stopPropagation(); setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] })); };

            const updateActiveProject = useCallback((nodeUpdater, edgeUpdater) => {
                setProjects(prev => prev.map(p => {
                    if (p.id !== activeProjectId) return p;
                    return {
                        ...p,
                        nodes: nodeUpdater ? (typeof nodeUpdater === 'function' ? nodeUpdater(p.nodes || []) : nodeUpdater) : (p.nodes || []),
                        edges: edgeUpdater ? (typeof edgeUpdater === 'function' ? edgeUpdater(p.edges || []) : edgeUpdater) : (p.edges || [])
                    };
                }));
            }, [activeProjectId]);

            const updateDocContent = (content) => { const finalContent = (!content || content.trim() === '') ? '　' : content; setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, content: finalContent } : p)); if (!content || content.trim() === '') { requestAnimationFrame(() => { if (textareaRef.current) { textareaRef.current.setSelectionRange(1, 1); } }); } };

            // 비교 모드용 문서 내용 업데이트
            const updateCompareDocContent = (docId, content) => {
                const finalContent = (!content || content.trim() === '') ? '　' : content;
                setProjects(prev => prev.map(p => p.id === docId ? { ...p, content: finalContent } : p));
            };

            // 비교 모드용 프로젝트 가져오기
            const getCompareDoc = (index) => {
                const docId = compareDocIds[index];
                return projects.find(p => p.id === docId) || null;
            };

            // 분할선 드래그 핸들러 - DOM 직접 조작으로 실시간 반응
            const splitterRafId = useRef(null);
            const compareContainerRef = useRef(null);

            const handleSplitterMouseDown = (e) => {
                e.preventDefault();
                isDraggingSplitter.current = true;
                setIsSplitterDragging(true);
                compareContainerRef.current = document.querySelector('.compare-container');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            };

            useEffect(() => {
                if (!compareMode) return;

                const handleMouseMove = (e) => {
                    if (!isDraggingSplitter.current || !compareContainerRef.current) return;

                    // 이전 애니메이션 프레임 취소
                    if (splitterRafId.current) {
                        cancelAnimationFrame(splitterRafId.current);
                    }

                    // requestAnimationFrame으로 실시간 DOM 업데이트
                    splitterRafId.current = requestAnimationFrame(() => {
                        const rect = compareContainerRef.current.getBoundingClientRect();
                        const newRatio = Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100));

                        // DOM 직접 조작으로 즉시 반영
                        const leftPane = compareContainerRef.current.children[0];
                        const rightPane = compareContainerRef.current.children[2];
                        if (leftPane && rightPane) {
                            leftPane.style.width = `${newRatio}%`;
                            rightPane.style.width = `${100 - newRatio}%`;
                        }

                        // state도 업데이트 (나중에 동기화용)
                        setSplitRatio(newRatio);
                    });
                };

                const handleMouseUp = () => {
                    if (splitterRafId.current) {
                        cancelAnimationFrame(splitterRafId.current);
                    }
                    isDraggingSplitter.current = false;
                    setIsSplitterDragging(false);
                    compareContainerRef.current = null;
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                };

                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
                return () => {
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                };
            }, [compareMode]);

            const [history, setHistory] = useState({ past: [], future: [] });
            const [isPanning, setIsPanning] = useState(false);
            const [draggingNodeId, setDraggingNodeId] = useState(null);
            const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, nodeIds: new Set() }); // 드래그 중 오프셋
            const [tempEdge, setTempEdge] = useState(null);
            const [selectedNodeId, setSelectedNodeId] = useState(null); // For modal
            const [selectedNodeIds, setSelectedNodeIds] = useState(new Set()); // For multi-select
            const [selectedEdgeId, setSelectedEdgeId] = useState(null);
            const [topNodeId, setTopNodeId] = useState(null);
            const [marquee, setMarquee] = useState(null); // For selection rectangle

            const lastMousePos = useRef({ x: 0, y: 0 });
            const hasConnectedRef = useRef(false);
            const [sidebarDrag, setSidebarDrag] = useState({ active: false, nodeId: null, type: null, startIdx: null, currentIdx: null, x: 0, y: 0 });
            const sidebarDragRef = useRef(null);
            const isMarqueeSelectingRef = useRef(false);
            const selectedNodeIdsRef = useRef(selectedNodeIds);

            const saveHistory = useCallback(() => { setHistory(prev => ({ past: [...prev.past.slice(-19), { projects }], future: [] })); }, [projects]);
            const undo = useCallback(() => { setHistory(prev => { if (prev.past.length === 0) return prev; const previous = prev.past[prev.past.length - 1]; const newPast = prev.past.slice(0, prev.past.length - 1); setProjects(previous.projects); showToast("실행 취소됨"); return { past: newPast, future: [{ projects }, ...prev.future] }; }); }, [projects, showToast]);

            useEffect(() => { selectedNodeIdsRef.current = selectedNodeIds; }, [selectedNodeIds]);

            useEffect(() => {
                const handleKeyDown = (e) => {
                    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.size > 0) {
                        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                        e.preventDefault();
                        if (confirm(`${selectedNodeIds.size}개의 노드를 삭제하시겠습니까?`)) {
                            saveHistory();
                            updateActiveProject(
                                prevNodes => prevNodes.filter(n => !selectedNodeIds.has(n.id)),
                                prevEdges => prevEdges.filter(edge => !selectedNodeIds.has(edge.from) && !selectedNodeIds.has(edge.to))
                            );
                            setSelectedNodeIds(new Set());
                        }
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [selectedNodeIds, saveHistory, updateActiveProject]);

            useEffect(() => {
                const handleUndoKeyDown = (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                        e.preventDefault(); undo();
                    }
                };
                window.addEventListener('keydown', handleUndoKeyDown);
                return () => window.removeEventListener('keydown', handleUndoKeyDown);
            }, [undo]);

            useEffect(() => {
                const handleZenModeKeyDown = (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
                        e.preventDefault();
                        if (activeProject && activeProject.type === 'doc') {
                            setIsZenMode(prev => !prev);
                        }
                    }
                };
                window.addEventListener('keydown', handleZenModeKeyDown);
                return () => window.removeEventListener('keydown', handleZenModeKeyDown);
            }, [activeProject]);

            useEffect(() => {
                const div = containerRef.current;
                const handleWheel = (e) => {
                    if (!div || e.target.closest('aside') || (activeProject && activeProject.type === 'doc') || corkboardMode) return;
                    e.preventDefault(); // 브라우저 기본 줌 방지

                    const rect = div.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    // 줌 속도 조절 (트랙패드 등 감안)
                    const delta = -e.deltaY * 0.001;

                    // 줌 범위 제한 (0.1 ~ 3.0 -> 0.2 ~ 5.0 정도가 적당)
                    const newScale = Math.min(Math.max(0.2, scale + delta), 5);

                    const scaleRatio = newScale / scale;
                    setPan(prev => ({
                        x: mouseX - (mouseX - prev.x) * scaleRatio,
                        y: mouseY - (mouseY - prev.y) * scaleRatio
                    }));
                    setScale(newScale);
                };
                if (div) {
                    div.addEventListener('wheel', handleWheel, { passive: false });
                    return () => div.removeEventListener('wheel', handleWheel);
                }
            }, [scale, activeProject, corkboardMode]);

            const getCanvasCoords = (clientX, clientY) => {
                if (!containerRef.current) return { x: 0, y: 0 };
                const rect = containerRef.current.getBoundingClientRect();
                return { x: (clientX - rect.left - pan.x) / scale, y: (clientY - rect.top - pan.y) / scale };
            };
            // 드래그 중 오프셋이 적용된 노드 위치 반환
            const findNode = (id) => {
                const node = nodes.find(n => n.id === id);
                if (!node) return null;
                if (draggingNodeId && dragOffset.nodeIds.has(id)) {
                    return { ...node, x: node.x + dragOffset.x, y: node.y + dragOffset.y };
                }
                return node;
            };

            const createNewProject = () => { const newId = generateUUID(); saveHistory(); setProjects(prev => [...prev, { id: newId, type: 'board', name: '새 보드', nodes: [], edges: [], sidebarColumns: 1 }]); setActiveProjectId(newId); setExpandedProjects(prev => ({ ...prev, [newId]: true })); setEditingProjectId(newId); setPan({ x: 0, y: 0 }); setScale(1); setIsZenMode(false); setIsTrashOpen(false); };
            const createNewDoc = () => { const newId = generateUUID(); saveHistory(); setProjects(prev => [...prev, { id: newId, type: 'doc', name: '새 문서', content: '　', history: [], status: '초고', targetCount: defaultTargetCount }]); setActiveProjectId(newId); setExpandedProjects(prev => ({ ...prev, [newId]: true })); setEditingProjectId(newId); setIsTrashOpen(false); };

            // 휴지통으로 이동
            const deleteProject = (id, e) => {
                if (e) e.stopPropagation();
                const projectToDelete = projects.find(p => p.id === id);
                if (!projectToDelete) return;

                saveHistory();
                setTrash(prev => [...prev, { ...projectToDelete, deletedAt: Date.now() }]);

                let newProjects = projects.filter(p => p.id !== id);
                if (newProjects.length === 0) {
                    const dummyId = generateUUID();
                    newProjects = [{ id: dummyId, type: 'board', name: '새 프로젝트', nodes: [], edges: [] }];
                    handleSelectProject(dummyId);
                } else if (activeProjectId === id) {
                    handleSelectProject(newProjects[0].id);
                }
                setProjects(newProjects);
                showToast("휴지통으로 이동됨");
            };

            // 휴지통에서 복원
            const restoreFromTrash = (id) => {
                const itemToRestore = trash.find(p => p.id === id);
                if (!itemToRestore) return;

                const { deletedAt, ...restoredProject } = itemToRestore;
                setProjects(prev => [...prev, restoredProject]);
                setTrash(prev => prev.filter(p => p.id !== id));
                showToast("복원됨");
            };

            // 휴지통에서 완전 삭제
            const permanentDelete = (id) => {
                if (confirm("완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                    setTrash(prev => prev.filter(p => p.id !== id));
                    showToast("완전히 삭제됨");
                }
            };

            // 휴지통 비우기
            const emptyTrash = () => {
                if (trash.length === 0) return;
                if (confirm(`휴지통의 ${trash.length}개 항목을 모두 삭제하시겠습니까?`)) {
                    setTrash([]);
                    showToast("휴지통 비움");
                }
            };
            const handleProjectRename = (id, newName) => { saveHistory(); setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p)); setEditingProjectId(null); };

            const getDefaultNodeData = (type) => {
                switch (type) {
                    case '인물': return { emoji: '👤', age: '', gender: '미지정', job: '', race: '인간', role: '조연', memo: '' };
                    case '사건': return { emoji: '🔥', place: '', year: '', memo: '' };
                    case '메모': return { emoji: '💡', category: '메모', memo: '' };
                    case '장소': return { emoji: '📍', region: '', climate: '', description: '', memo: '' };
                    case '아이템': return { emoji: '🎁', category: '일반', rarity: '보통', owner: '', effect: '', memo: '' };
                    case '세력': return { emoji: '⚔️', leader: '', members: '', territory: '', goal: '', memo: '' };
                    case '복선': return { emoji: '🎣', chapter: '', status: '미회수', hint: '', reveal: '', memo: '' };
                    case '타임라인': return { emoji: '⏰', date: '', era: '', importance: '보통', memo: '' };
                    case '설정': return { emoji: '📚', category: '세계관', scope: '', memo: '' };
                    case '대사': return { emoji: '💬', speaker: '', situation: '', emotion: '', memo: '' };
                    case '갈등': return { emoji: '⚡', parties: '', cause: '', status: '진행중', resolution: '', memo: '' };
                    case '할일': return { emoji: '✅', items: [], memo: '' };
                    case '그룹': return { emoji: '📁', color: '#94a3b8', width: 400, height: 300, childNodes: [], memo: '' };
                    default: return { emoji: '📝', memo: '' };
                }
            };
            const addNode = (type) => {
                saveHistory();
                const id = generateUUID();
                const rect = containerRef.current.getBoundingClientRect();
                const center = getCanvasCoords(rect.left + rect.width / 2, rect.top + rect.height / 2);

                const defaultData = getDefaultNodeData(type);

                updateActiveProject(prev => [...prev, { id, x: center.x - CARD_W / 2, y: center.y - CARD_H / 2, label: `새 ${type}`, type, data: defaultData }]);
                setTopNodeId(id);
            };
            const deleteNode = (id) => {
                saveHistory();

                updateActiveProject(
                    // 1. 노드 목록 업데이트
                    prevNodes => {
                        // 삭제 대상 노드 제거
                        const filtered = prevNodes.filter(n => n.id !== id);

                        // [추가된 로직] 남은 노드들 중 '그룹' 노드 내부에 삭제된 ID가 있다면 제거
                        return filtered.map(node => {
                            if (node.type === '그룹' && node.data.childNodes && node.data.childNodes.includes(id)) {
                                return {
                                    ...node,
                                    data: {
                                        ...node.data,
                                        childNodes: node.data.childNodes.filter(childId => childId !== id)
                                    }
                                };
                            }
                            return node;
                        });
                    },
                    // 2. 엣지 목록 업데이트 (기존과 동일)
                    prevEdges => prevEdges.filter(e => e.from !== id && e.to !== id)
                );

                if (selectedNodeId === id) setSelectedNodeId(null);
                setSelectedNodeIds(prev => { const next = new Set(prev); next.delete(id); return next; });
            };

            const resizeGroupNode = (id, width, height) => {
                updateActiveProject(prev => prev.map(n =>
                    n.id === id ? { ...n, data: { ...n.data, width, height } } : n
                ));
            };

            const ALL_NODE_TYPES = ['인물', '사건', '메모', '장소', '아이템', '세력', '복선', '타임라인', '설정', '대사', '갈등', '할일', '그룹'];
            const handleReorderNodes = (type, newOrder) => {
                saveHistory();
                updateActiveProject(allNodes => {
                    const newOrderIds = newOrder.map(n => n.id);
                    const reorderedNodes = newOrderIds.map(id => allNodes.find(n => n.id === id)).filter(Boolean);

                    // 각 타입별로 노드 분리
                    const nodesByType = {};
                    ALL_NODE_TYPES.forEach(t => {
                        nodesByType[t] = type === t ? reorderedNodes : allNodes.filter(n => n.type === t);
                    });

                    // 모든 타입의 노드를 순서대로 합침
                    return ALL_NODE_TYPES.flatMap(t => nodesByType[t]);
                });
            };

            const handleReorderBoards = (newOrder) => {
                saveHistory();
                setProjects(prevProjects => {
                    const docs = prevProjects.filter(p => p.type === 'doc');
                    const newOrderIds = newOrder.map(p => p.id);
                    const reorderedBoards = newOrderIds.map(id => prevProjects.find(p => p.id === id)).filter(Boolean);
                    return [...reorderedBoards, ...docs];
                });
            };

            const handleReorderDocs = (newOrder) => {
                setProjects(prevProjects => {
                    const boards = prevProjects.filter(p => p.type === 'board');
                    const newOrderIds = newOrder.map(p => p.id);
                    const reorderedDocs = newOrderIds.map(id => prevProjects.find(p => p.id === id)).filter(Boolean);
                    return [...boards, ...reorderedDocs];
                });
            };

            // 사이드바 그리드 드래그 핸들러
            const handleSidebarDragStart = (e, node, type, idx) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                setSidebarDrag({
                    active: true,
                    nodeId: node.id,
                    type,
                    startIdx: idx,
                    currentIdx: idx,
                    x: e.clientX,
                    y: e.clientY,
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top,
                    width: rect.width,
                    height: rect.height
                });
                sidebarDragRef.current = node;
            };

            const handleSidebarDragMove = useCallback((e) => {
                if (!sidebarDrag.active) return;
                setSidebarDrag(prev => ({ ...prev, x: e.clientX, y: e.clientY }));

                // 현재 마우스 위치에서 가장 가까운 드롭 타겟 찾기
                const elements = document.querySelectorAll(`[data-sidebar-type="${sidebarDrag.type}"]`);
                let closestIdx = sidebarDrag.startIdx;
                let closestDist = Infinity;

                elements.forEach((el, idx) => {
                    const rect = el.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIdx = idx;
                    }
                });

                if (closestIdx !== sidebarDrag.currentIdx) {
                    setSidebarDrag(prev => ({ ...prev, currentIdx: closestIdx }));
                }
            }, [sidebarDrag.active, sidebarDrag.type, sidebarDrag.startIdx, sidebarDrag.currentIdx]);

            const handleSidebarDragEnd = useCallback(() => {
                if (!sidebarDrag.active) return;

                const { type, startIdx, currentIdx } = sidebarDrag;
                if (startIdx !== currentIdx) {
                    saveHistory();
                    updateActiveProject(allNodes => {
                        const filtered = allNodes.filter(n => n.type === type);
                        const others = allNodes.filter(n => n.type !== type);

                        // 순서 변경
                        const newFiltered = [...filtered];
                        const [moved] = newFiltered.splice(startIdx, 1);
                        newFiltered.splice(currentIdx, 0, moved);

                        const persons = type === '인물' ? newFiltered : others.filter(n => n.type === '인물');
                        const events = type === '사건' ? newFiltered : others.filter(n => n.type === '사건');
                        const memos = type === '메모' ? newFiltered : others.filter(n => n.type === '메모');

                        return [...persons, ...events, ...memos];
                    });
                }

                setSidebarDrag({ active: false, nodeId: null, type: null, startIdx: null, currentIdx: null, x: 0, y: 0 });
                sidebarDragRef.current = null;
            }, [sidebarDrag, saveHistory, updateActiveProject]);

            useEffect(() => {
                if (sidebarDrag.active) {
                    window.addEventListener('mousemove', handleSidebarDragMove);
                    window.addEventListener('mouseup', handleSidebarDragEnd);
                    return () => {
                        window.removeEventListener('mousemove', handleSidebarDragMove);
                        window.removeEventListener('mouseup', handleSidebarDragEnd);
                    };
                }
            }, [sidebarDrag.active, handleSidebarDragMove, handleSidebarDragEnd]);

            // 1. Workspace 컴포넌트 상단(ref 선언부)에 rAF용 ref 추가
            const rAF = useRef(null);
            const latestMousePos = useRef({ x: 0, y: 0 });

            const isPanningRef = useRef(isPanning);
            const draggingNodeIdRef = useRef(draggingNodeId);
            const scaleRef = useRef(scale);
            const tempEdgeRef = useRef(tempEdge);
            const nodesRef = useRef(nodes);
            const dragOffsetRef = useRef({ x: 0, y: 0, nodeIds: new Set() });

            useEffect(() => { isPanningRef.current = isPanning; }, [isPanning]);
            useEffect(() => { draggingNodeIdRef.current = draggingNodeId; }, [draggingNodeId]);
            useEffect(() => { scaleRef.current = scale; window.currentScale = scale; }, [scale]);
            useEffect(() => { tempEdgeRef.current = tempEdge; }, [tempEdge]);
            useEffect(() => { nodesRef.current = nodes; }, [nodes]);

            // 2. handleGlobalMouseMove 함수 교체
            const handleGlobalMouseMove = (e) => {
                if (activeProject.type === 'doc') return;

                const currentX = e.clientX;
                const currentY = e.clientY;
                const dx = currentX - lastMousePos.current.x;
                const dy = currentY - lastMousePos.current.y;

                if (isMarqueeSelectingRef.current && marquee) {
                    const currentCoords = getCanvasCoords(currentX, currentY);
                    setMarquee(prev => {
                        const x = Math.min(prev.startX, currentCoords.x);
                        const y = Math.min(prev.startY, currentCoords.y);
                        const width = Math.abs(currentCoords.x - prev.startX);
                        const height = Math.abs(currentCoords.y - prev.startY);
                        return { ...prev, x, y, width, height };
                    });
                } else if (isPanningRef.current) {
                    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                } else if (draggingNodeIdRef.current) {
                    const scaleFactor = 1 / scaleRef.current;
                    const dragId = draggingNodeIdRef.current;
                    const deltaX = dx * scaleFactor;
                    const deltaY = dy * scaleFactor;
                    const selectedIds = selectedNodeIdsRef.current;

                    // 이동할 노드 ID 집합을 미리 계산 (첫 프레임에서만)
                    let nodesToMove = dragOffsetRef.current.nodeIds;
                    if (nodesToMove.size === 0) {
                        nodesToMove = new Set();
                        const currentNodes = nodes;

                        // 재귀적으로 그룹의 모든 자식 노드 수집
                        const collectAllChildren = (nodeId, nodesList) => {
                            nodesToMove.add(nodeId);
                            const node = nodesList.find(n => n.id === nodeId);
                            if (node?.type === '그룹' && node.data.childNodes) {
                                node.data.childNodes.forEach(childId => {
                                    if (!nodesToMove.has(childId)) {
                                        collectAllChildren(childId, nodesList);
                                    }
                                });
                            }
                        };

                        const draggedNode = currentNodes.find(n => n.id === dragId);
                        const isGroupDrag = draggedNode?.type === '그룹';

                        if (selectedIds.has(dragId) && selectedIds.size > 1) {
                            selectedIds.forEach(id => nodesToMove.add(id));
                        } else if (isGroupDrag) {
                            collectAllChildren(dragId, currentNodes);
                        } else {
                            nodesToMove.add(dragId);
                        }
                        dragOffsetRef.current.nodeIds = nodesToMove;
                    }

                    // 오프셋 누적
                    const newOffsetX = dragOffsetRef.current.x + deltaX;
                    const newOffsetY = dragOffsetRef.current.y + deltaY;
                    dragOffsetRef.current = { x: newOffsetX, y: newOffsetY, nodeIds: nodesToMove };
                    setDragOffset({ x: newOffsetX, y: newOffsetY, nodeIds: nodesToMove });
                }

                if (tempEdgeRef.current) {
                    const c = getCanvasCoords(currentX, currentY);
                    setTempEdge(prev => ({ ...prev, toX: c.x, toY: c.y }));
                }

                lastMousePos.current = { x: currentX, y: currentY };
            };

            const handleGlobalMouseUp = (e) => {
                if (activeProject.type === 'board') {
                    if (isMarqueeSelectingRef.current && marquee) {
                        const marqueeRect = { x: marquee.x, y: marquee.y, x2: marquee.x + marquee.width, y2: marquee.y + marquee.height };
                        const nodesInMarquee = nodes.filter(node => {
                            const nodeRect = { x: node.x, y: node.y, x2: node.x + CARD_W, y2: node.y + CARD_H };
                            return nodeRect.x < marqueeRect.x2 && nodeRect.x2 > marqueeRect.x && nodeRect.y < marqueeRect.y2 && nodeRect.y2 > marqueeRect.y;
                        });

                        if (e.shiftKey) {
                            setSelectedNodeIds(prev => {
                                const newSet = new Set(prev);
                                nodesInMarquee.forEach(node => newSet.add(node.id));
                                selectedNodeIdsRef.current = newSet;
                                return newSet;
                            });
                        } else {
                            const newSet = new Set(nodesInMarquee.map(n => n.id));
                            setSelectedNodeIds(newSet);
                            selectedNodeIdsRef.current = newSet;
                        }
                    }

                    isMarqueeSelectingRef.current = false;
                    setMarquee(null);

                    // 노드 드래그 종료 시 위치 저장 및 그룹 영역 체크
                    if (draggingNodeId) {
                        const offset = dragOffsetRef.current;
                        const movedNodeIds = offset.nodeIds;

                        // 오프셋이 있으면 실제 위치 저장
                        if (offset.x !== 0 || offset.y !== 0) {
                            saveHistory();
                            updateActiveProject(prevNodes => prevNodes.map(n =>
                                movedNodeIds.has(n.id) ? { ...n, x: n.x + offset.x, y: n.y + offset.y } : n
                            ));
                        }

                        // 오프셋 초기화
                        dragOffsetRef.current = { x: 0, y: 0, nodeIds: new Set() };
                        setDragOffset({ x: 0, y: 0, nodeIds: new Set() });

                        // 이동된 모든 노드들에 대해 그룹 체크 (그룹 노드는 제외)
                        movedNodeIds.forEach(mId => {
                            const mNode = nodes.find(n => n.id === mId);
                            if (mNode && mNode.type !== '그룹') {
                                const nodeCenterX = mNode.x + offset.x + CARD_W / 2;
                                const nodeCenterY = mNode.y + offset.y + CARD_H / 2;

                                const currentParentGroup = nodes.find(n => n.type === '그룹' && n.id !== mId && n.data.childNodes?.includes(mId));
                                const groupNodes = nodes.filter(n => n.type === '그룹');
                                let targetGroup = null;

                                for (const group of groupNodes) {
                                    const gx = group.x + (movedNodeIds.has(group.id) ? offset.x : 0);
                                    const gy = group.y + (movedNodeIds.has(group.id) ? offset.y : 0);
                                    const gw = group.data.width || 400;
                                    const gh = group.data.height || 300;

                                    if (nodeCenterX >= gx && nodeCenterX <= gx + gw &&
                                        nodeCenterY >= gy && nodeCenterY <= gy + gh) {
                                        targetGroup = group;
                                        break;
                                    }
                                }

                                // 그룹 상태 변경이 필요한 경우에만 업데이트
                                if (currentParentGroup?.id !== targetGroup?.id) {
                                    updateActiveProject(prevNodes => prevNodes.map(n => {
                                        // 기존 그룹에서 제거
                                        if (currentParentGroup && n.id === currentParentGroup.id) {
                                            return { ...n, data: { ...n.data, childNodes: (n.data.childNodes || []).filter(id => id !== mId) } };
                                        }
                                        // 새 그룹에 추가
                                        if (targetGroup && n.id === targetGroup.id) {
                                            if (!n.data.childNodes?.includes(mId)) {
                                                return { ...n, data: { ...n.data, childNodes: [...(n.data.childNodes || []), mId] } };
                                            }
                                        }
                                        return n;
                                    }));
                                }
                            }
                        });
                    }
                    if (tempEdge && !hasConnectedRef.current) {
                        const c = getCanvasCoords(e.clientX, e.clientY);
                        // 마우스 위치에 있는 노드 찾기 (출발 노드 제외)
                        const targetNode = nodes.find(n =>
                            n.id !== tempEdge.fromId &&
                            c.x >= n.x && c.x <= n.x + CARD_W &&
                            c.y >= n.y && c.y <= n.y + CARD_H
                        );

                        if (targetNode) {
                            const edgeExists = edges.some(e =>
                                (e.from === tempEdge.fromId && e.to === targetNode.id) ||
                                (e.from === targetNode.id && e.to === tempEdge.fromId)
                            );
                            if (edgeExists) {
                            } else {
                                saveHistory();
                                const fromNode = findNode(tempEdge.fromId);
                                const edgeLabel = '';
                                updateActiveProject(null, prev => [...prev, { id: generateUUID(), from: tempEdge.fromId, to: targetNode.id, label: edgeLabel }]);
                            }
                        } else {
                            const fromNode = findNode(tempEdge.fromId);
                            if (fromNode) {
                                saveHistory();
                                const newNodeId = generateUUID();
                                const defaultData = getDefaultNodeData(fromNode.type);
                                const edgeLabel = '';
                                updateActiveProject(prev => [...prev, { id: newNodeId, x: c.x - CARD_W / 2, y: c.y - CARD_H / 2, label: `새 ${fromNode.type}`, type: fromNode.type, data: defaultData }], prev => [...prev, { id: generateUUID(), from: tempEdge.fromId, to: newNodeId, label: edgeLabel }]);
                            }
                        }
                    }
                    hasConnectedRef.current = false;
                    setIsPanning(false);
                    setDraggingNodeId(null);
                    setTempEdge(null);
                }
            };

            const handleDocInput = (e) => {
                const inputType = e.nativeEvent.inputType;
                let val = e.target.value;
                let pos = e.target.selectionStart;
                const lastChar = val[pos - 1];

                // 줄바꿈 시 자동 들여쓰기 (문단 첫줄 띄우기)
                if (inputType === 'insertLineBreak') {
                    const indent = '　'; // 공백으로 확실하게 들여쓰기
                    const scrollTop = e.target.scrollTop; // 스크롤 위치 저장
                    val = val.slice(0, pos) + indent + val.slice(pos);

                    updateDocContent(val);
                    requestAnimationFrame(() => {
                        if (textareaRef.current) {
                            textareaRef.current.scrollTop = scrollTop; // 스크롤 위치 복구
                            textareaRef.current.setSelectionRange(pos + indent.length, pos + indent.length);
                            // 엔터 입력 직후 스크롤 목표 갱신
                            if (isZenMode) {
                                updateFocusScroll();
                            }
                        }
                    });
                    return;
                }

                if (inputType === 'insertFromPaste') {
                    if (mention.active) {
                        const currentSearch = val.slice(mention.pos, pos);
                        if (/[\s\n]/.test(currentSearch)) {
                            setMention({ ...mention, active: false });
                        } else {
                            setMention({ ...mention, search: currentSearch, selectedIndex: 0 });
                        }
                    }
                    updateDocContent(val);
                    return;
                }

                if (lastChar === '#' || lastChar === '@' || lastChar === '$' || lastChar === '%') {
                    const coords = getCaretCoordinates(e.target, pos);
                    const rect = e.target.getBoundingClientRect();
                    const visualY = coords.top - (e.target.scrollTop * 2);

                    let finalX, finalY;

                    if (isZenMode) {
                        finalX = Math.max(rect.left + 20, rect.left + coords.left - 610);
                        finalY = visualY + 20;
                    } else {
                        finalX = coords.left;
                        finalY = visualY + 25;
                    }

                    const menuWidth = 600;
                    const menuHeight = 400;

                    if (finalX + menuWidth > window.innerWidth) finalX = window.innerWidth - menuWidth - 20;
                    if (!isZenMode && (finalY + menuHeight > window.innerHeight)) {
                        finalY = visualY - menuHeight - 10;
                    }

                    setMention({ active: true, type: lastChar, search: '', x: finalX, y: finalY, pos, selectedIndex: 0 });

                } else if (mention.active) {
                    const currentSearch = val.slice(mention.pos, pos);
                    if (!lastChar || /[\s\n]/.test(lastChar) || pos < mention.pos) {
                        setMention({ ...mention, active: false });
                    } else {
                        setMention({ ...mention, search: currentSearch, selectedIndex: 0 });
                    }
                }

                updateDocContent(val);
            };

            const insertMention = (node) => {
                const text = activeProject.content || "";
                const before = text.slice(0, mention.pos - 1);
                const after = text.slice(mention.pos + mention.search.length);
                const insertedText = node.label + "";
                const newText = before + insertedText + after;
                updateDocContent(newText);
                setMention({ ...mention, active: false });
                const newCursorPos = before.length + insertedText.length;
                requestAnimationFrame(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                        if (typeof updateFocusScroll === 'function') {
                            updateFocusScroll();
                        }
                    }
                });
            };

            const handleDocKeyDown = (e) => {
                if (e.nativeEvent.isComposing) return;

                if (mention.active) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setMention(prev => ({ ...prev, selectedIndex: (prev.selectedIndex + 1) % filteredMentionNodes.length }));
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setMention(prev => ({ ...prev, selectedIndex: (prev.selectedIndex - 1 + filteredMentionNodes.length) % filteredMentionNodes.length }));
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredMentionNodes[mention.selectedIndex]) insertMention(filteredMentionNodes[mention.selectedIndex]);
                    } else if (e.key === 'Escape') {
                        setMention({ ...mention, active: false });
                    }
                }
            };

            const handleAutoLayout = useCallback(() => {
                if (!window.dagre) {
                    showToast("정렬 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.", "error");
                    return;
                }
                if (!activeProject || activeProject.type !== 'board') return;
                saveHistory();

                const GAP_BETWEEN_GROUPS = 400;

                const groups = {
                    '인물': activeProject.nodes.filter(n => n.type === '인물'),
                    '사건': activeProject.nodes.filter(n => n.type === '사건'),
                    '메모': activeProject.nodes.filter(n => n.type === '메모'),
                    '장소': activeProject.nodes.filter(n => n.type === '장소'),
                    '아이템': activeProject.nodes.filter(n => n.type === '아이템'),
                    '세력': activeProject.nodes.filter(n => n.type === '세력'),
                    '복선': activeProject.nodes.filter(n => n.type === '복선'),
                    '타임라인': activeProject.nodes.filter(n => n.type === '타임라인'),
                    '설정': activeProject.nodes.filter(n => n.type === '설정'),
                    '대사': activeProject.nodes.filter(n => n.type === '대사'),
                    '갈등': activeProject.nodes.filter(n => n.type === '갈등'),
                    '할일': activeProject.nodes.filter(n => n.type === '할일'),
                    '그룹': activeProject.nodes.filter(n => n.type === '그룹')
                };

                const getInternalEdges = (groupNodes) => {
                    const ids = new Set(groupNodes.map(n => n.id));
                    return activeProject.edges.filter(e => ids.has(e.from) && ids.has(e.to));
                };

                const layoutGroup = (groupNodes, groupEdges) => {
                    if (groupNodes.length === 0) return { nodes: [], width: 0, height: 0 };
                    const g = new dagre.graphlib.Graph();
                    g.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 60 });
                    g.setDefaultEdgeLabel(() => ({}));
                    groupNodes.forEach(node => g.setNode(node.id, { width: CARD_W, height: CARD_H }));
                    groupEdges.forEach(edge => g.setEdge(edge.from, edge.to));
                    dagre.layout(g);

                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    const positioned = groupNodes.map(node => {
                        const pos = g.node(node.id);
                        const x = pos.x - CARD_W / 2;
                        const y = pos.y - CARD_H / 2;
                        if (x < minX) minX = x;
                        if (x + CARD_W > maxX) maxX = x + CARD_W;
                        if (y < minY) minY = y;
                        if (y + CARD_H > maxY) maxY = y + CARD_H;
                        return { ...node, x, y };
                    });
                    return {
                        nodes: positioned.map(n => ({ ...n, x: n.x - minX, y: n.y - minY })),
                        width: maxX - minX,
                        height: maxY - minY
                    };
                };

                // 각 타입별 레이아웃
                const results = {};
                Object.keys(groups).forEach(type => {
                    results[type] = layoutGroup(groups[type], getInternalEdges(groups[type]));
                });

                // Row 1: 인물, 사건, 메모, 할일
                const ROW_GAP = 100;
                let row1X = 0;
                let row1Height = 0;

                const finalNodes = [];

                ['인물', '사건', '메모', '할일'].forEach(type => {
                    if (results[type].nodes.length > 0) {
                        results[type].nodes.forEach(n => finalNodes.push({ ...n, x: n.x + row1X, y: n.y }));
                        row1X += results[type].width + GAP_BETWEEN_GROUPS;
                        row1Height = Math.max(row1Height, results[type].height);
                    }
                });

                // Row 2: 장소, 세력, 설정
                let row2X = 0;
                let row2Y = row1Height + ROW_GAP;
                let row2Height = 0;

                ['장소', '세력', '설정'].forEach(type => {
                    if (results[type].nodes.length > 0) {
                        results[type].nodes.forEach(n => finalNodes.push({ ...n, x: n.x + row2X, y: n.y + row2Y }));
                        row2X += results[type].width + GAP_BETWEEN_GROUPS;
                        row2Height = Math.max(row2Height, results[type].height);
                    }
                });

                // Row 3: 복선, 타임라인, 대사, 갈등
                let row3X = 0;
                let row3Y = row2Y + row2Height + ROW_GAP;
                let row3Height = 0;

                ['복선', '타임라인', '대사', '갈등'].forEach(type => {
                    if (results[type].nodes.length > 0) {
                        results[type].nodes.forEach(n => finalNodes.push({ ...n, x: n.x + row3X, y: n.y + row3Y }));
                        row3X += results[type].width + GAP_BETWEEN_GROUPS;
                        row3Height = Math.max(row3Height, results[type].height);
                    }
                });

                // Row 4: 아이템
                let row4X = 0;
                let row4Y = row3Y + row3Height + ROW_GAP;

                ['아이템'].forEach(type => {
                    if (results[type].nodes.length > 0) {
                        results[type].nodes.forEach(n => finalNodes.push({ ...n, x: n.x + row4X, y: n.y + row4Y }));
                        row4X += results[type].width + GAP_BETWEEN_GROUPS;
                    }
                });

                // 그룹 노드는 대각선으로 겹쳐서 배치
                const DIAGONAL_OFFSET = 50;
                let groupX = row4X + GAP_BETWEEN_GROUPS;
                let groupY = row4Y;
                results['그룹'].nodes.forEach((n, idx) => {
                    finalNodes.push({ ...n, x: groupX + idx * DIAGONAL_OFFSET, y: groupY + idx * DIAGONAL_OFFSET });
                });

                const positionMap = new Map();
                finalNodes.forEach(n => positionMap.set(n.id, { x: n.x, y: n.y }));

                // 자동 정렬 시 모든 그룹 노드의 childNodes 초기화
                updateActiveProject(prevNodes =>
                    prevNodes.map(n => {
                        const newPos = positionMap.get(n.id);
                        if (n.type === '그룹') {
                            // 그룹 노드는 childNodes 초기화
                            return newPos
                                ? { ...n, x: newPos.x, y: newPos.y, data: { ...n.data, childNodes: [] } }
                                : { ...n, data: { ...n.data, childNodes: [] } };
                        }
                        return newPos ? { ...n, x: newPos.x, y: newPos.y } : n;
                    })
                );

                setTimeout(() => fitToScreen(finalNodes), 100);

            }, [activeProject, saveHistory, updateActiveProject, fitToScreen]);


            const activeNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);
            const activeEdge = useMemo(() => edges.find(e => e.id === selectedEdgeId), [edges, selectedEdgeId]);

            // 드래그 중인 노드에 오프셋 적용
            const getDisplayNodes = () => {
                if (!draggingNodeId || (dragOffset.x === 0 && dragOffset.y === 0)) return nodes;
                return nodes.map(n =>
                    dragOffset.nodeIds.has(n.id)
                        ? { ...n, x: n.x + dragOffset.x, y: n.y + dragOffset.y }
                        : n
                );
            };
            const displayNodes = getDisplayNodes();

            const visibleNodes = (() => {
                if (activeProject?.type !== 'board') return [];
                if (isPanning || draggingNodeId) {
                    return displayNodes;
                }

                const viewportW = window.innerWidth;
                const viewportH = window.innerHeight;
                const buffer = 300;

                return displayNodes.filter(node => {
                    const screenX = node.x * scale + pan.x;
                    const screenY = node.y * scale + pan.y;
                    const nodeW = node.type === '그룹' ? (node.data.width || 400) : CARD_W;
                    const nodeH = node.type === '그룹' ? (node.data.height || 300) : CARD_H;
                    return (
                        screenX > -nodeW * scale - buffer &&
                        screenX < viewportW + buffer &&
                        screenY > -nodeH * scale - buffer &&
                        screenY < viewportH + buffer
                    );
                });
            })();

            const visibleGroupNodes = visibleNodes.filter(n => n.type === '그룹');
            const visibleRegularNodes = visibleNodes.filter(n => n.type !== '그룹');
            // 엣지는 nodes에서 직접 참조하여 동기화 문제 해결
            const visibleEdges = (() => { if (activeProject?.type !== 'board') return []; const nodeIds = new Set(nodes.map(n => n.id)); return edges.filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)); })();

            const renderProjectItem = (project) => {
                const isActive = !isTrashOpen && activeProjectId === project.id; const isDoc = project.type === 'doc'; const isExpanded = expandedProjects[project.id];
                const cols = project.sidebarColumns || 1;
                const containerClasses = isDoc
                    ? `transition-all duration-200 border-b border-slate-200/50 dark:border-zinc-700/50 last:border-0 ${isActive ? 'bg-white dark:bg-zinc-700' : 'hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'}`
                    : `rounded-[3px] mb-1 transition-all duration-300 ${isActive
                        ? 'bg-white shadow-md border-2 border-indigo-200 dark:bg-zinc-700 dark:border-indigo-500'
                        : 'bg-slate-50 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700'
                    }`;

                const projectContent = (
                    <div className={containerClasses}>
                        <div onClick={(e) => handleSelectProject(project.id, e)} onDoubleClick={(e) => { e.stopPropagation(); setEditingProjectId(project.id); }} className={`flex items-center px-4 cursor-pointer group relative overflow-hidden ${isDoc ? 'h-[30px] py-0' : 'py-1.5'}`}>
                            {isActive && <div className={`absolute left-0 top-0 bottom-0 ${isDoc ? 'w-[3px]' : 'w-1'} bg-indigo-600 dark:bg-indigo-500`} />}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 z-10">
                                <span onClick={(e) => !isDoc && toggleProjectFolder(project.id, e)} className={`${isDoc ? 'text-sm opacity-50' : 'text-base'} shrink-0 dark:text-zinc-300`}>{isDoc ? '📄' : (isExpanded ? '📂' : '📁')}</span>
                                {editingProjectId === project.id ? (<input autoFocus className="w-full bg-white border border-indigo-400 rounded-[3px] px-1 text-[12px] font-bold outline-none dark:bg-zinc-700 dark:text-white" defaultValue={project.name} onBlur={(e) => handleProjectRename(project.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleProjectRename(project.id, e.target.value)} />) : (
                                    <div className="flex items-center min-w-0 flex-1 justify-between">
                                        <span className={`text-[12px] truncate flex-1 mr-2 ${isActive ? 'text-slate-900 font-black dark:text-white' : 'text-slate-500 font-semibold dark:text-zinc-400'}`}>{project.name}</span>
                                        {isExpanded && !isDoc && (
                                            <div className="flex items-center gap-0.5 bg-slate-200 dark:bg-zinc-900 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {[1, 2, 3, 4].map(col => (
                                                    <button
                                                        key={col}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSidebarCols(project.id, col);
                                                        }}
                                                        className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-sm transition-colors ${cols === col
                                                            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm'
                                                            : 'text-slate-400 hover:bg-white/50 dark:text-zinc-500 dark:hover:bg-zinc-700/50'
                                                            }`}
                                                        title={`${col}열 보기`}
                                                    >
                                                        {col}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center shrink-0">
                                            {isDoc && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[3px] ${getStatusBadgeStyle(project.status || '초고')}`}>{project.status || '초고'}</span>}
                                            <button onClick={(e) => deleteProject(project.id, e)} className="w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 group-hover:ml-1.5 overflow-hidden flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-300 scale-90 dark:text-zinc-500 dark:hover:text-red-400"><IconTrash className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isDoc && (
                            (isExpanded && project.type === 'board') && (
                                <div className="overflow-hidden bg-slate-50/30 rounded-b-[3px] border-slate-100 dark:bg-zinc-800/30 dark:border-zinc-700">
                                    <div className="pb-3 px-3 space-y-3 pt-2">                                                {(() => {
                                        const cols = project.sidebarColumns || 1;
                                        return ALL_NODE_TYPES.map(type => {
                                            const filtered = (project.nodes || []).filter(n => n.type === type); if (filtered.length === 0) return null;
                                            return (
                                                <div key={type} className="pl-1">
                                                    <div className="text-[9px] font-black text-slate-400 mb-1.5 px-2 uppercase tracking-tighter flex items-center gap-2"><span className="w-1 h-1 bg-slate-300 rounded-[3px] dark:bg-zinc-600"></span>{type}</div>
                                                    {cols === 1 ? (
                                                        <Reorder.Group axis="y" values={filtered} onReorder={(newOrder) => handleReorderNodes(type, newOrder)} className="space-y-1">
                                                            {filtered.map(n => (
                                                                <Reorder.Item
                                                                    key={n.id}
                                                                    value={n}
                                                                    dragElastic={0.5}
                                                                    transition={{ type: "tween", duration: 0.15 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectProject(project.id);
                                                                        setSelectedNodeIds(new Set([n.id]));
                                                                        animateViewport({
                                                                            x: -(n.x + CARD_W / 2) * scale + (window.innerWidth - 320) / 2,
                                                                            y: -(n.y + CARD_H / 2) * scale + window.innerHeight / 2
                                                                        }, scale);
                                                                    }}
                                                                    onDoubleClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedNodeIds(new Set());
                                                                        setSelectedNodeId(n.id);
                                                                    }}
                                                                    className={`group/node py-1.5 px-3 bg-white hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700/80 rounded-[3px] flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing shadow-sm transition-colors border-l-4 dark:bg-zinc-800/90 dark:border-zinc-700 ${getSidebarItemAccent(n)} ${(selectedNodeIds.has(n.id) || selectedNodeId === n.id) ? `border-2 ${getSelectedBorderColor(n)}` : 'border-2 border-slate-200 dark:border-zinc-700'}`}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                        <span className="text-xs shrink-0">{n.data.emoji}</span>
                                                                        <span className="text-[11px] font-bold text-slate-600 truncate dark:text-zinc-300">{n.label}</span>
                                                                    </div>
                                                                    <div className="flex items-center shrink-0">
                                                                        {n.type === '인물' && (
                                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[3px] shrink-0 ${getRoleBadgeStyle(n.data.role)}`}>
                                                                                {n.data.role}
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (confirm(`'${n.label}'을(를) 삭제하시겠습니까?`)) deleteNode(n.id);
                                                                            }}
                                                                            className="w-0 opacity-0 group-hover/node:w-5 group-hover/node:opacity-100 group-hover/node:ml-1.5 overflow-hidden flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-300 scale-90 dark:text-zinc-500 dark:hover:text-red-400"
                                                                        >
                                                                            <IconTrash className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </Reorder.Item>
                                                            ))}
                                                        </Reorder.Group>
                                                    ) : (
                                                        <div className={`grid gap-1 ${cols === 4 ? 'grid-cols-4' : cols === 3 ? 'grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                            {filtered.map(n => (
                                                                <div
                                                                    key={n.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectProject(project.id);
                                                                        setSelectedNodeIds(new Set([n.id]));
                                                                        animateViewport({
                                                                            x: -(n.x + CARD_W / 2) * scale + (window.innerWidth - 320) / 2,
                                                                            y: -(n.y + CARD_H / 2) * scale + window.innerHeight / 2
                                                                        }, scale);
                                                                    }}
                                                                    onDoubleClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedNodeIds(new Set());
                                                                        setSelectedNodeId(n.id);
                                                                    }}
                                                                    className={`group/node py-1.5 px-2 bg-white hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700/80 rounded-[3px] flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors border-l-4 dark:bg-zinc-800/90 dark:border-zinc-700 ${getSidebarItemAccent(n)} ${(selectedNodeIds.has(n.id) || selectedNodeId === n.id) ? `border-2 ${getSelectedBorderColor(n)}` : 'border-2 border-slate-200 dark:border-zinc-700'}`}
                                                                >
                                                                    {cols !== 4 && <span className="text-xs shrink-0">{n.data.emoji}</span>}
                                                                    <span className={`font-bold text-slate-600 truncate dark:text-zinc-300 flex-1 min-w-0 ${cols === 4 ? 'text-[9px]' : 'text-[10px]'}`}>{n.label}</span>
                                                                    {cols === 2 && n.type === '인물' && n.data.role && (
                                                                        <span className={`text-[7px] font-black px-1 py-0.5 rounded-[3px] shrink-0 ${getRoleBadgeStyle(n.data.role)}`}>
                                                                            {n.data.role}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                );

                if (isDoc) {
                    return projectContent;
                }

                return (
                    <Reorder.Item
                        key={project.id}
                        value={project}
                        dragElastic={0}
                        transition={{ duration: 0 }}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        {projectContent}
                    </Reorder.Item>
                );
            };

            if (!activeProject) return null;

            return (
                <div className={`flex w-screen h-screen no-drag transition-colors duration-500 ${isTrashOpen ? 'bg-[#f8fafc] dark:bg-[#09080B]' : (activeProject.type === 'board' ? 'grid-background' : 'dot-background')} ${(isPanning || draggingNodeId) ? 'is-dragging' : ''}`} onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp} onContextMenu={e => e.preventDefault()}>
                    {showSystemSettings && (
                        <SystemSettingsModal
                            onClose={() => setShowSystemSettings(false)}
                            user={user}
                            onLogin={onLogin}
                            onLogout={onLogout}
                            onWithdrawal={onWithdrawal}
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                            fontMode={fontMode}
                            toggleFont={toggleFont}
                            activeProject={activeProject}
                            onUpdateProject={(updated) => {
                                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                            }}
                            focusPosition={focusPosition}
                            setFocusPosition={setFocusPosition}
                            defaultTargetCount={defaultTargetCount}
                            setDefaultTargetCount={setDefaultTargetCount}
                            editorWidth={editorWidth}
                            setEditorWidth={setEditorWidth}
                            editorFontSize={editorFontSize}
                            setEditorFontSize={setEditorFontSize}
                            showDocWordCount={showDocWordCount}
                            setShowDocWordCount={setShowDocWordCount}
                            enableHistory={enableHistory}
                            setEnableHistory={setEnableHistory}
                            cloudAutoSaveInterval={cloudAutoSaveInterval}
                            setCloudAutoSaveInterval={setCloudAutoSaveInterval}
                        />
                    )}
                    
                    <aside className={`workspace-sidebar h-full bg-[#f5f5f5] border-r border-slate-200 z-[100] flex flex-col shadow-2xl overflow-hidden dark:bg-[#141417] dark:border-zinc-700/50 transition-all duration-500 ease-in-out ${isZenMode ? 'w-0 -translate-x-full opacity-0' : (isSidebarOpen ? 'w-80 opacity-100' : 'w-0 -translate-x-full opacity-0')
                        }`} style={{ borderRadius: 0 }}>

                        <div className="w-full bg-slate-800 rounded-none">
                            <div
                                onClick={onExit}
                                className="w-full py-2 px-5 flex items-center gap-3 transition-all duration-300 cursor-pointer hover:bg-slate-700"
                            >
                                <div className="w-4 h-4 bg-white/10 flex items-center justify-center transition-all">
                                    <IconBack className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[12px] text-slate-400 tracking-tight">내 서재로 돌아가기</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="px-6 pt-6 pb-5 border-b border-slate-200/60 dark:border-zinc-800/60"
                            style={{
                                backgroundColor: isDarkMode ? `${currentBook.color}12` : `${currentBook.color}22`,
                            }}
                        >
                            <div className="text-left">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500 rounded-[2px] tracking-widest uppercase border border-slate-200/50 dark:border-zinc-700/30">Novel project</span>
                                </div>

                                <h1 className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tighter leading-tight">
                                    {currentBook.title}
                                </h1>

                                <div className="flex items-center gap-2 mt-2 opacity-60">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide">
                                        {currentBook.author || '작가 미상'}
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div className="flex-1 overflow-y-auto px-3 pt-4 custom-scroll pb-10">
                                                        <div className="mb-5 mobile-hide">
                                                            <div className="flex items-center justify-between mb-3 px-2">
                                                                <div 
                                                                    onClick={() => {
                                                                        const firstBoard = projects.find(p => p.type === 'board');
                                                                        if (firstBoard) {
                                                                            handleSelectProject(firstBoard.id);
                                                                            setCorkboardMode(false);
                                                                        }
                                                                    }}
                                                                    className={`text-[9px] font-black px-2 py-0.5 rounded-[2px] tracking-widest uppercase border flex items-center gap-2 cursor-pointer transition-colors ${activeProject?.type === 'board' && !corkboardMode && !isTrashOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500 border-slate-200/50 dark:border-zinc-700/30 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${activeProject?.type === 'board' && !corkboardMode && !isTrashOpen ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span> 아이디어 보드 ({projects.filter(p => p.type === 'board').length})
                                                                </div>
                                                                <button onClick={createNewProject} className="text-slate-400 hover:text-indigo-600 transition-colors" title="새 보드 추가">
                                                                    <IconPlus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <Reorder.Group axis="y" values={projects.filter(p => p.type === 'board')} onReorder={handleReorderBoards} className="space-y-1">
                                                                {projects.filter(p => p.type === 'board').map(project => renderProjectItem(project))}
                                                            </Reorder.Group>
                                                        </div>
                                                                                    <div>
                                                                                        <div className="flex items-center justify-between mb-3 px-2 group h-7">
                                                                                                                                <div className="flex gap-1">
                                                                                                                                                                                                                                                                                                                                            <div 
                                                                                                                                                                                                                                                                                                                                                onClick={() => {
                                                                                                                                                                                                                                                                                                                                                    const firstDoc = projects.find(p => p.type === 'doc');
                                                                                                                                                                                                                                                                                                                                                    if (firstDoc) {
                                                                                                                                                                                                                                                                                                                                                        handleSelectProject(firstDoc.id);
                                                                                                                                                                                                                                                                                                                                                        setCorkboardMode(false);
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                }}
                                                                                                                                                                                                                                                                                                                                                className={`text-[9px] font-black px-2 py-0.5 rounded-[2px] tracking-widest uppercase border flex items-center gap-2 cursor-pointer transition-colors ${(activeProject?.type === 'doc' || compareMode) && !corkboardMode && !isTrashOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500 border-slate-200/50 dark:border-zinc-700/30 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
                                                                                                                                                                                                                                                                                                                                                title="문서함"
                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                <span className={`w-1.5 h-1.5 rounded-full ${(activeProject?.type === 'doc' || compareMode) && !corkboardMode && !isTrashOpen ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                                                                                                                                                                                                                                                                                                                {compareMode ? '비교 모드' : `문서함 (${projects.filter(p => p.type === 'doc').length})`}
                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                            <div 
                                                                                                                                                                                                                                                                                                                                                onClick={() => { setCorkboardMode(true); setCompareMode(false); setActiveProjectId(null); }}                                                                                                                                            className={`text-[9px] font-black px-2 py-0.5 rounded-[2px] tracking-widest uppercase border flex items-center gap-2 cursor-pointer transition-colors ${corkboardMode ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500 border-slate-200/50 dark:border-zinc-700/30 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
                                                                                                                                                                                                                                                                                                                                                title="코르크 보드 모드"
                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                코르크보드
                                                                                                                                                                                                                                                                                                                                            </div>                                                                                            </div>                                    <div className="flex items-center gap-1">
                                        {/* 문서 필터 버튼 (회색/검은 배경 스타일) */}
                                        <div className="w-0 group-hover:w-[95px] overflow-hidden transition-all duration-500 ease-in-out">
                                            <div className="flex items-center gap-0.5 bg-slate-200 dark:bg-zinc-900 p-0.5 rounded-sm min-w-[95px] opacity-0 translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                {['초고', '수정', '완료'].map(filter => (
                                                    <button
                                                        key={filter}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDocFilter(prev => prev === filter ? null : filter);
                                                        }}
                                                        className={`shrink-0 px-1.5 py-0.5 text-[9px] font-black rounded-sm transition-colors whitespace-nowrap ${docFilter === filter
                                                            ? (filter === '완료' ? 'bg-emerald-600 text-white shadow-sm' :
                                                                filter === '수정' ? 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                                    'bg-white text-slate-600 dark:bg-zinc-700 dark:text-zinc-300 shadow-sm')
                                                            : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        {filter}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={createNewDoc} className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0" title="새 문서 추가">
                                            <IconPlus className="w-4 h-4" />
                                        </button>
                                    </div>                                </div>
                                <Reorder.Group axis="y" values={projects.filter(p => p.type === 'doc')} onReorder={handleReorderDocs} className="space-y-0 border-t border-slate-200/50 dark:border-zinc-700/50">
                                    {projects.filter(p => p.type === 'doc').filter(p => docFilter === null || (p.status || '초고') === docFilter).map(project => {
                                        const isActive = !isTrashOpen && activeProjectId === project.id;
                                        return (
                                            <Reorder.Item
                                                key={project.id}
                                                value={project}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                layoutId={`doc-${project.id}`}
                                                dragElastic={0.5}
                                                transition={{ type: "tween", duration: 0.15 }}
                                                whileDrag={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 100 }}
                                                onClick={(e) => handleSelectProject(project.id, e)}
                                                onDoubleClick={(e) => { e.stopPropagation(); setEditingProjectId(project.id); }}
                                                className={`border-b border-slate-200/50 dark:border-zinc-700/50 last:border-0 cursor-grab active:cursor-grabbing ${isActive ? 'bg-white dark:bg-zinc-700' : (compareMode && compareDocIds.includes(project.id)) ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-300 dark:ring-indigo-700' : 'hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'}`}
                                            >
                                                <div className="flex items-center px-4 h-[30px] py-0 group relative overflow-hidden">
                                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 dark:bg-indigo-500" />}
                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 z-10">
                                                        <span className="text-sm opacity-50 shrink-0 dark:text-zinc-300">📄</span>
                                                        {editingProjectId === project.id ? (
                                                            <input
                                                                autoFocus
                                                                className="w-full bg-white border border-indigo-400 rounded-[3px] px-1 text-[12px] font-bold outline-none dark:bg-zinc-700 dark:text-white"
                                                                defaultValue={project.name}
                                                                onBlur={(e) => handleProjectRename(project.id, e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleProjectRename(project.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center min-w-0 flex-1 justify-between">
                                                                <span className={`text-[12px] truncate flex-1 mr-2 ${isActive ? 'text-slate-900 font-black dark:text-white' : 'text-slate-500 font-semibold dark:text-zinc-400'}`}>{project.name}</span>
                                                                {showDocWordCount && <span className="text-[10px] text-slate-400/90 dark:text-zinc-500/90 font-medium shrink-0 mr-1.5">{(project.content || '').length.toLocaleString()}자</span>}
                                                                <div className="flex items-center shrink-0">
                                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[3px] ${getStatusBadgeStyle(project.status || '초고')}`}>{project.status || '초고'}</span>
                                                                    <button onClick={(e) => deleteProject(project.id, e)} className="w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 group-hover:ml-1.5 overflow-hidden flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-300 scale-90 dark:text-zinc-500 dark:hover:text-red-400"><IconTrash className="w-3 h-3" /></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            </div>
                                                </div>
                                                                        {/* 휴지통 버튼 - 하단 고정 */}
                                                                        <div className="shrink-0 border-t border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#161618]">
                                                                            <button
                                                                                onClick={() => { setIsTrashOpen(true); setCorkboardMode(false); setActiveProjectId(null); }}
                                                                                className={`w-full px-5 py-2 flex items-center justify-between transition-colors ${isTrashOpen ? 'bg-slate-100 dark:bg-zinc-700' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                                                            >
                                                                                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                                                                                    <IconTrash className="w-4 h-4" />
                                                                                    <span className="text-[11px] font-bold">휴지통</span>
                                                                                    {trash.length > 0 && (
                                                                                        <span className="text-[9px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">{trash.length}</span>
                                                                                    )}
                                                                                </div>
                                                                                <svg className="w-3 h-3 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                            </aside>
                        
                                            <main
                                                className={`flex-1 relative overflow-hidden transition-all duration-500 ease-in-out ${activeProject?.type === 'board' ? (isPanning || isMarqueeSelectingRef.current ? 'cursor-grabbing' : draggingNodeId ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                                                ref={containerRef}
                                                onMouseDown={(e) => {
                                                    if (activeProject?.type === 'board' && !corkboardMode) {
                                                        if (rAF.current) { cancelAnimationFrame(rAF.current); rAF.current = null; }
                                                        lastMousePos.current = { x: e.clientX, y: e.clientY };
                                                        latestMousePos.current = { x: e.clientX, y: e.clientY };
                        
                                                        if (e.shiftKey && e.button === 0) {
                                                            isMarqueeSelectingRef.current = true;
                                                            const startCoords = getCanvasCoords(e.clientX, e.clientY);
                                                            setMarquee({ x: startCoords.x, y: startCoords.y, width: 0, height: 0, startX: startCoords.x, startY: startCoords.y });
                                                        } else if (e.button === 0) {
                                                            setIsPanning(true);
                                                            if (!e.shiftKey) {
                                                                setSelectedNodeIds(new Set());
                                                                setSelectedNodeId(null);
                                                            }
                                                        }
                                                    }
                                                }}
                                            >
                                                {/* 상단 공통 도구 (타이머, 집중모드) */}
                                                <div className="fixed top-6 right-10 z-[110] flex flex-col items-end gap-2 pointer-events-none">
                                                    <div className="flex items-center gap-2 pointer-events-auto">
                                                        <button
                                                            onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
                                                            className={`flex items-center justify-center w-8 h-8 rounded-full shadow-xl border transition-all ${isPomodoroOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-200 hover:border-indigo-300 dark:bg-zinc-800 dark:border-zinc-700'}`}
                                                            title="뽀모도로 타이머"
                                                        >
                                                            {!isPomodoroOpen && isPomoActive ? (
                                                                <div className="relative w-6 h-6">
                                                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                                        {/* Background */}
                                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-zinc-700" />
                        
                                                                        {/* Red Wedge */}
                                                                        <circle
                                                                            cx="50" cy="50" r="22.5"
                                                                            fill="none"
                                                                            stroke="#ef4444"
                                                                            strokeWidth="45"
                                                                            strokeDasharray={2 * Math.PI * 22.5}
                                                                            style={{
                                                                                strokeDashoffset: (2 * Math.PI * 22.5) * (pomoRemaining / pomoInitialTotal),
                                                                                transition: isPomoActive ? 'stroke-dashoffset 1s linear' : 'none',
                                                                            }}
                                                                            className="opacity-90"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isPomodoroOpen ? 'text-white' : 'text-slate-400'}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            )}
                                                        </button>
                                                        <div className={`flex items-center rounded-full shadow-xl border transition-all ${isZenMode ? 'bg-indigo-600 border-indigo-500 shadow-indigo-500/20' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 dark:bg-zinc-800 dark:border-zinc-700'}`}>
                                                            <button
                                                                onClick={() => {
                                                                    const nextZen = !isZenMode;
                                                                    setIsZenMode(nextZen);
                                                                    // 모바일/태블릿에서는 집중 모드 해제 시 사이드바를 열고, 설정 시 사이드바를 닫음
                                                                    if (window.innerWidth <= 1024) {
                                                                        setIsSidebarOpen(!nextZen);
                                                                    }
                                                                }}
                                                                className={`flex items-center justify-center gap-2 h-8 w-8 rounded-full text-[12px] font-black tracking-widest transition-all ${isZenMode ? 'text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                                                                title={compareMode ? "현재 활성 패널 집중 모드" : "집중 모드 (Ctrl+J)"}
                                                            >
                                                                <IconZen className={`w-4 h-4 ${isZenMode ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {isPomodoroOpen && (
                                                            <PomodoroTimer
                                                                minutes={pomoMinutes} setMinutes={setPomoMinutes}
                                                                seconds={pomoSeconds} setSeconds={setPomoSeconds}
                                                                isActive={isPomoActive} setIsActive={setIsPomoActive}
                                                                initialTotal={pomoInitialTotal} setInitialTotal={setPomoInitialTotal}
                                                                remaining={pomoRemaining} setRemaining={setPomoRemaining}
                                                                isSetting={isPomoSetting} setIsSetting={setIsPomoSetting}
                                                                showToast={showToast}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                        
                                                                                                {corkboardMode ? (
                                                                                                    /* 코르크보드 모드 뷰 */
                                                                                                    <div className="w-full h-full overflow-y-auto custom-scroll p-10 dot-background">
                                                                                                        <div className="max-w-7xl mx-auto py-12">
                                                                                                            {/* 헤더 */}
                                                                                                            <div className="flex items-center justify-between mb-8">
                                                                                                                <div className="flex items-center gap-4">
                                                                                                                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                                                                                                        <span className="text-2xl">📌</span>
                                                                                                                    </div>
                                                                                                                    <div>
                                                                                                                        <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100">코르크 보드</h2>
                                                                                                                        <span className="text-sm text-slate-400 dark:text-zinc-500">{projects.filter(p => p.type === 'doc').length}개 문서</span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                
                                                                                                                <div className="hidden xl:flex items-center gap-3">
                                                                                                                    {/* 숫자 이동 입력 */}
                                                                                                                    <div className="flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 h-9 shadow-sm gap-1.5" title="카드 번호로 이동 (Enter)">
                                                                                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Go</span>
                                                                                                                        <input 
                                                                                                                            type="number" 
                                                                                                                            placeholder="#" 
                                                                                                                            className="bg-slate-50 dark:bg-zinc-900 border-none outline-none text-xs font-black text-indigo-600 dark:text-indigo-400 w-8 text-center h-6 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                                                                            onKeyDown={(e) => {
                                                                                                                                if (e.key === 'Enter') {
                                                                                                                                    const num = parseInt(e.target.value);
                                                                                                                                    const cards = document.querySelectorAll('.corkboard-card');
                                                                                                                                    if (num > 0 && num <= cards.length) {
                                                                                                                                        cards[num-1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                                                                                        cards[num-1].classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
                                                                                                                                        setTimeout(() => cards[num-1].classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2'), 2000);
                                                                                                                                    } else {
                                                                                                                                        showToast("유효하지 않은 번호입니다", "error");
                                                                                                                                    }
                                                                                                                                    e.target.value = '';
                                                                                                                                }
                                                                                                                            }}
                                                                                                                        />
                                                                                                                    </div>

                                                                                                                    {/* 검색 및 필터 영역 */}
                                                                                                                    <div className="flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 h-9 shadow-sm gap-2">
                                                                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                                                                                                        <input 
                                                                                                                            type="text" 
                                                                                                                            placeholder="문서 제목 검색..." 
                                                                                                                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-zinc-200 w-40"
                                                                                                                            value={corkboardSearch}
                                                                                                                            onChange={(e) => setCorkboardSearch(e.target.value)}
                                                                                                                        />
                                                                                                                    </div>

                                                                                                                    <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 h-9">
                                                                                                                        {['초고', '수정', '완료'].map(status => {
                                                                                                                            const isActive = corkboardStatusFilter === status;
                                                                                                                            let activeClass = '';
                                                                                                                            
                                                                                                                            if (isActive) {
                                                                                                                                if (status === '수정') activeClass = 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shadow-sm';
                                                                                                                                else if (status === '완료') activeClass = 'bg-emerald-600 text-white shadow-sm';
                                                                                                                                else activeClass = 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm';
                                                                                                                            }

                                                                                                                            return (
                                                                                                                                <button
                                                                                                                                    key={status}
                                                                                                                                    onClick={() => setCorkboardStatusFilter(prev => prev === status ? null : status)}
                                                                                                                                    className={`px-3 flex items-center justify-center text-[10px] font-black rounded-md transition-all ${isActive 
                                                                                                                                        ? activeClass 
                                                                                                                                        : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500'}`}
                                                                                                                                >
                                                                                                                                    {status}
                                                                                                                                </button>
                                                                                                                            );
                                                                                                                        })}
                                                                                                                    </div>

                                                                                                                    <button
                                                                                                                        onClick={createNewDoc}
                                                                                                                        className="px-5 h-9 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 shadow-sm"
                                                                                                                    >
                                                                                                                        <IconPlus className="w-4 h-4" />
                                                                                                                        새 문서
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                                                                                                {projects
                                                                                                                    .filter(p => p.type === 'doc')
                                                                                                                    .filter(p => !corkboardStatusFilter || (p.status || '초고') === corkboardStatusFilter)
                                                                                                                    .filter(p => p.name.toLowerCase().includes(corkboardSearch.toLowerCase()))
                                                                                                                    .map((doc, idx) => (
                                                                                                                    <motion.div
                                                                                                                        key={doc.id}
                                                                                                                        initial={{ opacity: 0 }}
                                                                                                                        animate={{ opacity: 1 }}
                                                                                                                        transition={{ duration: 0.1 }}
                                                                                                                        className="corkboard-card bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 p-2 flex flex-col h-[300px] hover:shadow-xl group/card relative transition-shadow"
                                                                                                                    >
                                                                                                                        {/* 인덱스 표시 */}
                                                                                                                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white dark:border-zinc-700 group-hover/card:bg-indigo-600 transition-colors">
                                                                                                                            {idx + 1}
                                                                                                                        </div>
                                                                                                                        
                                                                                                                        <div className="flex items-center justify-between mb-2 border-b border-slate-100 dark:border-zinc-700 pb-2 pl-4">
                                                                                                                            <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                                                                                                                <span className="text-lg shrink-0">📄</span>
                                                                                                                                {corkboardEditingId === doc.id ? (
                                                                                                                                    <input
                                                                                                                                        autoFocus
                                                                                                                                        type="text"
                                                                                                                                        className="w-full bg-slate-50 border border-indigo-400 rounded-[3px] px-1 text-sm font-black outline-none dark:bg-zinc-700 dark:text-white"
                                                                                                                                        defaultValue={doc.name}
                                                                                                                                        onBlur={(e) => { setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, name: e.target.value } : p)); setCorkboardEditingId(null); }}
                                                                                                                                        onKeyDown={(e) => { if (e.key === 'Enter') { setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, name: e.target.value } : p)); setCorkboardEditingId(null); } }}
                                                                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                                                                    />
                                                                                                                                ) : (
                                                                                                                                    <span
                                                                                                                                        onDoubleClick={() => setCorkboardEditingId(doc.id)}
                                                                                                                                        className="font-black text-slate-800 dark:text-zinc-100 truncate text-sm cursor-pointer hover:text-slate-500 dark:hover:text-zinc-400 transition-colors"
                                                                                                                                        title="더블클릭하여 제목 수정"
                                                                                                                                    >
                                                                                                                                        {doc.name}
                                                                                                                                    </span>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-[2px] shrink-0 ${getStatusBadgeStyle(doc.status)}`}>{doc.status || '초고'}</span>
                                                                                                                        </div>
                                                                                                                        <div className="flex-1 overflow-hidden mb-2 relative -mr-2">
                                                                                                                            <textarea
                                                                                                                                className="w-full h-full resize-none outline-none text-sm text-slate-600 dark:text-zinc-300 leading-relaxed bg-transparent border-none pr-2 placeholder:italic custom-scroll"
                                                                                                                                placeholder="시놉시스를 입력하세요..."
                                                                                                                                value={doc.synopsis || ''}
                                                                                                                                onChange={(e) => setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, synopsis: e.target.value } : p))}
                                                                                                                                onMouseDown={(e) => e.stopPropagation()} 
                                                                                                                                onWheel={(e) => {
                                                                                                                                    const el = e.currentTarget;
                                                                                                                                    if (el.scrollHeight > el.clientHeight) {
                                                                                                                                        e.stopPropagation();
                                                                                                                                    }
                                                                                                                                }}
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-700 flex justify-between items-center text-[10px] text-slate-400 dark:text-zinc-500">
                                                                                                                            <span>{(doc.content || "").length.toLocaleString()}자</span>
                                                                                                                            <button 
                                                                                                                                onClick={(e) => {
                                                                                                                                    e.stopPropagation();
                                                                                                                                    setCorkboardMode(false);
                                                                                                                                    handleSelectProject(doc.id);
                                                                                                                                }}
                                                                                                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors"
                                                                                                                            >
                                                                                                                                바로가기 →
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    </motion.div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : isTrashOpen ? (
                                                                                                    /* 휴지통 메인 뷰 */
                                                                                                    <div className="w-full h-full overflow-y-auto custom-scroll p-10 bg-slate-100 dark:bg-zinc-950">
                                                                                                        <div className="max-w-7xl mx-auto py-12">
                                                                                                            {/* 헤더 */}
                                                                                                            <div className="flex items-center justify-between mb-8">
                                                                                                                <div className="flex items-center gap-4">
                                                                                                                    <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                                                                                                        <IconTrash className="w-7 h-7 text-red-500" />
                                                                                                                    </div>
                                                                                                                    <div>
                                                                                                                        <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100">휴지통</h2>
                                                                                                                        <span className="text-sm text-slate-400 dark:text-zinc-500">{trash.length}개 항목</span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                {trash.length > 0 && (
                                                                                                                    <button
                                                                                                                        onClick={emptyTrash}
                                                                                                                        className="px-5 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                                                                                                                    >
                                                                                                                        휴지통 비우기
                                                                                                                    </button>
                                                                                                                )}
                                                                                                            </div>

                                                                                                            {/* 컨텐츠 - 카드 형식 */}
                                                                                                            {trash.length === 0 ? (
                                                                                                                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                                                                                                                    <IconTrash className="w-20 h-20 mb-6 opacity-20" />
                                                                                                                    <p className="text-xl font-bold mb-2">휴지통이 비어있습니다</p>
                                                                                                                    <p className="text-sm">삭제된 보드와 문서가 여기에 표시됩니다</p>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                                                    {trash.map(item => (
                                                                                                                        <motion.div
                                                                                                                            key={item.id}
                                                                                                                            initial={{ opacity: 0 }}
                                                                                                                            animate={{ opacity: 1 }}
                                                                                                                            exit={{ opacity: 0 }}
                                                                                                                            transition={{ duration: 0.15 }}
                                                                                                                            className="group bg-white dark:bg-zinc-800 rounded-lg p-3 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-lg transition-all"
                                                                                                                        >
                                                                                                                            <div className="flex items-start justify-between mb-3">
                                                                                                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                                                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${item.type === 'board' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                                                                                                                        {item.type === 'board' ? '📋' : '📄'}
                                                                                                                                    </div>
                                                                                                                                    <div className="min-w-0 flex-1">
                                                                                                                                        <div className="flex justify-between items-start gap-2">
                                                                                                                                            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 truncate flex-1">{item.name}</h3>
                                                                                                                                            <span className="text-[12px] text-slate-400 dark:text-zinc-500 font-black shrink-0 mt-0.5 uppercase">
                                                                                                                                                {item.type === 'board' ? `${item.nodes?.length || 0} 노드` : `${(item.content || '').length.toLocaleString()} 자`}
                                                                                                                                            </span>
                                                                                                                                        </div>
                                                                                                                                        <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold block mt-0.5">
                                                                                                                                            {item.type === 'board' ? '보드' : '문서'}
                                                                                                                                            {item.deletedAt && ` · ${new Date(item.deletedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`}
                                                                                                                                        </span>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            {/* 액션 버튼 */}
                                                                                                                            <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-zinc-700/50">
                                                                                                                                <button
                                                                                                                                    onClick={() => restoreFromTrash(item.id)}
                                                                                                                                    className="flex-1 py-1.5 px-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-md transition-colors flex items-center justify-center gap-1.5"
                                                                                                                                >
                                                                                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                                                                                    </svg>
                                                                                                                                    복원
                                                                                                                                </button>
                                                                                                                                <button
                                                                                                                                    onClick={() => permanentDelete(item.id)}
                                                                                                                                    className="py-1.5 px-3 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-md transition-colors"
                                                                                                                                    title="완전 삭제"
                                                                                                                                >
                                                                                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                                                                    </svg>
                                                                                                                                </button>
                                                                                                                            </div>
                                                                                                                        </motion.div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>

                        ) : activeProject.type === 'board' ? (
                            <>
                                <div className="absolute top-6 left-6 z-[80] flex items-center gap-3" onMouseDown={(e) => e.stopPropagation()}>
                                    <div className="h-10 px-5 bg-white shadow-lg border border-slate-200 rounded-[3px] flex items-center gap-2 dark:bg-darkpanel dark:border-darkborder dark:text-white">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-[3px] animate-pulse"></span>
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest dark:text-zinc-200">{activeProject.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 p-1 bg-white rounded-[3px] shadow-lg border border-slate-200 h-10 dark:bg-darkpanel dark:border-darkborder">
                                        <button onClick={() => addNode('인물')} className="flex items-center gap-2 h-full px-3 rounded-[3px] hover:bg-blue-50 text-blue-600 transition-all active:scale-95 group dark:hover:bg-zinc-700 dark:text-blue-400" title="인물 추가">
                                            <span className="text-sm">👤</span>
                                            <span className="text-[10px] font-black hidden sm:inline">인물</span>
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-0.5 dark:bg-zinc-600"></div>
                                        <button onClick={() => addNode('사건')} className="flex items-center gap-2 h-full px-3 rounded-[3px] hover:bg-red-50 text-red-600 transition-all active:scale-95 group dark:hover:bg-zinc-700 dark:text-red-400" title="사건 추가">
                                            <span className="text-sm">🔥</span>
                                            <span className="text-[10px] font-black hidden sm:inline">사건</span>
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-0.5 dark:bg-zinc-600"></div>
                                        <button onClick={() => addNode('메모')} className="flex items-center gap-2 h-full px-3 rounded-[3px] hover:bg-amber-50 text-amber-600 transition-all active:scale-95 group dark:hover:bg-zinc-700 dark:text-amber-400" title="메모 추가">
                                            <span className="text-sm">💡</span>
                                            <span className="text-[10px] font-black hidden sm:inline">메모</span>
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-0.5 dark:bg-zinc-600"></div>
                                        <button onClick={() => addNode('할일')} className="flex items-center gap-2 h-full px-3 rounded-[3px] hover:bg-cyan-50 text-cyan-600 transition-all active:scale-95 group dark:hover:bg-zinc-700 dark:text-cyan-400" title="할일 추가">
                                            <span className="text-sm">✅</span>
                                            <span className="text-[10px] font-black hidden sm:inline">할일</span>
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-0.5 dark:bg-zinc-600"></div>
                                        <div className="relative" ref={nodeDropdownRef}>
                                            <button onClick={() => setShowNodeDropdown(!showNodeDropdown)} className="flex items-center gap-1 h-full px-3 rounded-[3px] hover:bg-slate-100 text-slate-600 transition-all active:scale-95 dark:hover:bg-zinc-700 dark:text-slate-400" title="더 많은 노드 추가">
                                                <span className="text-sm">➕</span>
                                                <span className="text-[10px] font-black hidden sm:inline">더보기</span>
                                                <svg className={`w-3 h-3 transition-transform ${showNodeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            {showNodeDropdown && (
                                                <div className="absolute top-full left-0 mt-1 bg-white rounded-[3px] shadow-xl border border-slate-200 py-1 min-w-[140px] z-[200] dark:bg-darkpanel dark:border-darkborder">
                                                    <button onClick={() => { addNode('장소'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-emerald-600 transition-all dark:hover:bg-zinc-700 dark:text-emerald-400">
                                                        <span className="text-sm">📍</span>
                                                        <span className="text-[11px] font-bold">장소</span>
                                                    </button>
                                                    <button onClick={() => { addNode('아이템'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-50 text-purple-600 transition-all dark:hover:bg-zinc-700 dark:text-purple-400">
                                                        <span className="text-sm">🎁</span>
                                                        <span className="text-[11px] font-bold">아이템</span>
                                                    </button>
                                                    <button onClick={() => { addNode('세력'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-orange-600 transition-all dark:hover:bg-zinc-700 dark:text-orange-400">
                                                        <span className="text-sm">⚔️</span>
                                                        <span className="text-[11px] font-bold">세력</span>
                                                    </button>
                                                    <button onClick={() => { addNode('복선'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-pink-50 text-pink-600 transition-all dark:hover:bg-zinc-700 dark:text-pink-400">
                                                        <span className="text-sm">🎣</span>
                                                        <span className="text-[11px] font-bold">복선</span>
                                                    </button>
                                                    <button onClick={() => { addNode('타임라인'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-teal-50 text-teal-600 transition-all dark:hover:bg-zinc-700 dark:text-teal-400">
                                                        <span className="text-sm">⏰</span>
                                                        <span className="text-[11px] font-bold">타임라인</span>
                                                    </button>
                                                    <button onClick={() => { addNode('설정'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 text-indigo-600 transition-all dark:hover:bg-zinc-700 dark:text-indigo-400">
                                                        <span className="text-sm">📚</span>
                                                        <span className="text-[11px] font-bold">설정</span>
                                                    </button>
                                                    <button onClick={() => { addNode('대사'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-sky-50 text-sky-600 transition-all dark:hover:bg-zinc-700 dark:text-sky-400">
                                                        <span className="text-sm">💬</span>
                                                        <span className="text-[11px] font-bold">대사</span>
                                                    </button>
                                                    <button onClick={() => { addNode('갈등'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 transition-all dark:hover:bg-zinc-700 dark:text-rose-400">
                                                        <span className="text-sm">⚡</span>
                                                        <span className="text-[11px] font-bold">갈등</span>
                                                    </button>
                                                    <button onClick={() => { addNode('그룹'); setShowNodeDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 text-slate-600 transition-all dark:hover:bg-zinc-700 dark:text-slate-400">
                                                        <span className="text-sm">📁</span>
                                                        <span className="text-[11px] font-bold">그룹</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="absolute bottom-8 right-8 z-[100] flex flex-col gap-2 font-bold dark:text-zinc-300">
                                    <button
                                        onClick={() => handleAutoLayout()}
                                        className="w-11 h-11 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-darkpanel dark:hover:bg-zinc-700 shadow-xl border border-slate-200 dark:border-zinc-700 rounded-[3px] transition-all"
                                        title="자동 정렬 (Auto Layout)"
                                    >
                                        <IconLayout className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                                    </button>
                                    <button
                                        onClick={() => fitToScreen()}
                                        className="w-11 h-11 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-darkpanel dark:hover:bg-zinc-700 shadow-xl border border-slate-200 dark:border-zinc-700 rounded-[3px] transition-all"
                                        title="화면 중앙 맞춤"
                                    >
                                        {/* 아이콘 SVG 생략 */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="scale-75 text-slate-500 dark:text-zinc-400">
                                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="zoom-container w-full h-full" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
                                    <svg className="canvas-svg">
                                        <defs><marker id="arrow-event" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" /></marker></defs>
                                        {visibleEdges.map(edge => {
                                            const from = findNode(edge.from); const to = findNode(edge.to); if (!from || !to) return null;
                                            let x1 = from.x + CARD_W / 2, y1 = from.y + CARD_H / 2, x2 = to.x + CARD_W / 2, y2 = to.y + CARD_H / 2;
                                            const coreTypes = ['인물', '사건', '메모'];
                                            const isCoreType = (type) => coreTypes.includes(type);
                                            const isEventToEvent = from.type === '사건' && to.type === '사건';
                                            const isIdeaInvolved = from.type === '메모' || to.type === '메모';
                                            const isPersonToEvent = (from.type === '인물' && to.type === '사건') || (from.type === '사건' && to.type === '인물');
                                            const isPersonToPerson = from.type === '인물' && to.type === '인물';
                                            const isSameType = from.type === to.type;

                                            // 노드 타입별 고유 색상 (hex)
                                            const typeColors = {
                                                '장소': '#10b981', '아이템': '#a855f7', '세력': '#f97316',
                                                '복선': '#ec4899', '타임라인': '#14b8a6', '설정': '#6366f1',
                                                '대사': '#0ea5e9', '갈등': '#f43f5e', '그룹': '#64748b'
                                            };

                                            // 엣지 색상 결정 로직
                                            let edgeColor;
                                            if (isCoreType(from.type) && isCoreType(to.type)) {
                                                // 기존 인물/사건/메모 연결 로직 유지
                                                edgeColor = isIdeaInvolved ? "#facc15" : isPersonToEvent ? "#3b82f6" : isPersonToPerson ? "#93c5fd" : "#ef4444";
                                            } else if (!isCoreType(from.type) && !isCoreType(to.type)) {
                                                // 둘 다 새 타입일 경우
                                                if (isSameType) {
                                                    edgeColor = typeColors[from.type] || "#64748b";
                                                } else {
                                                    edgeColor = "#94a3b8"; // 회색
                                                }
                                            } else {
                                                // 기존 타입과 새 타입 간 연결
                                                edgeColor = "#94a3b8"; // 회색
                                            }

                                            let pathData = isEventToEvent ? `M ${x1} ${y1} L ${getEdgeTargetPos(from, to, 12).x} ${getEdgeTargetPos(from, to, 12).y}` : getBezierPath(x1, y1, x2, y2);
                                            const strokeWidth = edge.width || (isPersonToEvent ? 12 : isEventToEvent ? 4 : isSameType && !isCoreType(from.type) ? 3 : 2);
                                            const strokeDash = edge.style ? getStrokeDashArray(edge.style, strokeWidth) : "";
                                            const labelWidth = Math.max(70, (edge.label || "").length * 10 + 20);
                                            const showLabel = true;
                                            return (
                                                <g key={edge.id}>
                                                    <path d={pathData} className="edge-hitbox" onDoubleClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); }} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); saveHistory(); updateActiveProject(null, prev => prev.filter(ev => ev.id !== edge.id)); }} />
                                                    {edge.style === 'double' ? (
                                                        <>
                                                            <path d={pathData} stroke={edgeColor} strokeWidth={strokeWidth * 3} markerEnd={isEventToEvent ? "url(#arrow-event)" : ""} className="edge-path opacity-80" />
                                                            <path d={pathData} stroke={isDarkMode ? '#09080B' : '#f8fafc'} strokeWidth={strokeWidth} className="edge-path" />
                                                        </>
                                                    ) : (
                                                        <path d={pathData} stroke={edgeColor} strokeWidth={strokeWidth} markerEnd={isEventToEvent ? "url(#arrow-event)" : ""} strokeDasharray={strokeDash} className={`edge-path opacity-80${edge.style === 'dashed' ? ' edge-path-animated' : ''}`} style={edge.style === 'dashed' ? { '--dash-offset': -(strokeWidth >= 6 ? strokeWidth * 5 : strokeWidth * 7), '--dash-duration': '0.5s' } : undefined} />
                                                    )}
                                                    {showLabel && edge.label && (
                                                        <g className="cursor-pointer pointer-events-auto" onDoubleClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); }}>
                                                            <rect x={(x1 + x2) / 2 - labelWidth / 2} y={(y1 + y2) / 2 - 16} width={labelWidth} height="32" rx="4" fill="white" stroke={edgeColor} strokeWidth="1.5" className="dark:fill-zinc-800" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill="#334155" className="dark:fill-zinc-200">{edge.label}</text>
                                                        </g>
                                                    )}
                                                </g>
                                            );
                                        })}
                                        {tempEdge && findNode(tempEdge.fromId) && <line x1={findNode(tempEdge.fromId).x + CARD_W / 2} y1={findNode(tempEdge.fromId).y + CARD_H / 2} x2={tempEdge.toX} y2={tempEdge.toY} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />}
                                    </svg>
                                    {marquee && (
                                        <div
                                            className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 dark:bg-blue-400/10 dark:border-blue-400 pointer-events-none"
                                            style={{
                                                left: marquee.x,
                                                top: marquee.y,
                                                width: marquee.width,
                                                height: marquee.height,
                                                zIndex: 999
                                            }}
                                        />
                                    )}

                                    {/* 그룹 노드 먼저 렌더링 (뒤에 배치) */}
                                    {visibleGroupNodes.map(node => (
                                        <GroupNode key={node.id} node={node} isSelected={selectedNodeIds.has(node.id) || selectedNodeId === node.id} isDragging={draggingNodeId && (selectedNodeIds.has(node.id) || draggingNodeId === node.id || dragOffset.nodeIds.has(node.id))} onMouseDown={(e, id) => { e.stopPropagation(); if (rAF.current) { cancelAnimationFrame(rAF.current); rAF.current = null; } lastMousePos.current = { x: e.clientX, y: e.clientY }; latestMousePos.current = { x: e.clientX, y: e.clientY }; if (e.button === 0) { if (e.shiftKey) { setSelectedNodeIds(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); selectedNodeIdsRef.current = newSet; return newSet; }); return; } if (!selectedNodeIds.has(id)) { const newSet = new Set([id]); setSelectedNodeIds(newSet); selectedNodeIdsRef.current = newSet; } setDraggingNodeId(id); } }} onDoubleClick={(id) => { setSelectedNodeIds(new Set()); setSelectedNodeId(id); }} onDelete={deleteNode} onResize={resizeGroupNode} />
                                    ))}
                                    {/* 일반 노드 나중에 렌더링 (앞에 배치) */}
                                    {visibleRegularNodes.map(node => (
                                        <NodeCard
                                            key={node.id}
                                            node={node}
                                            isTop={topNodeId === node.id}
                                            isSelected={selectedNodeIds.has(node.id) || selectedNodeId === node.id}
                                            isDragging={draggingNodeId && (selectedNodeIds.has(node.id) || draggingNodeId === node.id || dragOffset.nodeIds.has(node.id))}
                                            onClick={(e, id) => { if (!e.shiftKey) setSelectedNodeIds(new Set([id])); }}
                                            onUpdateNode={(id, data) => updateActiveProject(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))}
                                            onMouseDown={(e, id) => {
                                                e.stopPropagation();
                                                if (rAF.current) { cancelAnimationFrame(rAF.current); rAF.current = null; }
                                                lastMousePos.current = { x: e.clientX, y: e.clientY };
                                                latestMousePos.current = { x: e.clientX, y: e.clientY };
                                                if (e.button === 0) {
                                                    if (e.shiftKey) {
                                                        setSelectedNodeIds(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); selectedNodeIdsRef.current = newSet; return newSet; });
                                                        return;
                                                    }
                                                    if (!selectedNodeIds.has(id)) { const newSet = new Set([id]); setSelectedNodeIds(newSet); selectedNodeIdsRef.current = newSet; }
                                                    setDraggingNodeId(id);
                                                    setTopNodeId(id);
                                                } else if (e.button === 2) {
                                                    const node = findNode(id);
                                                    if (node) { setTempEdge({ fromId: id, toX: node.x + CARD_W / 2, toY: node.y + CARD_H / 2 }); }
                                                }
                                            }}
                                            onMouseUp={(e, id) => {
                                                if (tempEdge && id !== tempEdge.fromId) {
                                                    const edgeExists = edges.some(e => (e.from === tempEdge.fromId && e.to === id) || (e.from === id && e.to === tempEdge.fromId));
                                                    if (!edgeExists) {
                                                        saveHistory();
                                                        hasConnectedRef.current = true;
                                                        updateActiveProject(null, prev => [...prev, { id: generateUUID(), from: tempEdge.fromId, to: id, label: '' }]);
                                                    }
                                                }
                                            }}
                                            onDoubleClick={(id) => { setSelectedNodeIds(new Set()); setSelectedNodeId(id); }}
                                            onDelete={deleteNode}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : compareMode && compareDocIds[0] && compareDocIds[1] ? (
                            /* 문서 비교 모드 UI - 원본 editor-paper 디자인 유지 */
                            <div className="compare-container w-full h-full flex relative">
                                {/* 왼쪽 패널 */}
                                <div
                                    className={`h-full overflow-y-auto custom-scroll ${isSplitterDragging ? '' : 'transition-all duration-500 ease-in-out'} ${isZenMode ? (activeComparePane === 0 ? 'px-0' : 'w-0 overflow-hidden opacity-0') : 'px-6'}`}
                                    style={{ width: isZenMode ? (activeComparePane === 0 ? '100%' : '0%') : `${splitRatio}%` }}
                                    onClick={() => setActiveComparePane(0)}
                                >
                                    {(() => {
                                        const doc = getCompareDoc(0);
                                        if (!doc) return null;
                                        return (
                                            <motion.div className={`editor-paper relative ${editorWidth === 'wide' ? 'editor-wide' : editorWidth === 'narrow' ? 'editor-narrow' : ''}`}>
                                                <div className="editor-title-container">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isZenMode && activeComparePane === 0 ? 'Focus Mode' : 'DOC TITLE'}</span>
                                                        {renderStatusSelector(doc)}
                                                    </div>
                                                    <input
                                                        className="w-full text-2xl font-black text-slate-800 outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-2 transition-all dark:text-zinc-200 dark:border-zinc-700 dark:focus:border-indigo-500 dark:bg-transparent"
                                                        value={doc.name}
                                                        onChange={(e) => setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, name: e.target.value } : p))}
                                                        placeholder="문서 제목"
                                                    />
                                                </div>
                                                <textarea
                                                    ref={el => compareTextareaRefs.current[0] = el}
                                                    className={`editor-textarea custom-scroll ${isZenMode && activeComparePane === 0 ? 'zen-active' : ''}`}
                                                    style={{ fontSize: `${editorFontSize}px` }}
                                                    value={doc.content || ""}
                                                    onChange={(e) => { updateCompareDocContent(doc.id, e.target.value); updateFocusScroll(); }}
                                                    onFocus={() => setActiveComparePane(0)}
                                                    onClick={() => updateFocusScroll()}
                                                    onKeyUp={() => updateFocusScroll()}
                                                    placeholder="이곳에 내용을 작성하세요... (@인물 / #사건 / $메모 입력)"
                                                />
                                                <div className={`px-[40px] pb-10 transition-all duration-500 ${isZenMode ? 'opacity-10 hover:opacity-100' : ''}`}>
                                                    <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-3 dark:border-zinc-700">
                                                        <div className="flex justify-between items-end text-[10px] font-black tracking-tighter">
                                                            <div className="flex gap-4 items-center">
                                                                <div className="flex flex-col gap-1"><span className="text-slate-400 uppercase">Statistics</span><div className="flex gap-3 text-slate-600 dark:text-zinc-400"><span>공백 포함: <b className="text-slate-900 dark:text-zinc-200">{(doc.content || "").length.toLocaleString()}</b>자</span><span>공백 제외: <b className="text-slate-900 dark:text-zinc-200">{(doc.content || "").replace(/\s+/g, '').length.toLocaleString()}</b>자</span></div></div>
                                                                <div className="w-px h-6 bg-slate-100 mx-2 dark:bg-zinc-700"></div>
                                                                <div className="flex flex-col gap-1"><span className="text-indigo-400 uppercase">Achievement</span><span className="text-[14px] text-indigo-600 italic dark:text-indigo-400">{Math.min(Math.round(((doc.content || "").length / defaultTargetCount) * 100), 100)}%</span></div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-slate-400 uppercase">Target Goal</span>
                                                                <div className="text-slate-600 dark:text-zinc-400 text-[14px] font-black">
                                                                    <span><b className="text-slate-900 dark:text-zinc-200">{defaultTargetCount.toLocaleString()}</b>자</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-[3px] overflow-hidden dark:bg-zinc-700">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(((doc.content || "").length / defaultTargetCount) * 100, 100)}%` }}
                                                                style={{ backgroundColor: (doc.content || "").length >= defaultTargetCount ? "#10b981" : "#4f46e5" }}
                                                                className="h-full transition-all duration-500 ease-out rounded-[3px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })()}
                                </div>

                                {/* 분할선 (집중 모드가 아닐 때만 표시) */}
                                {!isZenMode && (
                                    <div
                                        className="w-1 h-full cursor-col-resize bg-slate-300 dark:bg-zinc-600 hover:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors flex items-center justify-center group shrink-0 rounded-none"
                                        onMouseDown={handleSplitterMouseDown}
                                    >
                                        <div className="w-1 h-12 bg-slate-400 dark:bg-zinc-500 group-hover:bg-white rounded-full transition-colors"></div>
                                    </div>
                                )}

                                {/* 오른쪽 패널 */}
                                <div
                                    className={`h-full overflow-y-auto custom-scroll ${isSplitterDragging ? '' : 'transition-all duration-500 ease-in-out'} ${isZenMode ? (activeComparePane === 1 ? 'px-0' : 'w-0 overflow-hidden opacity-0') : 'px-6'}`}
                                    style={{ width: isZenMode ? (activeComparePane === 1 ? '100%' : '0%') : `${100 - splitRatio}%` }}
                                    onClick={() => setActiveComparePane(1)}
                                >
                                    {(() => {
                                        const doc = getCompareDoc(1);
                                        if (!doc) return null;
                                        return (
                                            <motion.div className={`editor-paper relative ${editorWidth === 'wide' ? 'editor-wide' : editorWidth === 'narrow' ? 'editor-narrow' : ''}`}>
                                                <div className="editor-title-container">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isZenMode && activeComparePane === 1 ? 'Focus Mode' : 'DOC TITLE'}</span>
                                                        {renderStatusSelector(doc)}
                                                    </div>
                                                    <input
                                                        className="w-full text-2xl font-black text-slate-800 outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-2 transition-all dark:text-zinc-200 dark:border-zinc-700 dark:focus:border-indigo-500 dark:bg-transparent"
                                                        value={doc.name}
                                                        onChange={(e) => setProjects(prev => prev.map(p => p.id === doc.id ? { ...p, name: e.target.value } : p))}
                                                        placeholder="문서 제목"
                                                    />
                                                </div>
                                                <textarea
                                                    ref={el => compareTextareaRefs.current[1] = el}
                                                    className={`editor-textarea custom-scroll ${isZenMode && activeComparePane === 1 ? 'zen-active' : ''}`}
                                                    style={{ fontSize: `${editorFontSize}px` }}
                                                    value={doc.content || ""}
                                                    onChange={(e) => { updateCompareDocContent(doc.id, e.target.value); updateFocusScroll(); }}
                                                    onFocus={() => setActiveComparePane(1)}
                                                    onClick={() => updateFocusScroll()}
                                                    onKeyUp={() => updateFocusScroll()}
                                                    placeholder="이곳에 내용을 작성하세요... (@인물 / #사건 / $메모 입력)"
                                                />
                                                <div className={`px-[40px] pb-10 transition-all duration-500 ${isZenMode ? 'opacity-10 hover:opacity-100' : ''}`}>
                                                    <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-3 dark:border-zinc-700">
                                                        <div className="flex justify-between items-end text-[10px] font-black tracking-tighter">
                                                            <div className="flex gap-4 items-center">
                                                                <div className="flex flex-col gap-1"><span className="text-slate-400 uppercase">Statistics</span><div className="flex gap-3 text-slate-600 dark:text-zinc-400"><span>공백 포함: <b className="text-slate-900 dark:text-zinc-200">{(doc.content || "").length.toLocaleString()}</b>자</span><span>공백 제외: <b className="text-slate-900 dark:text-zinc-200">{(doc.content || "").replace(/\s+/g, '').length.toLocaleString()}</b>자</span></div></div>
                                                                <div className="w-px h-6 bg-slate-100 mx-2 dark:bg-zinc-700"></div>
                                                                <div className="flex flex-col gap-1"><span className="text-indigo-400 uppercase">Achievement</span><span className="text-[14px] text-indigo-600 italic dark:text-indigo-400">{Math.min(Math.round(((doc.content || "").length / defaultTargetCount) * 100), 100)}%</span></div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-slate-400 uppercase">Target Goal</span>
                                                                <div className="text-slate-600 dark:text-zinc-400 text-[14px] font-black">
                                                                    <span><b className="text-slate-900 dark:text-zinc-200">{defaultTargetCount.toLocaleString()}</b>자</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-[3px] overflow-hidden dark:bg-zinc-700">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(((doc.content || "").length / defaultTargetCount) * 100, 100)}%` }}
                                                                style={{ backgroundColor: (doc.content || "").length >= defaultTargetCount ? "#10b981" : "#4f46e5" }}
                                                                className="h-full transition-all duration-500 ease-out rounded-[3px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                        <div className={`w-full h-full overflow-y-auto custom-scroll transition-all duration-500 ease-in-out ${isZenMode ? 'px-0' : 'px-0 lg:px-10'}`}>
                            <motion.div className={`editor-paper relative ${editorWidth === 'wide' ? 'editor-wide' : editorWidth === 'narrow' ? 'editor-narrow' : ''}`} style={{ boxShadow: isZenMode ? '0 0 0 15px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.1)' : '' }}>
                                <div className="editor-title-container">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest"> {isZenMode ? 'Focus Mode' : 'DOC TITLE'} </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setShowSynopsisModal(true)}
                                                className={`p-1 transition-all ${isZenMode ? 'opacity-10 hover:opacity-100' : ''} text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400`}
                                                title="시놉시스"
                                            >
                                                <IconFileText className="w-4 h-4" />
                                            </button>
                                            {renderStatusSelector(activeProject)}
                                        </div>
                                    </div>
                                    <input className="w-full text-2xl font-black text-slate-800 outline-none border-b-2 border-slate-100 focus:border-indigo-400 pb-2 transition-all dark:text-zinc-200 dark:border-zinc-700 dark:focus:border-indigo-500 dark:bg-transparent" value={activeProject.name} onChange={(e) => handleProjectRename(activeProject.id, e.target.value)} placeholder="문서 제목" />
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    // [중요] zen-active 클래스 조건부 적용
                                    className={`editor-textarea custom-scroll ${isZenMode ? 'zen-active' : ''}`}
                                    style={{ fontSize: `${editorFontSize}px` }}
                                    value={activeProject.content || ""}
                                    onChange={(e) => {
                                        handleDocInput(e);
                                        updateFocusScroll();
                                    }}
                                    onKeyDown={(e) => {
                                        handleDocKeyDown(e);
                                        if (e.key === 'Enter' || e.key === 'Backspace') requestAnimationFrame(updateFocusScroll);
                                    }}
                                    onClick={() => updateFocusScroll()}
                                    onKeyUp={() => updateFocusScroll()}
                                    placeholder="이곳에 내용을 작성하세요... (@인물 / #사건 / $메모 입력)"
                                />
                                <div className={`px-5 lg:px-[40px] pb-10 transition-all duration-500 ${isZenMode ? 'opacity-10 hover:opacity-100' : ''}`}>
                                    <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-3 dark:border-zinc-700">
                                                        <div className="flex justify-between items-end text-[10px] font-black tracking-tighter">
                                            <div className="flex gap-4 items-center">
                                                <div className="flex flex-col gap-1"><span className="text-slate-400 uppercase">Statistics</span><div className="flex gap-3 text-slate-600 dark:text-zinc-400"><span>공백 포함: <b className="text-slate-900 dark:text-zinc-200">{(activeProject.content || "").length.toLocaleString()}</b>자</span><span>공백 제외: <b className="text-slate-900 dark:text-zinc-200">{(activeProject.content || "").replace(/\s+/g, '').length.toLocaleString()}</b>자</span></div></div>
                                                <div className="w-px h-6 bg-slate-100 mx-2 dark:bg-zinc-700"></div>
                                                <div className="flex flex-col gap-1"><span className="text-indigo-400 uppercase">Achievement</span><span className="text-[14px] text-indigo-600 italic dark:text-indigo-400">{Math.min(Math.round(((activeProject.content || "").length / defaultTargetCount) * 100), 100)}%</span></div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-slate-400 uppercase">Target Goal</span>
                                                <div className="text-slate-600 dark:text-zinc-400 text-[14px] font-black">
                                                    <span><b className="text-slate-900 dark:text-zinc-200">{defaultTargetCount.toLocaleString()}</b>자</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-[3px] overflow-hidden dark:bg-zinc-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(((activeProject.content || "").length / defaultTargetCount) * 100, 100)}%` }}
                                                style={{ backgroundColor: (activeProject.content || "").length >= defaultTargetCount ? "#10b981" : "#4f46e5" }}
                                                className="h-full transition-all duration-500 ease-out rounded-[3px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        )}
                        {/* Floating History Button for Single Doc View */}
                        {!isTrashOpen && activeProject.type === 'doc' && !compareMode && !isZenMode && !corkboardMode && enableHistory && (
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="mobile-hide absolute bottom-8 right-8 z-[100] h-7 px-2.5 bg-white dark:bg-zinc-800 shadow-xl border border-slate-200 dark:border-zinc-700 rounded-[3px] flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all text-[10px]"
                            >
                                <IconHistory className="w-3 h-3" />
                                <span>기록 {activeProject.history?.length > 0 ? `(${activeProject.history.length})` : ''}</span>
                            </button>
                        )}
                    </main>

                    {/* 히스토리 모달 */}
                    {showHistoryModal && activeProject && activeProject.type === 'doc' && (
                        <HistoryManager
                            doc={activeProject}
                            onClose={() => setShowHistoryModal(false)}
                            onRestore={restoreSnapshot}
                            onSnapshot={(memo) => createSnapshot(activeProject.id, memo)}
                            onDelete={deleteSnapshot}
                        />
                    )}

                    {/* 시놉시스 모달 */}
                    <AnimatePresence>
                        {showSynopsisModal && activeProject && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                                    onClick={() => setShowSynopsisModal(false)} 
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-darkpanel w-[600px] h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-slate-200 dark:border-zinc-700"
                                >
                                    <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
                                        <h2 className="text-sm font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                            📝 시놉시스
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setShowSynopsisModal(false); setCorkboardMode(true); }}
                                                className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded text-xs font-bold transition-colors"
                                            >
                                                코르크 보드로 가기
                                            </button>
                                            <button onClick={() => setShowSynopsisModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-0 flex flex-col">
                                        <textarea 
                                            className="flex-1 w-full p-8 resize-none outline-none text-slate-600 dark:text-zinc-300 leading-loose custom-scroll bg-transparent text-base"
                                            placeholder="시놉시스나 개요를 작성하세요..."
                                            value={activeProject.synopsis || ''}
                                            onChange={(e) => setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, synopsis: e.target.value } : p))}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {mention.active && (
                            <div className="mention-list" style={{ top: mention.y, left: mention.x }}>
                                <div className="w-[250px] flex flex-col border-r border-slate-100 dark:border-zinc-700">
                                    <div className="p-2 bg-slate-50 dark:bg-zinc-800 text-[9px] font-black text-slate-400 tracking-widest uppercase border-b border-slate-100 dark:border-zinc-700">
                                        {mention.type === '@' ? '캐릭터 리스트' : mention.type === '#' ? '사건 리스트' : mention.type === '$' ? '메모 리스트' : 'TO-DO 리스트'}
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scroll">
                                        {filteredMentionNodes.length > 0 ? filteredMentionNodes.map((node, i) => (
                                            <div key={node.id}
                                                onClick={() => insertMention(node)}
                                                onMouseEnter={() => setMention(prev => ({ ...prev, selectedIndex: i }))}
                                                className={`flex items-center px-3 h-[38px] cursor-pointer transition-colors border-l-4 ${mention.selectedIndex === i
                                                    ? 'mention-item-active'
                                                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800 border-l-transparent'
                                                    }`}
                                            >
                                                {/* 좌측: 이모지 및 이름 (높이 고정으로 인해 세로 중앙 자동 정렬) */}
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-sm shrink-0 leading-none">{node.data.emoji}</span>
                                                    <div className="flex items-baseline gap-2 truncate">
                                                        <span className="font-black text-xs text-slate-800 dark:text-zinc-100 shrink-0">
                                                            {node.label}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-bold truncate opacity-80">
                                                            / {node.projectName}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 우측: 인물일 경우 배지 표시, 사건일 경우 빈 공간 유지 (높이 뒤틀림 방지) */}
                                                <div className="shrink-0 ml-2 flex items-center h-full">
                                                    {node.type === '인물' ? (
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[2px] rounded-sm shadow-sm leading-none ${getRoleBadgeStyle(node.data.role)}`}>
                                                            {node.data.role}
                                                        </span>
                                                    ) : node.type === '할일' && (node.data.items || []).length > 0 && (node.data.items || []).every(i => i.done) ? (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-[2px] bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                                            완료
                                                        </span>
                                                    ) : (
                                                        /* 사건일 때는 배지가 없어도 높이를 유지하도록 빈 공간 확보 */
                                                        <div className="w-1 h-4"></div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-[10px] text-slate-400 italic text-center">결과 없음</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col bg-white dark:bg-[#1a1a1d] p-5 overflow-hidden rounded-r-[3px]">
                                    {filteredMentionNodes[mention.selectedIndex] ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{filteredMentionNodes[mention.selectedIndex].data.emoji}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-black text-slate-800 dark:text-zinc-100">{filteredMentionNodes[mention.selectedIndex].label}</div>
                                                </div>
                                            </div>
                                            <div className="text-2xs text-slate-500 dark:text-zinc-400 leading-relaxed overflow-y-auto custom-scroll pr-2">
                                                {filteredMentionNodes[mention.selectedIndex].type === '인물' && (
                                                    <div className="mb-2 pb-2 border-b border-slate-50 dark:border-zinc-800 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-bold uppercase text-indigo-500">
                                                        <span>성별: {filteredMentionNodes[mention.selectedIndex].data.gender}</span>
                                                        <span>나이: {filteredMentionNodes[mention.selectedIndex].data.age || '미정'}</span>
                                                        <span>직업: {filteredMentionNodes[mention.selectedIndex].data.job || '미정'}</span>
                                                        <span>종족: {filteredMentionNodes[mention.selectedIndex].data.race || '인간'}</span>
                                                    </div>
                                                )}

                                                {filteredMentionNodes[mention.selectedIndex].type === '사건' && (
                                                    <div className="mb-2 pb-2 border-b border-slate-50 dark:border-zinc-800 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-bold uppercase text-rose-500">
                                                        <span>장소: {filteredMentionNodes[mention.selectedIndex].data.place || '미정'}</span>
                                                        <span>시기: {filteredMentionNodes[mention.selectedIndex].data.year || '미정'}</span>
                                                    </div>
                                                )}

                                                {filteredMentionNodes[mention.selectedIndex].type === '메모' && (
                                                    <div className="mb-2 pb-2 border-b border-slate-50 dark:border-zinc-800 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-bold uppercase text-amber-500">
                                                        <span>📝 {filteredMentionNodes[mention.selectedIndex].data.category || '메모'}</span>
                                                    </div>
                                                )}

                                                {filteredMentionNodes[mention.selectedIndex].type === '할일' && (
                                                    <div className="mb-2 pb-2">
                                                        <div className="text-[12px] font-bold uppercase text-cyan-500 mb-2">✅ 할일 목록</div>
                                                        <div className="space-y-1">
                                                            {(filteredMentionNodes[mention.selectedIndex].data.items || []).map(item => (
                                                                <div key={item.id} className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={item.done}
                                                                        onChange={() => handleToggleTodoInMention(filteredMentionNodes[mention.selectedIndex].projectId, filteredMentionNodes[mention.selectedIndex].id, item.id)}
                                                                        className="w-3 h-3 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                                    />
                                                                    <span className={`text-xs ${item.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-zinc-300'}`}>
                                                                        {item.text}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {(filteredMentionNodes[mention.selectedIndex].data.items || []).length === 0 && (
                                                                <div className="text-xs text-slate-400 italic">등록된 할 일이 없습니다</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {filteredMentionNodes[mention.selectedIndex].data.memo || (filteredMentionNodes[mention.selectedIndex].type !== '할일' ? "작성된 메모가 없습니다." : "")}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-zinc-700 text-xs italic">정보가 없습니다.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {activeNode && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/20 z-[199]"
                                    onClick={() => { setSelectedNodeId(null); }}
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-darkpanel shadow-2xl z-[200] flex flex-col border-l border-slate-200 dark:border-zinc-700"
                                >
                                    {/* 헤더 */}
                                    <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{activeNode.data.emoji}</span>
                                            <div>
                                                <h2 className="text-sm font-black text-slate-800 dark:text-zinc-100">{activeNode.label}</h2>
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{activeNode.type} 편집</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedNodeId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 rounded-sm transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    {/* 컨텐츠 */}
                                    <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                                        <div className="space-y-5">
                                            {/* 인물 전용 필드 */}
                                            {activeNode.type === '인물' && (
                                                <>
                                                    {/* 1열: 이모지 / 이름 / 주사위 */}
                                                    <div className="flex gap-3">
                                                        <div className="w-14">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">이모지</label>
                                                            <input className="w-full mt-1 px-2 py-2 bg-slate-50 rounded-[3px] text-center text-lg border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.emoji || (activeNode.type === '그룹' ? '📁' : '')} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, emoji: e.target.value } } : n))} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">이름</label>
                                                            <div className="flex gap-1">
                                                                <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-black text-lg border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.label} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, label: e.target.value } : n))} />
                                                                <button
                                                                    onClick={() => setIsNameGenOpen(!isNameGenOpen)}
                                                                    className={`mt-1 w-[42px] h-[42px] flex items-center justify-center rounded-[3px] border transition-colors ${isNameGenOpen ? 'bg-indigo-100 border-indigo-300 text-indigo-600 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
                                                                    title="이름 생성기 열기"
                                                                >
                                                                    🎲
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 2열: 역할 / 성별 / 나이 */}
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">역할</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-black text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.role} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, role: e.target.value } } : n))}>
                                                                <option value="주인공">😁 주인공</option>
                                                                <option value="조력자">😎 조력자</option>
                                                                <option value="적대자">😡 적대자</option>
                                                                <option value="조연">🤓 조연</option>
                                                                <option value="엑스트라">🥸 엑스트라</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">성별</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.gender} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, gender: e.target.value } } : n))}>
                                                                <option value="남자">남자</option>
                                                                <option value="여자">여자</option>
                                                                <option value="중성">중성</option>
                                                                <option value="미지정">미지정</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">나이</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.age} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, age: e.target.value } } : n))} placeholder="나이" />
                                                        </div>
                                                    </div>

                                                    {/* 3열: 직업 / 종족 */}
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">직업</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.job} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, job: e.target.value } } : n))} placeholder="직업 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">종족</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.race || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, race: e.target.value } } : n))} placeholder="종족 입력" />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* 사건/메모: 이모지 + 이름 */}
                                            {activeNode.type !== '인물' && (
                                                <div className="flex gap-3">
                                                    <div className="w-20">
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">이모지</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] text-center text-xl border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.emoji || (activeNode.type === '그룹' ? '📁' : '')} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, emoji: e.target.value } } : n))} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">이름</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-black text-lg border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.label} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, label: e.target.value } : n))} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* 메모 전용 필드 */}
                                            {activeNode.type === '메모' && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">분류</label>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {['메모', '장소', '아이템', '세력', '복선', '타임라인', '설정', '대사', '갈등'].map(cat => (
                                                            <button key={cat} onClick={() => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, category: cat } } : n))} className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all ${(activeNode.data.category || '메모') === cat ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'}`}>{cat}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 사건 전용 필드 */}
                                            {activeNode.type === '사건' && (
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">발생 장소</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.place || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, place: e.target.value } } : n))} placeholder="장소 입력" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">발생 시기</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.year || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, year: e.target.value } } : n))} placeholder="시기/연도 입력" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* 장소 전용 필드 */}
                                            {activeNode.type === '장소' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">지역/위치</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.region || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, region: e.target.value } } : n))} placeholder="지역 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">기후/환경</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.climate || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, climate: e.target.value } } : n))} placeholder="기후/환경 입력" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">장소 설명</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.description || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, description: e.target.value } } : n))} placeholder="장소에 대한 간단한 설명" />
                                                    </div>
                                                </>
                                            )}

                                            {/* 아이템 전용 필드 */}
                                            {activeNode.type === '아이템' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">분류</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.category || '일반'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, category: e.target.value } } : n))}>
                                                                <option value="일반">일반</option>
                                                                <option value="무기">무기</option>
                                                                <option value="방어구">방어구</option>
                                                                <option value="장신구">장신구</option>
                                                                <option value="소모품">소모품</option>
                                                                <option value="재료">재료</option>
                                                                <option value="열쇠/도구">열쇠/도구</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">희귀도</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.rarity || '보통'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, rarity: e.target.value } } : n))}>
                                                                <option value="보통">보통</option>
                                                                <option value="고급">고급</option>
                                                                <option value="희귀">희귀</option>
                                                                <option value="영웅">영웅</option>
                                                                <option value="전설">전설</option>
                                                                <option value="유일">유일</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">소유자</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.owner || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, owner: e.target.value } } : n))} placeholder="소유자 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">효과/능력</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.effect || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, effect: e.target.value } } : n))} placeholder="효과/능력 입력" />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* 세력 전용 필드 */}
                                            {activeNode.type === '세력' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">리더/수장</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.leader || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, leader: e.target.value } } : n))} placeholder="리더 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">영역/본거지</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.territory || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, territory: e.target.value } } : n))} placeholder="영역 입력" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">주요 구성원</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.members || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, members: e.target.value } } : n))} placeholder="주요 구성원 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">목표/이념</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.goal || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, goal: e.target.value } } : n))} placeholder="목표/이념 입력" />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* 복선 전용 필드 */}
                                            {activeNode.type === '복선' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">등장 장/회차</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.chapter || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, chapter: e.target.value } } : n))} placeholder="장/회차 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">상태</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.status || '미회수'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, status: e.target.value } } : n))}>
                                                                <option value="미회수">🔄 미회수</option>
                                                                <option value="진행중">🔥 진행중</option>
                                                                <option value="회수됨">✅ 회수됨</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">힌트/복선 내용</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.hint || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, hint: e.target.value } } : n))} placeholder="복선 내용 입력" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">회수 계획</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.reveal || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, reveal: e.target.value } } : n))} placeholder="회수 계획 입력" />
                                                    </div>
                                                </>
                                            )}

                                            {/* 타임라인 전용 필드 */}
                                            {activeNode.type === '타임라인' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">날짜/시점</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.date || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, date: e.target.value } } : n))} placeholder="날짜/시점 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">시대/배경</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.era || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, era: e.target.value } } : n))} placeholder="시대/배경 입력" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">중요도</label>
                                                        <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.importance || '보통'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, importance: e.target.value } } : n))}>
                                                            <option value="낮음">낮음</option>
                                                            <option value="보통">보통</option>
                                                            <option value="중요">중요</option>
                                                            <option value="핵심">핵심</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {/* 설정 전용 필드 */}
                                            {activeNode.type === '설정' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">분류</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.category || '세계관'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, category: e.target.value } } : n))}>
                                                                <option value="세계관">세계관</option>
                                                                <option value="마법체계">마법체계</option>
                                                                <option value="종족">종족</option>
                                                                <option value="역사">역사</option>
                                                                <option value="문화">문화</option>
                                                                <option value="규칙">규칙</option>
                                                                <option value="기타">기타</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">적용 범위</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.scope || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, scope: e.target.value } } : n))} placeholder="적용 범위 입력" />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* 대사 전용 필드 */}
                                            {activeNode.type === '대사' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">화자</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.speaker || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, speaker: e.target.value } } : n))} placeholder="화자 입력" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">감정/톤</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.emotion || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, emotion: e.target.value } } : n))} placeholder="감정/톤 입력" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">상황/맥락</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.situation || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, situation: e.target.value } } : n))} placeholder="상황/맥락 입력" />
                                                    </div>
                                                </>
                                            )}

                                            {/* 갈등 전용 필드 */}
                                            {activeNode.type === '갈등' && (
                                                <>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">갈등 당사자</label>
                                                            <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.parties || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, parties: e.target.value } } : n))} placeholder="당사자 입력 (예: A vs B)" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">상태</label>
                                                            <select className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.status || '진행중'} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, status: e.target.value } } : n))}>
                                                                <option value="잠재적">🔵 잠재적</option>
                                                                <option value="진행중">🔥 진행중</option>
                                                                <option value="격화">💥 격화</option>
                                                                <option value="해결됨">✅ 해결됨</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">갈등 원인</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.cause || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, cause: e.target.value } } : n))} placeholder="갈등 원인 입력" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">해결 방안</label>
                                                        <input className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-[3px] font-bold text-sm border border-slate-200 outline-none h-[42px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.resolution || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, resolution: e.target.value } } : n))} placeholder="해결 방안 입력" />
                                                    </div>
                                                </>
                                            )}

                                            {/* 그룹 전용 필드 */}
                                            {activeNode.type === '그룹' && (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">메모</label>
                                                        <input type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.memo || ''} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, memo: e.target.value } } : n))} placeholder="그룹 메모..." />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">너비</label>
                                                            <input type="number" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.width || 400} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, width: Math.max(200, parseInt(e.target.value) || 200) } } : n))} min="200" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">높이</label>
                                                            <input type="number" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" value={activeNode.data.height || 300} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, height: Math.max(150, parseInt(e.target.value) || 150) } } : n))} min="150" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">그룹 색상</label>
                                                        <div className="flex gap-2 mt-2 flex-wrap">
                                                            {['#94a3b8', '#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'].map(color => (
                                                                <button key={color} onClick={() => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, color } } : n))} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${activeNode.data.color === color ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">포함된 노드 ({(activeNode.data.childNodes || []).length}개)</label>
                                                        <div className="mt-2 max-h-70 overflow-y-auto bg-slate-50 border border-slate-200 rounded-[3px] dark:bg-zinc-800 dark:border-zinc-700">
                                                            {(activeNode.data.childNodes || []).length === 0 ? (
                                                                <div className="p-4 text-center text-slate-400 text-xs">포함된 노드가 없습니다</div>
                                                            ) : (
                                                                <div className="divide-y divide-slate-200 dark:divide-zinc-700">
                                                                    {(activeNode.data.childNodes || []).map(childId => {
                                                                        const childNode = nodes.find(n => n.id === childId);
                                                                        if (!childNode) return null;
                                                                        return (
                                                                            <div key={childId} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
                                                                                <span className="text-lg">{childNode.data.emoji || '📄'}</span>
                                                                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-zinc-300 truncate">{childNode.label}</span>
                                                                                <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-zinc-600 rounded text-slate-500 dark:text-zinc-400">{childNode.type}</span>
                                                                                <button
                                                                                    onClick={() => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, childNodes: (n.data.childNodes || []).filter(id => id !== childId) } } : n))}
                                                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                                                    title="그룹에서 제거"
                                                                                >
                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* 할일 전용 필드 */}
                                            {activeNode.type === '할일' && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">할 일 목록</label>
                                                    <div className="flex gap-2 mt-1">
                                                        <input 
                                                            type="text" 
                                                            placeholder="+ 할 일 추가" 
                                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white transition-all rounded-[3px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                                                            value={todoInput}
                                                            onChange={(e) => setTodoInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    if (e.nativeEvent.isComposing) return;
                                                                    e.preventDefault();
                                                                    if (todoInput.trim()) {
                                                                        const newItem = { id: generateUUID(), text: todoInput.trim(), done: false };
                                                                        updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, items: [...(n.data.items || []), newItem] } } : n));
                                                                        setTodoInput('');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                if (todoInput.trim()) {
                                                                    const newItem = { id: generateUUID(), text: todoInput.trim(), done: false };
                                                                    updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, items: [...(n.data.items || []), newItem] } } : n));
                                                                    setTodoInput('');
                                                                }
                                                            }}
                                                            className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-[3px] transition-colors"
                                                        >
                                                            추가
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 space-y-1">
                                                        {(activeNode.data.items || []).map(item => (
                                                            <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-[3px] border border-slate-100 dark:bg-zinc-800/50 dark:border-zinc-700 group">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={item.done} 
                                                                    onChange={() => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, items: n.data.items.map(i => i.id === item.id ? { ...i, done: !i.done } : i) } } : n))}
                                                                    className="w-4 h-4 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                                />
                                                                <span className={`text-sm flex-1 truncate ${item.done ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-200'}`}>{item.text}</span>
                                                                <button 
                                                                    onClick={() => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, items: n.data.items.filter(i => i.id !== item.id) } } : n))}
                                                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <IconTrash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {(activeNode.data.items || []).length === 0 && (
                                                            <div className="text-xs text-slate-400 text-center py-4 italic">등록된 할 일이 없습니다</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 메모 (할일, 그룹 제외) */}
                                            {activeNode.type !== '그룹' && activeNode.type !== '할일' && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">메모 및 세부 설정</label>
                                                    <textarea className="w-full mt-1 h-56 p-4 bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white transition-all resize-none leading-relaxed dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:focus:bg-zinc-700" value={activeNode.data.memo} onChange={e => updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, data: { ...n.data, memo: e.target.value } } : n))} placeholder="메모를 입력하세요..." />
                                                    <AnimatePresence>
                                                        {activeNode.type === '인물' && isNameGenOpen && (
                                                            <div className="mobile-hide">
                                                                <NameGenerator
                                                                    onClose={() => setIsNameGenOpen(false)}
                                                                    onConfirm={(name) => {
                                                                        updateActiveProject(prev => prev.map(n => n.id === activeNode.id ? { ...n, label: name } : n));
                                                                    }}
                                                                    settings={nameGenSettings}
                                                                    onSettingsChange={setNameGenSettings}
                                                                />
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-200 dark:border-zinc-700 shrink-0">
                                        <button onClick={() => { saveHistory(); setSelectedNodeId(null); showToast("설정이 저장되었습니다"); }} className="w-full py-4 bg-slate-900 text-white font-black hover:bg-indigo-600 transition-all uppercase text-xs tracking-widest rounded-[3px] shadow-lg dark:bg-indigo-600 dark:hover:bg-indigo-500">
                                            저장 후 닫기
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {activeEdge && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[3px] shadow-2xl w-[420px] relative dark:bg-darkpanel border border-slate-200 dark:border-darkborder">
                                    <button onClick={() => setSelectedEdgeId(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                    <h2 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 관계선 설정
                                    </h2>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1 mb-2 block">메모</label>
                                            <input
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[3px] font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:focus:bg-zinc-700/50"
                                                value={activeEdge.label}
                                                onChange={e => updateActiveProject(null, prev => prev.map(ev => ev.id === activeEdge.id ? { ...ev, label: e.target.value } : ev))}
                                            />
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1 mb-2 block">선 종류</label>
                                                <select
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] font-bold text-xs outline-none cursor-pointer hover:bg-slate-100 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                                                    value={activeEdge.style || 'solid'}
                                                    onChange={e => updateActiveProject(null, prev => prev.map(ev => ev.id === activeEdge.id ? { ...ev, style: e.target.value } : ev))}
                                                >
                                                    <option value="solid">─ 실선 (Solid)</option>
                                                    <option value="dotted">··· 점선 (Dotted)</option>
                                                    <option value="dashed">--- 파선 (Dashed)</option>
                                                    <option value="double">══ 이중선 (Double)</option>
                                                </select>
                                            </div>
                                            <div className="flex-[1.2]">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1 mb-2 block">선 굵기</label>
                                                <div className="flex items-center h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[3px] p-1">
                                                    {[2, 4, 6].map(w => (
                                                        <button
                                                            key={w}
                                                            onClick={() => updateActiveProject(null, prev => prev.map(ev => ev.id === activeEdge.id ? { ...ev, width: w } : ev))}
                                                            className={`flex-1 h-full flex flex-col items-center justify-center rounded-[2px] transition-all ${(activeEdge.width || 2) === w ? 'bg-white shadow-sm text-indigo-600 dark:bg-zinc-700 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
                                                        >
                                                            <div className="bg-current rounded-full mb-1" style={{ width: w * 2, height: 2 }}></div>
                                                            <span className="text-[9px] font-black">{w}px</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { saveHistory(); setSelectedEdgeId(null); }}
                                        className="w-full mt-10 py-4 bg-slate-900 text-white font-black rounded-[3px] hover:bg-indigo-600 transition-all uppercase text-[11px] tracking-[0.2em] shadow-lg dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                    >
                                        저장 후 닫기
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div >
            );
        };

