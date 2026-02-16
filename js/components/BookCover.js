const { memo } = React;
const { motion } = window.Motion;

const BookCover = memo(({ book, onClick, onDelete, onEdit, isDragging, isDropTarget, dragHandleProps }) => {
    return (
        <div
            className={`group perspective-1000 relative transition-transform duration-200 ${isDragging ? 'scale-105 z-50' : ''} ${isDropTarget ? 'scale-95' : ''}`}
            style={{ perspective: '1200px' }}
            onClick={onClick}
        >
            <div className="absolute top-[8px] bottom-[8px] left-0 w-full bg-white shadow-sm transform translate-x-[9px] z-[1] border border-slate-200 opacity-40"></div>
            <div className="absolute top-[6px] bottom-[6px] left-0 w-full bg-white shadow-sm transform translate-x-[6px] z-[2] border border-slate-200 opacity-70"></div>
            <div className="absolute top-[4px] bottom-[4px] left-0 w-full bg-white shadow-sm transform translate-x-[3px] z-[3] border border-slate-200 opacity-90"></div>
            <div className="absolute top-[2px] bottom-[3px] left-[-1px] w-full page-bg shadow-sm transform translate-x-[1px] z-[4] border-l border-slate-200"></div>

            <motion.div initial={{ rotateY: 0 }} whileHover={(isDragging || isDropTarget) ? {} : { rotateY: -20 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className={`book-card relative rounded-[3px] shadow-lg cursor-pointer flex flex-col origin-left z-10 h-full backdrop-blur-sm ${isDragging ? 'shadow-2xl ring-2 ring-indigo-400' : ''}`} style={{ backgroundColor: (book.color || '#475569') + 'd9', aspectRatio: '2 / 3', outline: isDropTarget ? '2px dotted #818cf8' : 'none', outlineOffset: '-2px', opacity: isDropTarget ? 0.7 : 1 }}>
                <div className="absolute inset-0 book-spine pointer-events-none z-10"></div>
                <div className="absolute left-0 top-0 bottom-0 w-[15px] bg-black/10 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/5 z-15 pointer-events-none rounded-[3px]"></div>
                <div className="flex-1 p-8 flex flex-col relative z-20 text-white">
                    <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4 border-b border-white/20 pb-2">NOVEL PROJECT</div>
                    <h3 className="text-xl font-black leading-tight tracking-tight break-keep drop-shadow-md">{book.title}</h3>
                    <div className="mt-2 text-xs opacity-70">{book.author || "작가 미상"}</div>
                    <div className="mt-auto pt-4 space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold opacity-80">
                            <span className="opacity-60">보드</span> {book.projects?.filter(p => p.type === 'board').length || 0}
                            <span className="mx-1 opacity-40">|</span>
                            <span className="opacity-60">문서</span> {book.projects?.filter(p => p.type === 'doc').length || 0}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div {...dragHandleProps} onClick={(e) => e.stopPropagation()} className="p-2 text-white/40 hover:text-white hover:bg-white/20 rounded-[3px] cursor-grab active:cursor-grabbing" title="드래그하여 순서 변경">
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
                            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
                            <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
                        </svg>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(book); }} className="p-2 text-white/40 hover:text-white hover:bg-white/20 rounded-[3px]" title="수정"><IconSettings className="w-4 h-4" /></button>
                </div>
            </motion.div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.book.id === nextProps.book.id &&
        prevProps.book.title === nextProps.book.title &&
        prevProps.book.author === nextProps.book.author &&
        prevProps.book.color === nextProps.book.color &&
        prevProps.book.projects?.length === nextProps.book.projects?.length &&
        prevProps.isDragging === nextProps.isDragging &&
        prevProps.isDropTarget === nextProps.isDropTarget
    );
});