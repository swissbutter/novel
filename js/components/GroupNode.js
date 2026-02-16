const { useState, useRef, useEffect } = React;

const GroupNode = ({ node, isSelected, isDragging, onMouseDown, onDoubleClick, onDelete, onResize }) => {
    const width = node.data.width || 400;
    const height = node.data.height || 300;
    const color = node.data.color || '#94a3b8';
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const resizeHandlersRef = useRef({ move: null, end: null });

    useEffect(() => {
        return () => {
            if (resizeHandlersRef.current.move) {
                document.removeEventListener('mousemove', resizeHandlersRef.current.move);
            }
            if (resizeHandlersRef.current.end) {
                document.removeEventListener('mouseup', resizeHandlersRef.current.end);
            }
        };
    }, []);

    const handleResizeStart = (e, corner) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        resizeStartRef.current = { x: e.clientX, y: e.clientY, width, height };

        const handleResizeMove = (moveEvent) => {
            moveEvent.preventDefault();
            const scale = window.currentScale || 1;
            const dx = (moveEvent.clientX - resizeStartRef.current.x) / scale;
            const dy = (moveEvent.clientY - resizeStartRef.current.y) / scale;
            let newWidth = resizeStartRef.current.width;
            let newHeight = resizeStartRef.current.height;

            if (corner.includes('e')) newWidth = Math.max(200, resizeStartRef.current.width + dx);
            if (corner.includes('s')) newHeight = Math.max(150, resizeStartRef.current.height + dy);

            onResize(node.id, newWidth, newHeight);
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            resizeHandlersRef.current = { move: null, end: null };
        };

        resizeHandlersRef.current = { move: handleResizeMove, end: handleResizeEnd };
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    return (
        <div
            onMouseDown={(e) => {
                if (e.target.classList.contains('resize-handle')) return;
                onMouseDown(e, node.id);
            }}
            onDoubleClick={() => onDoubleClick(node.id)}
            style={{
                zIndex: 1,
                width: width,
                height: height,
                transform: `translate(${node.x}px, ${node.y}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                borderColor: color,
                backgroundColor: `${color}15`,
                transition: (isResizing || isDragging) ? 'none' : 'transform 0.15s ease-out, box-shadow 0.2s',
            }}
            className={`cursor-grab active:cursor-grabbing group border-2 border-dashed rounded-[3px] ${isSelected ? 'border-solid shadow-lg' : ''}`}
        >
            <button
                onClick={(e) => { e.stopPropagation(); if (confirm("이 그룹을 삭제하시겠습니까?")) onDelete(node.id); }}
                className="absolute top-0 right-0 z-[100] w-6 h-6 flex items-center justify-center bg-white hover:bg-red-500 hover:text-white text-slate-400 border border-slate-200 rounded-[3px] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1/2 -translate-y-1/2 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-red-600"
            >
                <IconTrash className="w-3 h-3" />
            </button>

            <div
                className="absolute top-6 left-8 flex items-center gap-1.5 pointer-events-none"
                style={{ color: color }}
            >
                <span className="opacity-70" style={{ fontSize: '40px' }}>{node.data.emoji || '📁'}</span>
                <span className="text-xl font-black opacity-50" style={{ fontSize: '40px' }}>{node.label}</span>
                {node.data.memo && <span className="font-bold opacity-40 ml-3" style={{ fontSize: '20px' }}>{node.data.memo}</span>}
            </div>

            <div
                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                style={{ backgroundColor: color }}
            />
            <div
                className="resize-handle absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-l-sm"
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                style={{ backgroundColor: color }}
            />
            <div
                className="resize-handle absolute bottom-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm"
                onMouseDown={(e) => handleResizeStart(e, 's')}
                style={{ backgroundColor: color }}
            />
        </div>
    );
};