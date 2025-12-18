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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="group relative overflow-hidden glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    {stat.title}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                <stat.icon className={`h-6 w-6 ${stat.textColor} transition-transform duration-300 group-hover:scale-110`} />
                            </div>
                        </div>

                        {/* Subtle bottom accent */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
