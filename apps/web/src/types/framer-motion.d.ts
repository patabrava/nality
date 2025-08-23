declare module 'framer-motion' {
  import { ReactNode } from 'react';
  
  interface AnimatePresenceProps {
    children?: ReactNode;
    initial?: boolean;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    presenceAffectsLayout?: boolean;
    mode?: 'sync' | 'popLayout' | 'wait';
    custom?: unknown;
    propagate?: boolean;
    anchorX?: string | number;
    root?: Element;
  }
  
  export function AnimatePresence(props: AnimatePresenceProps): ReactNode;
  
  export { motion } from 'framer-motion';
}
