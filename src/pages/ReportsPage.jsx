import React from 'react';
import { Construction, Sparkles } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl border border-white/10 flex items-center justify-center relative backdrop-blur-xl animate-float">
                        <Construction className="h-16 w-16 text-primary" />
                        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                    Em Construção
                </h1>

                <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed mb-10">
                    Nossa equipe de engenharia está preparando relatórios avançados e insights estratégicos para o seu negócio.
                </p>

                <div className="flex items-center gap-4 p-1 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    </div>
                    <span className="text-sm font-medium text-primary/80 uppercase tracking-widest">Processando Módulos</span>
                </div>
            </main>
        </div>
    );
}
