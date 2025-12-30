import React from 'react';
import {
    TreePine,
    Sunrise,
    BookOpen,
    Target,
    Heart,
    Sparkles,
    type LucideProps
} from 'lucide-react';

interface ChapterIconProps extends LucideProps {
    name: string;
}

export function ChapterIcon({ name, ...props }: ChapterIconProps) {
    switch (name) {
        case 'TreePine':
            return <TreePine {...props} />;
        case 'Sunrise':
            return <Sunrise {...props} />;
        case 'BookOpen':
            return <BookOpen {...props} />;
        case 'Target':
            return <Target {...props} />;
        case 'Heart':
            return <Heart {...props} />;
        case 'Sparkles':
            return <Sparkles {...props} />;
        default:
            return null;
    }
}
