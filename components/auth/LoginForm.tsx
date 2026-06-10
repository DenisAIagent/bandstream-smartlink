import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { createToken } from '@/lib/actions/auth-create-token';

export default function LoginForm() {
  const t = useTranslations('login');
  const [showToken, setShowToken] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const emailValue = formData.get('email')?.toString();
      
      setEmail(emailValue || '');
      await createToken(emailValue || '');
      setShowToken(true);
      
      // Focus the token input field when it appears
      setTimeout(() => {
        const tokenInput = document.querySelector('input[name="token"]');
        if (tokenInput instanceof HTMLInputElement) {
          tokenInput.focus();
        }
      }, 0);
    } catch {
      setError(t('not_invited'));
      setShowToken(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTokenSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const token = formData.get('token')?.toString();
      
      const result = await signIn("credentials", {
        email: email,
        authCode: token,
        redirect: true
      });

      if (result?.error) {
        console.error('Authentication failed:', result.error);
        throw new Error(result.error);
      }
    } catch {
      console.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <p className="text-sm text-muted-foreground text-center">
          {!showToken 
            ? t('email_hint')
            : t('code_hint')
          }
        </p>
        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!showToken ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              {t('continue_email')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                key="token-input"
                type="text"
                name="token"
                placeholder="000000"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="off"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2">{t('verifying')}</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                t('verify_signin')
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {showToken && (
          <Button
            variant="link"
            type="button"
            onClick={() => setShowToken(false)}
            className="text-sm text-muted-foreground"
          >
            {t('different_email')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}