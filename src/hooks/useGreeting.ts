import { useMemo } from 'react';

export function useGreeting(name: string) {
    return useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 6) return `The stars align for you, ${name}`;
        if (hour < 12) return `Good morning, ${name}`;
        if (hour < 17) return `Good afternoon, ${name}`;
        if (hour < 21) return `Good evening, ${name}`;
        return `The moon watches over you, ${name}`;
    }, [name]);
}
