import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Logo from '@/assets/logoDibai.png';
import { translateAuthError } from '@/utils/authErrors';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setError(translateAuthError(error.message));
        setLoading(false);
      } else if (data?.user) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Erro desconhecido ao criar conta.');
        setLoading(false);
      }
    } catch (err) {
      setError(`Erro inesperado: ${err.message}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <Card className="w-full max-w-md relative glass shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-500">
              Conta criada com sucesso!
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Redirecionando para o login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background pointer-events-none" />
      <Card className="w-full max-w-md relative glass shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center mb-4">
              <img src={Logo} alt="Logo Dibai" className="h-full w-full object-contain filter drop-shadow-lg" />
            </div>
            <h1 className="text-xl font-bold text-center text-white mb-1">Melhor Lead</h1>
            <p className="text-sm text-muted-foreground text-center">Prospecção B2B Inteligente</p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-6 opacity-50" />

          <CardTitle className="text-2xl font-bold text-gradient-primary">Criar nova conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
