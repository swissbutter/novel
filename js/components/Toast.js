const { motion } = window.Motion;

const Toast = ({ message, type, onClose }) => (
    <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.9, x: '-50%' }} 
        animate={{ y: 0, opacity: 1, scale: 1, x: '-50%' }} 
        exit={{ y: 50, opacity: 0, scale: 0.9, x: '-50%' }} 
        className="fixed bottom-10 left-1/2 z-[9999] flex items-center gap-3 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-full shadow-2xl"
    >
        <span className="text-sm font-bold">{message}</span>
    </motion.div>
);