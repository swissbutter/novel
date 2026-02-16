// Helper for subline content
const getNodeSubline = (node) => {
    switch (node.type) {
        case '인물': return `${node.data.gender} · ${node.data.age ? `${node.data.age}세` : '나이 미상'} · ${node.data.job || '직업 없음'}`;
        case '사건': return `📍 ${node.data.place || '장소 미상'} · 📅 ${node.data.year || '시기 미상'}`;
        case '장소': return `🌍 ${node.data.region || '지역 미상'} · 🌤️ ${node.data.climate || '기후 미상'}`;
        case '아이템': return `📦 ${node.data.category || '일반'} · ⭐ ${node.data.rarity || '보통'}`;
        case '세력': return `👑 ${node.data.leader || '리더 미상'} · 🏰 ${node.data.territory || '영역 미상'}`;
        case '복선': return `📖 ${node.data.chapter || '장 미상'} · ${node.data.status === '회수됨' ? '✅ 회수됨' : '🔄 미회수'}`;
        case '타임라인': return `📅 ${node.data.date || '날짜 미상'} · 🏛️ ${node.data.era || '시대 미상'}`;
        case '설정': return `📂 ${node.data.category || '세계관'} · 📏 ${node.data.scope || '범위 미상'}`;
        case '대사': return `🗣️ ${node.data.speaker || '화자 미상'} · 💭 ${node.data.emotion || '감정 미상'}`;
        case '갈등': return `⚔️ ${node.data.parties || '당사자 미상'} · ${node.data.status === '해결됨' ? '✅ 해결됨' : '🔥 진행중'}`;
        case '할일': {
            const items = node.data.items || [];
            const done = items.filter(i => i.done).length;
            return `📋 ${done}/${items.length} 완료 · ${done === items.length && items.length > 0 ? '🎉 완료됨' : '🔥 진행중'}`;
        }
        case '그룹': return `📁 ${node.data.childNodes?.length || 0}개 항목`;
        default: return '';
    }
};

