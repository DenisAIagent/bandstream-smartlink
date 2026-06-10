import Image from 'next/image';
import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';
import { InstagramIcon, LinkedInIcon, TwitterIcon } from './icons';

interface FooterProps {
  copy: HomeCopy['footer'];
}

export default function Footer({ copy }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.mx}>
        <div className={styles.ftGrid}>
          <div className={styles.ftBrand}>
            <a href="#" className={styles.logo} aria-label="band.stream">
              <Image
                src="/images/home/logo-bandstream-white.png"
                alt="band.stream"
                className={styles.darkOnly}
                width={140}
                height={36}
                unoptimized
              />
              <Image
                src="/images/home/logo-bandstream-black.png"
                alt="band.stream"
                className={styles.lightOnly}
                width={140}
                height={36}
                unoptimized
              />
            </a>
            <p>{copy.brandTagline}</p>
          </div>
          {copy.sections.map((section) => (
            <div key={section.title} className={styles.ftCol}>
              <h5>{section.title}</h5>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.ftBottom}>
          <p>{copy.copyright}</p>
          <div className={styles.ftSocials}>
            <a href="#" aria-label={copy.socialInstagram}><InstagramIcon /></a>
            <a href="#" aria-label={copy.socialLinkedIn}><LinkedInIcon /></a>
            <a href="#" aria-label={copy.socialTwitter}><TwitterIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
