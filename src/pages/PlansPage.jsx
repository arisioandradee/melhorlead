import React, { useState, useEffect } from 'react';
import { Check, Rocket, Shield, Crown, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/services/profileService';

const PLANS = [
    {
        id: 'demo',
        name: 'Demo',
        description: 'Ideal para testar a plataforma e descobrir o potencial dos leads.',
        price: 'Grátis',
        limit: '10',
        features: [
            '10 CNPJs por mês',
            'Busca Inteligente (IA)',
            'Filtros Básicos',
            'Exportação manual'
        ],
        icon: Rocket,
        color: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'free',
        name: 'Free',
        description: 'Para pequenos negócios que estão começando sua prospecção.',
        price: 'R$ xx/mês',
        limit: '100',
        features: [
            '100 CNPJs por mês',
            'Busca Inteligente (IA)',
            'Todos os Filtros Avançados',
            'Exportação em Excel',
            'Histórico de buscas'
        ],
        icon: Shield,
        color: 'text-green-400',
        borderColor: 'border-green-500/20',
        bgColor: 'bg-green-500/10',
        popular: true
    },
    {
        id: 'interno',
        displayName: 'Pro',
        name: 'Pro',
        description: 'Potência máxima para escalas industriais de prospecção.',
        price: 'R$ xx/mês',
        limit: '100.000',
        features: [
            '100.000 CNPJs por mês',
            'IA sem limites',
            'Suporte Prioritário',
            'Filtros Exclusivos',
            'API de integração'
        ],
        icon: Crown,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/10'
    }
];

export default function PlansPage() {
    const { user } = useAuth();
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPlan = async () => {
            if (user) {
                try {
                    const profile = await getProfile(user.id);
                    setCurrentPlan(profile?.plan || 'demo');
                } catch (error) {
                    console.error('Error fetching plan:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserPlan();
    }, [user]);

    const handleWhatsApp = (planName) => {
        const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre como mudar meu plano para o ${planName} no MelhorLead.`);
        window.open(`https://wa.me/555195897509?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/10 text-primary text-sm uppercase tracking-widest font-bold">
                        Preços e Planos
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Escolha o plano ideal para seu negócio
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrent = currentPlan === plan.id;
                        const planDisplayName = plan.displayName || plan.name;

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col bg-black/40 backdrop-blur-xl border-white/10 transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 group ${plan.popular ? 'ring-2 ring-primary/50 ring-offset-4 ring-offset-[#0a0a0a]' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-white font-bold px-4 py-1 shadow-lg shadow-primary/20">
                                            MAIS POPULAR
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-8">
                                    <div className={`w-14 h-14 rounded-2xl ${plan.bgColor} border ${plan.borderColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-8 w-8 ${plan.color}`} />
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold">{plan.price}</span>
                                        {plan.price !== 'Consultech' && plan.price !== 'Grátis' && <span className="text-gray-400">/mês</span>}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-4 min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="flex-grow space-y-4">
                                    <div className="py-2 border-y border-white/5 flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Limite de busca</span>
                                        <span className="font-bold text-primary">{plan.limit} CNPJs</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                    <Check className="h-3 w-3 text-primary" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="pt-8">
                                    <Button
                                        className={`w-full h-12 text-base font-bold transition-all duration-300 ${isCurrent
                                            ? 'bg-white/5 text-white/40 cursor-not-allowed border-white/5'
                                            : plan.popular
                                                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                        disabled={isCurrent || loading}
                                        onClick={() => handleWhatsApp(planDisplayName)}
                                    >
                                        {isCurrent ? 'Seu Plano Atual' : 'Mudar para este Plano'}
                                        {!isCurrent && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>


            </div>
        </div>
    );
}
