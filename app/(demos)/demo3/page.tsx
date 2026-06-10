import { SmartLinkPrism } from '@/components/bandstream/landingpages/templates/prism/SmartLinkPrism';
import { demoProps } from '../_mock';

export const dynamic = 'force-static';
export const metadata = { title: 'SmartLink Preview — Prism' };

export default function PrismDemo() {
  return <SmartLinkPrism {...demoProps} />;
}
