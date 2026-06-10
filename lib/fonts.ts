import { Poppins } from 'next/font/google';

/**
 * Police de marque, self-hostée par Next au build (next/font) :
 * plus de @font-face vers des fichiers absents, pas de FOUT,
 * subset automatique et preload du bon fichier.
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-poppins',
});
