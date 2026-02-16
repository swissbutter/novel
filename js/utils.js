// Constants
const CARD_W = 250;
const CARD_H = 200;
const FONT_DISPLAY_NAMES = {
    maruburi: "마루부리",
    Ridibatang: "리디바탕",
    Galmuri14: "갈무리14",
    pretendard: "프리텐다드"
};
const BOOK_COLORS = [
    '#1c1917', '#44403c', '#78716c', '#9f1239', '#be4d67', '#c2724c',
    '#a3703c', '#8b7355', '#5c6d4a', '#4a766e', '#3d6a73', '#456b8a',
    '#4a5d7a', '#5b5d8a', '#6b5b7a', '#7a5b6d', '#8c6478', '#6d5c5c'
];

// Utility Functions
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

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

const getWordAtPos = (text, pos) => {
    if (!text) return "";
    const left = text.slice(0, pos).search(/[^\s#@]*$/);
    const right = text.slice(pos).search(/[\s\n\r]/);
    const word = text.slice(left, right === -1 ? undefined : right + pos);
    return word.replace(/[#@]/g, '').trim();
};
const getBezierPath = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const curvature = 0.5;
    const cx1 = x1 + dx * curvature;
    const cy1 = y1;
    const cx2 = x2 - dx * curvature;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};

const getEdgeTargetPos = (from, to, offset = 12) => {
    const x1 = from.x + CARD_W / 2;
    const y1 = from.y + CARD_H / 2;
    const x2 = to.x + CARD_W / 2;
    const y2 = to.y + CARD_H / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const absCos = Math.abs(Math.cos(angle));
    const absSin = Math.abs(Math.sin(angle));
    let distance = (CARD_W * absSin <= CARD_H * absCos) ? (CARD_W / 2) / absCos : (CARD_H / 2) / absSin;
    return { x: x2 - Math.cos(angle) * (distance + offset), y: y2 - Math.sin(angle) * (distance + offset) };
};

const getRoleBadgeStyle = (role) => {
    switch (role) {
        case '주인공': return 'bg-blue-600 dark:bg-blue-800 text-white';
        case '적대자': return 'bg-red-600 dark:bg-red-800 text-white';
        case '조력자': return 'bg-emerald-600 dark:bg-emerald-800 text-white';
        case '조연': return 'bg-slate-500 text-white';
        case '엑스트라': return 'bg-slate-300 text-slate-600';
        default: return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
};

const getStatusBadgeStyle = (status) => {
    switch (status) {
        case '초고': return 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300';
        case '수정': return 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case '완료': return 'bg-emerald-600 text-white';
        default: return 'bg-slate-100 text-slate-400';
    }
};

// Node Type Definitions
const NODE_TYPE_COLORS = {
    '인물': { sidebar: 'border-l-blue-500 dark:border-l-blue-400', selected: 'border-blue-500 dark:border-blue-400', bar: 'bg-blue-600 dark:bg-blue-600', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/50' },
    '사건': { sidebar: 'border-l-red-500 dark:border-l-red-400', selected: 'border-red-500 dark:border-red-400', bar: 'bg-red-600 dark:bg-red-600', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', hover: 'hover:bg-red-50 dark:hover:bg-red-950/50' },
    '메모': { sidebar: 'border-l-amber-500 dark:border-l-amber-400', selected: 'border-amber-500 dark:border-amber-400', bar: 'bg-amber-500 dark:bg-amber-600', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/50' },
    '장소': { sidebar: 'border-l-emerald-500 dark:border-l-emerald-400', selected: 'border-emerald-500 dark:border-emerald-400', bar: 'bg-emerald-600 dark:bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50' },
    '아이템': { sidebar: 'border-l-purple-500 dark:border-l-purple-400', selected: 'border-purple-500 dark:border-purple-400', bar: 'bg-purple-600 dark:bg-purple-600', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500', hover: 'hover:bg-purple-50 dark:hover:bg-purple-950/50' },
    '세력': { sidebar: 'border-l-orange-500 dark:border-l-orange-400', selected: 'border-orange-500 dark:border-orange-400', bar: 'bg-orange-600 dark:bg-orange-600', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500', hover: 'hover:bg-orange-50 dark:hover:bg-orange-950/50' },
    '복선': { sidebar: 'border-l-pink-500 dark:border-l-pink-400', selected: 'border-pink-500 dark:border-pink-400', bar: 'bg-pink-600 dark:bg-pink-600', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500', hover: 'hover:bg-pink-50 dark:hover:bg-pink-950/50' },
    '타임라인': { sidebar: 'border-l-teal-500 dark:border-l-teal-400', selected: 'border-teal-500 dark:border-teal-400', bar: 'bg-teal-600 dark:bg-teal-600', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500', hover: 'hover:bg-teal-50 dark:hover:bg-teal-950/50' },
    '설정': { sidebar: 'border-l-indigo-500 dark:border-l-indigo-400', selected: 'border-indigo-500 dark:border-indigo-400', bar: 'bg-indigo-600 dark:bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50' },
    '대사': { sidebar: 'border-l-sky-500 dark:border-l-sky-400', selected: 'border-sky-500 dark:border-sky-400', bar: 'bg-sky-600 dark:bg-sky-600', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500', hover: 'hover:bg-sky-50 dark:hover:bg-sky-950/50' },
    '갈등': { sidebar: 'border-l-rose-500 dark:border-l-rose-400', selected: 'border-rose-500 dark:border-rose-400', bar: 'bg-rose-600 dark:bg-rose-600', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500', hover: 'hover:bg-rose-50 dark:hover:bg-rose-950/50' },
    '할일': { sidebar: 'border-l-cyan-500 dark:border-l-cyan-400', selected: 'border-cyan-500 dark:border-cyan-400', bar: 'bg-cyan-600 dark:bg-cyan-600', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500', hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/50' },
    '그룹': { sidebar: 'border-l-slate-500 dark:border-l-slate-400', selected: 'border-slate-500 dark:border-slate-400', bar: 'bg-slate-600 dark:bg-slate-600', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500', hover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50' }
};

const NODE_TYPE_EMOJIS = {
    '인물': '👤', '사건': '🔥', '메모': '💡', '장소': '📍', '아이템': '🎁',
    '세력': '⚔️', '복선': '🎣', '타임라인': '⏰', '설정': '📚', '대사': '💬', '갈등': '⚡', '할일': '✅', '그룹': '📁'
};

const getSidebarItemAccent = (node) => {
    return NODE_TYPE_COLORS[node.type]?.sidebar || 'border-l-transparent';
};
const getSelectedBorderColor = (node) => {
    return NODE_TYPE_COLORS[node.type]?.selected || 'border-indigo-500 dark:border-indigo-600';
};
const getNodeBarColor = (node) => {
    return NODE_TYPE_COLORS[node.type]?.bar || 'bg-slate-500 dark:bg-slate-700';
};
const getStrokeDashArray = (style, width) => {
    const w = width || 2;
    switch (style) {
        case 'dashed':
            if (w >= 6) return `${w * 3}, ${w * 2}`;
            return `${w * 4}, ${w * 3}`;
        case 'dotted': return `0, ${w * 2}`;
        default: return "";
    }
};

// Icons
const IconPlus = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>);
const IconTrash = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>);
const IconSettings = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconBack = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>);
const IconUpload = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>);
const IconSave = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
const IconSun = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>);
const IconMoon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>);
const IconZen = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></svg>);
const IconFont = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>);
const IconFileText = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>);
const IconLayout = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /><line x1="10" x2="14" y1="6.5" y2="6.5" /><line x1="10" x2="14" y1="17.5" y2="17.5" /><line x1="6.5" x2="6.5" y1="10" y2="14" /><line x1="17.5" x2="17.5" y1="10" y2="14" /></svg>);
const IconHistory = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>);