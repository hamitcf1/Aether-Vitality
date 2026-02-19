import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Inline cn utility to avoid dependency issues if not present
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CURSOR_STORAGE_KEY = 'aether_custom_cursor_enabled'

export function getCursorEnabled(): boolean {
    const saved = localStorage.getItem(CURSOR_STORAGE_KEY)
    return saved !== 'false' // default: enabled
}

export function setCursorEnabled(enabled: boolean) {
    localStorage.setItem(CURSOR_STORAGE_KEY, String(enabled))
    window.dispatchEvent(new Event('cursor-setting-changed'))
}

export function CustomCursor() {
    const [cursorEnabled, setCursorEnabledState] = useState(getCursorEnabled)

    // Listen for toggle changes
    useEffect(() => {
        const handler = () => setCursorEnabledState(getCursorEnabled())
        window.addEventListener('cursor-setting-changed', handler)
        return () => window.removeEventListener('cursor-setting-changed', handler)
    }, [])

    // Toggle cursor visibility via class + inline style for reliability
    useEffect(() => {
        if (cursorEnabled) {
            document.body.classList.add('custom-cursor-active')
            // Clear any lingering inline cursor styles
            document.documentElement.style.cursor = ''
            document.body.style.cursor = ''
        } else {
            document.body.classList.remove('custom-cursor-active')
            // Force system cursor visible
            document.documentElement.style.cursor = 'auto'
            document.body.style.cursor = 'auto'
        }
    }, [cursorEnabled])

    if (!cursorEnabled) return null

    return <CursorRenderer />
}

function CursorRenderer() {
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 50, stiffness: 1000 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    const [isHovering, setIsHovering] = useState(false)
    const [isTextInput, setIsTextInput] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    // Locked to Emerald color for Aetherius theme
    const primaryColor = 'hsl(158, 64%, 52%)'

    useEffect(() => {
        const updateCursorState = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)

            const isOnVerticalScrollbar = e.clientX > document.documentElement.clientWidth
            const isOnHorizontalScrollbar = e.clientY > document.documentElement.clientHeight

            if (isOnVerticalScrollbar || isOnHorizontalScrollbar) {
                setIsHidden(true)
                return
            } else {
                setIsHidden(false)
            }

            const target = e.target as HTMLElement
            const style = window.getComputedStyle(target)
            const isPointer = style.cursor === 'pointer'

            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                isPointer

            const isInput = target.tagName === 'INPUT'
            const inputType = isInput ? (target as HTMLInputElement).type : ''
            const isTextArea = target.tagName === 'TEXTAREA'
            const isContentEditable = target.isContentEditable || target.getAttribute('contenteditable') === 'true'

            const isText =
                isTextArea ||
                isContentEditable ||
                (isInput &&
                    !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image', 'hidden'].includes(inputType)
                )

            setIsHovering(!!isClickable)
            setIsTextInput(!!isText)
        }

        const handleMouseLeave = () => setIsHidden(true)
        const handleMouseEnter = () => setIsHidden(false)

        window.addEventListener('mousemove', updateCursorState)
        document.addEventListener('mouseleave', handleMouseLeave)
        document.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            window.removeEventListener('mousemove', updateCursorState)
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mouseenter', handleMouseEnter)
        }
    }, [cursorX, cursorY])

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return null
    }

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
                border: isTextInput ? 'none' : '1px solid white',
            }}
            animate={{
                width: isTextInput ? 2 : 32,
                height: isTextInput ? 24 : 32,
                borderRadius: isTextInput ? 1 : 9999,
                backgroundColor: isHovering && !isTextInput
                    ? 'rgba(255, 255, 255, 1)'
                    : (isTextInput ? primaryColor : 'rgba(255, 255, 255, 0)'),
                scale: isHovering && !isTextInput ? 1.5 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8,
            }}
        >
            <motion.div
                className="w-1 h-1 bg-white rounded-full"
                animate={{
                    scale: isHovering && !isTextInput ? 0 : (isTextInput ? 0 : 1)
                }}
            />
        </motion.div>
    )
}