// Helper for badge content
const getNodeBadge = (node) => {
    const topTierStyle = 'bg-red-600 text-white';
    switch (node.type) {
        case '인물': return node.data.role ? { text: node.data.role, style: getRoleBadgeStyle(node.data.role) } : null;
        case '복선': return { text: node.data.status || '미회수', style: node.data.status === '회수됨' ? 'bg-emerald-600 text-white' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' };
        case '갈등': return { text: node.data.status || '진행중', style: node.data.status === '해결됨' ? 'bg-emerald-600 text-white' : node.data.status === '격화' ? topTierStyle : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' };
        case '아이템': return node.data.rarity ? { text: node.data.rarity, style: (node.data.rarity === '전설' || node.data.rarity === '유일') ? topTierStyle : node.data.rarity === '영웅' ? 'bg-amber-500 text-white' : node.data.rarity === '희귀' ? 'bg-purple-500 text-white' : node.data.rarity === '고급' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300' } : null;
        case '타임라인': return node.data.importance ? { text: node.data.importance, style: node.data.importance === '핵심' ? topTierStyle : node.data.importance === '중요' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300' } : null;
        default: return null;
    }
};

const NodeCard = ({ node, isTop, isSelected, isDragging, onMouseDown, onMouseUp, onDoubleClick, onDelete, onClick, onUpdateNode }) => {
    const isIdea = node.type === '메모';
    const isGroup = node.type === '그룹';
    const isTodo = node.type === '할일';
    let styleClass = isIdea ? "node-postit" : isGroup ? "node-glass" : isTodo ? "" : "node-glass";

    if (node.type === '인물') {
        if (node.data.role === '주인공') styleClass += " node-protagonist";
        else if (node.data.role === '적대자') styleClass += " node-antagonist";
        else if (node.data.role === '조력자') styleClass += " node-helper";
    } else if (node.type === '사건') styleClass += " node-event";
    else if (isTodo) {
        styleClass += " border border-cyan-300 bg-cyan-100 dark:bg-[#0c1e24] dark:border-cyan-900 shadow-sm rounded-[3px]";
        const items = node.data.items || [];
        if (items.length > 0 && items.every(i => i.done)) {
            styleClass += " node-todo-complete";
        }
    }

    if (isGroup) {
        styleClass += " border-2 border-dashed";
    }

    const subline = getNodeSubline(node);
    const badge = getNodeBadge(node);

    const handleToggleTodo = (itemId) => {
        const newItems = (node.data.items || []).map(item => 
            item.id === itemId ? { ...item, done: !item.done } : item
        );
        onUpdateNode(node.id, { items: newItems });
    };

    return (
        <div 
            onMouseDown={(e) => onMouseDown(e, node.id)} 
            onMouseUp={(e) => onMouseUp(e, node.id)} 
            onClick={(e) => { if (onClick && e.detail === 1) { e.stopPropagation(); onClick(e, node.id); } }} 
            onDoubleClick={() => onDoubleClick(node.id)} 
            style={{ 
                zIndex: isTop ? 50 : (isGroup ? 5 : 10), 
                width: CARD_W, 
                height: isTodo ? 'auto' : CARD_H, 
                minHeight: isTodo ? CARD_H : 'auto', 
                transform: `translate(${node.x}px, ${node.y}px)`, 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                transition: isDragging ? 'none' : 'transform 0.15s ease-out, box-shadow 0.2s', 
                ...(isGroup && node.data.color ? { borderColor: node.data.color } : {}) 
            }} 
            className={`flex flex-col cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl group relative ${styleClass} ${isSelected ? `border-2 ${getSelectedBorderColor(node)}` : ''}`}
        >
            <button onClick={(e) => { e.stopPropagation(); if (confirm("이 노드를 삭제하시겠습니까?")) onDelete(node.id); }} className="absolute top-0 right-0 z-[100] w-6 h-6 flex items-center justify-center bg-white hover:bg-red-500 hover:text-white text-slate-400 border border-slate-200 rounded-[3px] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1/2 -translate-y-1/2 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-red-600"><IconTrash className="w-3 h-3" /></button>
            <div className={`w-full flex flex-col rounded-[inherit] ${isTodo ? '' : 'h-full overflow-hidden'}`}>
                {(!isIdea && !isTodo) && <div className={`h-1.5 w-[calc(100%+4px)] -ml-[2px] -mt-[2px] shrink-0 ${getNodeBarColor(node)}`} />}
                <div className={`flex-1 flex flex-col p-4 pointer-events-none ${isTodo ? '' : 'overflow-hidden'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isIdea ? 'text-yellow-800 dark:text-yellow-100' : 'text-slate-400 dark:text-zinc-50'}`}>{isIdea ? (node.data.category || '메모') : node.type}</span>
                        {badge && <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[3px] ${badge.style}`}>{badge.text}</span>}
                    </div>
                    <div className={`${isTodo ? 'text-lg' : 'text-xl'} font-black truncate mb-1.5 tracking-tight flex items-center ${isIdea ? 'text-slate-950 dark:text-yellow-50' : 'text-slate-900 dark:text-white'}`}>
                        <span className="mr-2 drop-shadow-sm text-2xl">{node.data.emoji || NODE_TYPE_EMOJIS[node.type] || '📝'}</span>
                        <span className={`truncate ${node.type === '사건' ? 'text-rose-700 dark:text-rose-400' : node.type === '갈등' ? 'text-rose-600 dark:text-rose-400' : ''}`}>{node.label}</span>
                    </div>
                    {subline && <div className={`${isTodo ? 'text-sm' : 'text-[11px]'} text-slate-500 dark:text-zinc-400 font-bold mb-2 truncate`}>{subline}</div>}
                    
                    {isTodo ? (
                        <div className="flex-1 pointer-events-auto pr-1">
                            <div className="space-y-1 pb-2">
                                {(node.data.items || []).map(item => (
                                    <div key={item.id} className="flex items-center gap-2 group/item">
                                        <input 
                                            type="checkbox" 
                                            checked={item.done} 
                                            onChange={() => handleToggleTodo(item.id)}
                                            onMouseDown={e => e.stopPropagation()}
                                            className="w-3 h-3 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                        />
                                        <span className={`text-base flex-1 break-words ${item.done ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-300'}`}>{item.text}</span>
                                    </div>
                                ))}
                                {(node.data.items || []).length === 0 && (
                                    <div className="text-[10px] text-slate-400 text-center py-2 italic">더블클릭하여 할 일 추가</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={`text-[12px] font-medium leading-tight line-clamp-3 grow ${isIdea ? 'text-slate-700 dark:text-yellow-100/80' : 'text-slate-500 bg-slate-50 p-2 rounded-[3px] border border-slate-100 italic dark:bg-zinc-900/60 dark:border-zinc-700/50 dark:text-zinc-400'}`}>{node.data.memo || "작성된 메모가 없습니다."}</div>
                    )}
                </div>
            </div>
        </div>
    );
};