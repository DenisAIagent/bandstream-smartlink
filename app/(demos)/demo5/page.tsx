import { SmartLinkCarbon } from '@/components/bandstream/landingpages/templates/carbon/SmartLinkCarbon';
import { demoProps } from '../_mock';

export const dynamic = 'force-static';
export const metadata = { title: 'SmartLink Preview — Carbon' };

export default function CarbonDemo() {
  return <SmartLinkCarbon {...demoProps} />;
}
