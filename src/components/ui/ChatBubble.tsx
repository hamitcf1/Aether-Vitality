import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Sparkles, User } from 'lucide-react';

interface ChatBubbleProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, timestamp }) => {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}
        >
            {/* Avatar */}
            <div className={cn(
                'w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center',
                isUser
                    ? 'bg-white/[0.06] border border-white/[0.08]'
                    : 'bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20'
            )}>
                {isUser ? <User className="w-4 h-4 text-gray-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
            </div>

            {/* Message */}
            <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                isUser
                    ? 'bg-brand-emerald/15 border border-emerald-500/15 text-gray-200'
                    : 'glass-subtle text-gray-300'
            )}>
                <p className="whitespace-pre-wrap">{content}</p>
                {timestamp && (
                    <p className="text-[10px] text-gray-600 mt-2 font-mono">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export const TypingIndicator: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3"
    >
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="glass-subtle rounded-2xl px-5 py-4 flex gap-1.5">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-emerald-400/50"
                />
            ))}
        </div>
    </motion.div>
);
