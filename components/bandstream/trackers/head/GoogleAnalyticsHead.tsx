'use client';
import Script from 'next/script'

export default function GoogleAnalyticsHead({GA_MEASUREMENT_ID} : {GA_MEASUREMENT_ID : string}){
    return (
        <>
            <Script
                id="google-analytics-script"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id='google-analytics-head' strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    // Set default consent settings
                    gtag('consent', 'default', {
                        'ad_storage': 'denied',
                        'analytics_storage': 'denied'
                    });
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>
        </>
    )
}