import React from 'react';
import { Bell, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ resultsCount }) {
    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border glass px-6">
            <div>
                {/* Title removed */}
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <HelpCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}

