import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Inline cn utility
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const CURSOR_STORAGE_KEY = 'aether_custom_cursor_enabled';

export function getCursorEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(CURSOR_STORAGE_KEY);
    return saved !== 'false'; // default: enabled
}

export function setCursorEnabled(enabled: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURSOR_STORAGE_KEY, String(enabled));
    // Dispatch text event for immediate cross-component updates
    window.dispatchEvent(new Event('cursor-setting-changed'));
}

export function CustomCursor() {
    const [enabled, setEnabled] = useState(getCursorEnabled());

    useEffect(() => {
        const handler = () => setEnabled(getCursorEnabled());
        window.addEventListener('cursor-setting-changed', handler);
        return () => window.removeEventListener('cursor-setting-changed', handler);
    }, []);

    // Manage global body cursor style
    useEffect(() => {
        if (enabled) {
            document.body.classList.add('custom-cursor-active');
            document.documentElement.style.cursor = 'none';
            document.body.style.cursor = 'none';
        } else {
            document.body.classList.remove('custom-cursor-active');
            document.documentElement.style.cursor = '';
            document.body.style.cursor = '';
        }

        return () => {
            document.body.classList.remove('custom-cursor-active');
            document.documentElement.style.cursor = '';
            document.body.style.cursor = '';
        };
    }, [enabled]);

    if (!enabled) return null;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

    return <CursorRenderer />;
}

function CursorRenderer() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 50, stiffness: 1000 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isTextInput, setIsTextInput] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Locked to Emerald color for Aetherius theme
    const primaryColor = 'hsl(158, 64%, 52%)';

    useEffect(() => {
        const updateCursorState = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            // Optimization: Simple checks first
            const target = e.target as HTMLElement;
            if (!target) return;

            // Check if hovering over scrollbar (roughly)
            if (e.clientX > document.documentElement.clientWidth || e.clientY > document.documentElement.clientHeight) {
                setIsHidden(true);
                return;
            } else {
                setIsHidden(false);
            }

            // Optimization: Avoid getComputedStyle. Use tag names and specific classes.
            const tagName = target.tagName;
            const isClickable =
                tagName === 'BUTTON' ||
                tagName === 'A' ||
                tagName === 'SELECT' ||
                target.closest('button') !== null ||
                target.closest('a') !== null ||
                target.classList.contains('cursor-pointer') ||
                target.classList.contains('clickable');

            const isInput = tagName === 'INPUT';
            const isTextArea = tagName === 'TEXTAREA';
            const isContentEditable = target.isContentEditable;

            const isText = isTextArea || isContentEditable || (isInput &&
                !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image', 'hidden'].includes((target as HTMLInputElement).type)
            );

            setIsHovering(isClickable);
            setIsTextInput(isText);
        };

        const handleMouseLeave = () => setIsHidden(true);
        const handleMouseEnter = () => setIsHidden(false);
        const handleMouseDown = () => setIsHovering(true); // Visual feedback
        const handleMouseUp = () => setIsHovering(false); // Reset

        window.addEventListener('mousemove', updateCursorState, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateCursorState);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className={cn(
                "fixed top-0 left-0 pointer-events-none z-[999999] mix-blend-difference",
                "flex items-center justify-center",
                isHidden ? "opacity-0" : "opacity-100"
            )}
            style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
                x: '-50%',
                y: '-50%',
            }}
        >
            {/* Outer Ring */}
            <motion.div
                animate={{
                    width: isTextInput ? 2 : (isHovering ? 48 : 32),
                    height: isTextInput ? 24 : (isHovering ? 48 : 32),
                    borderRadius: isTextInput ? 1 : 9999,
                    backgroundColor: isTextInput ? primaryColor : 'transparent',
                    border: isTextInput ? 'none' : '1.5px solid white',
                    opacity: isTextInput ? 0.8 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28
                }}
            />

            {/* Inner Dot */}
            {!isTextInput && (
                <motion.div
                    className="absolute bg-white rounded-full"
                    animate={{
                        width: isHovering ? 0 : 4,
                        height: isHovering ? 0 : 4,
                    }}
                    transition={{ duration: 0.2 }}
                />
            )}
        </motion.div>
    );
}
