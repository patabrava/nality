declare module 'framer-motion' {
  import { ReactNode, JSX } from 'react';
  
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
  
  export function AnimatePresence(props: AnimatePresenceProps): JSX.Element;
  
  export { motion } from 'framer-motion';
}
