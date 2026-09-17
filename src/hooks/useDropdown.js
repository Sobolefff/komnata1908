import { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from './useOnClickOutside';

export function useDropdown() {
    const ref = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = useCallback((e) => {
        e.preventDefault();
        setIsOpen((open) => !open);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    useOnClickOutside(ref, close);

    return { ref, isOpen, toggle, close };
}
