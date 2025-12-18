import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Home,
    Search,
    Building2,
    History,
    User,
    LogOut,
    ChevronRight,
    FileSpreadsheet
} from 'lucide-react';
import Logo from '@/assets/logoDibai.png';

export function Sidebar() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const menuItems = [
        {
            to: '/',
            icon: Search,
            label: 'Busca Avançada',
            exact: true
        },
        {
            to: '/relatorios',
            icon: FileSpreadsheet,
            label: 'Relatórios'
        },
        {
            to: '/history',
            icon: History,
            label: 'Histórico'
        }
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-20 items-center gap-3 px-6 animate-fade-in">
                    <div className="flex h-10 w-10 items-center justify-center">
                        <img src={Logo} alt="Logo" className="h-full w-full object-contain filter drop-shadow-sm" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient-primary">Melhor Lead</h1>
                        <p className="text-xs text-muted-foreground">Prospecção B2B Inteligente</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group animate-fade-in-right ${isActive
                                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`
                            }
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group mt-4"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="h-5 w-5" />
                            Sair
                        </div>
                    </button>
                </nav>

                {/* User Footer */}
                <div className="border-t border-border p-4 animate-fade-in">
                    <NavLink
                        to="/profile"
                        className="flex items-center gap-3 rounded-lg glass p-3 hover:bg-muted/50 transition-all group cursor-pointer"
                    >
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback>
                                {getInitials(profile?.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {profile?.plan || 'free'} Plan
                            </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                </div>
            </div>
        </aside>
    );
}

