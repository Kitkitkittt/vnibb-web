import '@testing-library/jest-dom'
import type { ComponentProps, ReactNode } from 'react';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: ComponentProps<'div'>) => <div { ...props } > { children } </div>,
    h1: ({ children, ...props }: ComponentProps<'h1'>) => <h1 { ...props } > { children } </h1>,
    h2: ({ children, ...props }: ComponentProps<'h2'>) => <h2 { ...props } > { children } </h2>,
    span: ({ children, ...props }: ComponentProps<'span'>) => <span { ...props } > { children } </span>,
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{ children } </>,
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))
