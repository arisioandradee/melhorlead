import React from 'react';
import { Bell, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ resultsCount }) {
    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-end border-b border-border glass px-6">
            <div className="flex items-center gap-2">
                {/* Icons removed per request */}
            </div>
        </header>
    );
}

