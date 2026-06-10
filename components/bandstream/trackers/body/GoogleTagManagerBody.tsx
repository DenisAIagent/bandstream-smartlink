'use client';

export default function GoogleTagManagerBody({ GTM_ID }: { GTM_ID: string }) {
    return (
        <noscript>
            <iframe 
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0" 
                width="0" 
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    );
}