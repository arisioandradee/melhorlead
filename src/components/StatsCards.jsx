import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, TrendingUp, Clock, Database } from 'lucide-react';

export function StatsCards({ totalResults, searchTime }) {
    const stats = [
        {
            title: 'Total de Resultados',
            value: totalResults.toLocaleString('pt-BR'),
            icon: Database,
            color: 'from-primary to-primary/80',
            bgColor: 'bg-primary/10',
            textColor: 'text-primary'
        },
        {
            title: 'Empresas Ativas',
            value: totalResults > 0 ? Math.floor(totalResults * 0.85).toLocaleString('pt-BR') : '0',
            icon: Building2,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-500'
        },
        {
            title: 'Taxa de Crescimento',
            value: '+12.5%',
            icon: TrendingUp,
            color: 'from-secondary to-purple-600',
            bgColor: 'bg-secondary/10',
            textColor: 'text-secondary'
        },
        {
            title: 'Tempo de Busca',
            value: searchTime ? `${searchTime}s` : '-',
            icon: Clock,
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-500/10',
            textColor: 'text-amber-500'
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 shadow-inner">
                                <stat.icon className={`h-6 w-6 ${stat.textColor} drop-shadow-md`} />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[10px] mb-1">
                                    {stat.title}
                                </p>
                                <div className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                        {/* Decorative background glow */}
                        <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full blur-3xl opacity-10 ${stat.bgColor.replace('/10', '/30')}`} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
