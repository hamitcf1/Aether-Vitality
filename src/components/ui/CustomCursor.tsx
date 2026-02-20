/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Inline cn utility
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CURSOR_STORAGE_KEY = 'aether_custom_cursor_enabled';

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

    // Use refs instead of state to avoid re-renders on every mouse move
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafId = useRef<number>(0);

    // Locked to Emerald color for Aetherius theme
    const primaryColor = 'hsl(158, 64%, 52%)';

    const updateCursor = useCallback((e: MouseEvent) => {
        // Cancel previous rAF to throttle to 1 update per frame
        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            const target = e.target as HTMLElement;
            if (!target) return;

            const container = containerRef.current;
            const outer = outerRef.current;
            const inner = innerRef.current;
            if (!container || !outer) return;

            // Check if hovering over scrollbar
            if (e.clientX > document.documentElement.clientWidth || e.clientY > document.documentElement.clientHeight) {
                container.style.opacity = '0';
                return;
            } else {
                container.style.opacity = '1';
            }

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

            // Directly mutate DOM via refs — no React re-renders
            if (isText) {
                outer.style.width = '2px';
                outer.style.height = '24px';
                outer.style.borderRadius = '1px';
                outer.style.backgroundColor = primaryColor;
                outer.style.border = 'none';
                outer.style.opacity = '0.8';
                if (inner) inner.style.display = 'none';
            } else if (isClickable) {
                outer.style.width = '48px';
                outer.style.height = '48px';
                outer.style.borderRadius = '9999px';
                outer.style.backgroundColor = 'transparent';
                outer.style.border = '1.5px solid white';
                outer.style.opacity = '1';
                if (inner) {
                    inner.style.display = 'block';
                    inner.style.width = '0px';
                    inner.style.height = '0px';
                }
            } else {
                outer.style.width = '32px';
                outer.style.height = '32px';
                outer.style.borderRadius = '9999px';
                outer.style.backgroundColor = 'transparent';
                outer.style.border = '1.5px solid white';
                outer.style.opacity = '1';
                if (inner) {
                    inner.style.display = 'block';
                    inner.style.width = '4px';
                    inner.style.height = '4px';
                }
            }
        });
    }, [cursorX, cursorY, primaryColor]);

    useEffect(() => {
        const handleMouseLeave = () => {
            if (containerRef.current) containerRef.current.style.opacity = '0';
        };
        const handleMouseEnter = () => {
            if (containerRef.current) containerRef.current.style.opacity = '1';
        };

        window.addEventListener('mousemove', updateCursor, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', updateCursor);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [updateCursor]);

    return (
        <motion.div
            ref={containerRef}
            className={cn(
                "fixed top-0 left-0 pointer-events-none z-[999999] mix-blend-difference",
                "flex items-center justify-center"
            )}
            style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
                x: '-50%',
                y: '-50%',
            }}
        >
            {/* Outer Ring — style mutated via ref */}
            <div
                ref={outerRef}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    border: '1.5px solid white',
                    transition: 'width 0.15s, height 0.15s, border-radius 0.15s, opacity 0.15s',
                }}
            />
            {/* Inner Dot */}
            <div
                ref={innerRef}
                className="absolute bg-white rounded-full"
                style={{
                    width: 4,
                    height: 4,
                    transition: 'width 0.15s, height 0.15s',
                }}
            />
        </motion.div>
    );
}
