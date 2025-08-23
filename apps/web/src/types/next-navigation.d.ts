declare module 'next/navigation' {
  export function useRouter(): {
    push: (href: string, options?: { scroll?: boolean }) => void;
    replace: (href: string, options?: { scroll?: boolean }) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (href: string, options?: { onInvalidate?: () => void }) => void;
  };
  
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}
