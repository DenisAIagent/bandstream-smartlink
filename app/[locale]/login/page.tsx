'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { FcGoogle } from 'react-icons/fc'; 
import Image from 'next/image';
import { useSession } from "next-auth/react";
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  // const [randomImageNumber, setRandomImageNumber] = useState(1);
  const { data: session } = useSession();
  const t = useTranslations('common');
  const tl = useTranslations('login');

  useEffect(() => {
    // setRandomImageNumber(Math.floor(Math.random() * 16) + 1);

    const checkAuth = async () => {
      try {
        if (session) {
          setIsRedirecting(true);
          window.location.href = '/admin';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [session]);

  if (isRedirecting) {
    return null;
  }

  // const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   //const email = (event.currentTarget as HTMLFormElement).email.value;
  //   // Call your API to handle email login and account creation
  // };  

  return (
    <>
    <div className="flex justify-center items-center h-screen bg-black">
    <div className="w-1/2 h-screen hidden lg:block">
      <Image 
        // src={`/images/accounts/band${randomImageNumber}.jpg` }
        src={`/images/accounts/band2.jpg` }
        alt=""
        width={1000}
        height={1000}
        className="object-cover w-full h-full" 
      />
    </div>
    <div className= "lg:p-28 md:p-44 sm:p-10 p-8 w-full lg:w-1/2">
      <h1 className="text-2xl font-semibold mb-4">{t('login')}</h1>
      <Card className="w-full">
        <CardHeader>
          <h2 className="text-3xl font-semibold text-center">{t('welcome')}</h2>
          {/* <p className="text-muted-foreground text-center">{t('loginhint')}</p> */}
          <p className="text-muted-foreground text-center">{tl('invited_only')}</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orcontinuewith')}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signIn('google')} 
            className="w-full"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {tl('no_access')}{' '}
            <Link href="/#cta" className="underline hover:text-foreground">
              {tl('join_alpha')}
            </Link>
          </p>
          {/* <Button 
            variant="outline" 
            onClick={() => signIn('apple')} 
            className="w-full bg-black text-white hover:bg-black/90"
          >
            <FaApple className="mr-2 h-4 w-4" />
            Apple
          </Button> */}
        </CardFooter>
      </Card>
      </div>
    </div>
    </>
  );
}