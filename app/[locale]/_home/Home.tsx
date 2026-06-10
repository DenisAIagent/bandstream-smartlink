import type { HomeLocale } from './content/types';
import { fr } from './content/fr';
import { en } from './content/en';
import HomeClient from './HomeClient';
import Hero from './sections/Hero';
import PlatformsStrip from './sections/PlatformsStrip';
import Steps from './sections/Steps';
import Features from './sections/Features';
import Smartlinks from './sections/Smartlinks';
import Manifesto from './sections/Manifesto';
import Compare from './sections/Compare';
import Pricing from './sections/Pricing';
import CtaBig from './sections/CtaBig';
import Faq from './sections/Faq';
import Footer from './sections/Footer';

interface HomeProps {
  locale: HomeLocale;
}

/**
 * Root of the band.stream landing home. Server component that selects the
 * locale copy and composes all sections. Only the interactive bits (nav,
 * phone carousel, form, counter, theme toggle, reveal observer) are client.
 */
export default function Home({ locale }: HomeProps) {
  const copy = locale === 'en' ? en : fr;

  return (
    <HomeClient copy={copy}>
      <Hero copy={copy.hero} />
      <PlatformsStrip copy={copy.platformsStrip} />
      <Steps copy={copy.steps} />
      <Features copy={copy.features} />
      <Smartlinks copy={copy.smartlinks} />
      <Manifesto copy={copy.manifesto} />
      <Compare copy={copy.compare} />
      <Pricing copy={copy.pricing} />
      <Faq copy={copy.faq} />
      <CtaBig copy={copy.ctaBig} locale={locale} />
      <Footer copy={copy.footer} />
    </HomeClient>
  );
}
