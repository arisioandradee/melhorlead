import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Phone,
    Building2,
    Lock,
    TrendingUp,
    Save,
    Loader2
} from 'lucide-react';
import {
    getProfile,
    updateProfile,
    getUserStats,
    changePassword
} from '@/services/profileService';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
        loadStats();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;
        setLoading(true);

        const result = await getProfile(user.id);
        if (result.success) {
            setProfile(result.data);
            setFormData({
                full_name: result.data.full_name || '',
                phone: result.data.phone || '',
                company_name: result.data.company_name || ''
            });
        }

        setLoading(false);
    };

    const loadStats = async () => {
        if (!user) return;

        const result = await getUserStats(user.id);
        if (result.success) {
            setStats(result.data);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const result = await updateProfile(user.id, formData);

        if (result.success) {
            setSuccess('Perfil atualizado com sucesso!');
            setProfile(result.data);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error);
        }

        setSaving(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Senha deve ter no mínimo 6 caracteres');
            return;
        }

        setSaving(true);

        const result = await changePassword(passwordData.newPassword);

        if (result.success) {
            setSuccess('Senha alterada com sucesso!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error);
        }

        setSaving(false);
    };

    const getInitials = (name) => {
        if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-6 animate-fade-in-up">
            {/* Header do Perfil */}
            <Card className="glass border-border/50">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                            <AvatarFallback className="text-3xl">
                                {getInitials(profile?.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
                                {profile?.full_name || 'Sem Nome'}
                            </h1>
                            <p className="text-muted-foreground mb-4">{profile?.email}</p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                                    Plano: {profile?.plan?.toUpperCase() || 'FREE'}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium">
                                    {profile?.searches_used || 0}/{profile?.search_quota || 10} buscas
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        {stats && (
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-primary">{stats.totalSearches}</div>
                                    <div className="text-xs text-muted-foreground">Total Buscas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-secondary">{stats.monthSearches}</div>
                                    <div className="text-xs text-muted-foreground">Este Mês</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-accent">{stats.savedCompanies}</div>
                                    <div className="text-xs text-muted-foreground">Salvos</div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Messages */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 animate-fade-in">
                    {success}
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
                    <TabsTrigger value="dados" className="gap-2">
                        <User className="h-4 w-4" />
                        Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value="seguranca" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Segurança
                    </TabsTrigger>
                    <TabsTrigger value="plano" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Plano
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Dados Pessoais */}
                <TabsContent value="dados">
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="full_name" className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            Nome Completo
                                        </Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                                            placeholder="Seu nome"
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            Telefone
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="company_name" className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Empresa
                                    </Label>
                                    <Input
                                        id="company_name"
                                        value={formData.company_name}
                                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                                        placeholder="Nome da sua empresa"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-primary" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        value={profile?.email}
                                        disabled
                                        className="h-12 bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email não pode ser alterado
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full md:w-auto gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Segurança */}
                <TabsContent value="seguranca">
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle>Alterar Senha</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Mínimo 6 caracteres"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Digite novamente"
                                        className="h-12"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full md:w-auto gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Alterando...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4" />
                                            Alterar Senha
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Plano */}
                <TabsContent value="plano">
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle>Plano Atual: {profile?.plan?.toUpperCase() || 'FREE'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg glass border border-border/50">
                                    <h3 className="font-semibold mb-2">Quota Mensal</h3>
                                    <p className="text-2xl font-bold text-primary">
                                        {profile?.search_quota || 10}
                                    </p>
                                    <p className="text-xs text-muted-foreground">buscas por mês</p>
                                </div>

                                <div className="p-4 rounded-lg glass border border-border/50">
                                    <h3 className="font-semibold mb-2">Utilizadas</h3>
                                    <p className="text-2xl font-bold text-secondary">
                                        {profile?.searches_used || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">este mês</p>
                                </div>

                                <div className="p-4 rounded-lg glass border border-border/50">
                                    <h3 className="font-semibold mb-2">Disponíveis</h3>
                                    <p className="text-2xl font-bold text-accent">
                                        {(profile?.search_quota || 10) - (profile?.searches_used || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">restantes</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                                <h3 className="text-lg font-semibold mb-2">Upgrade para Pro</h3>
                                <p className="text-muted-foreground mb-4">
                                    Desbloqueie recursos premium e aumente seu limite de buscas!
                                </p>
                                <Button className="gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Ver Planos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
