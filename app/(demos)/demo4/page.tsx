import { SmartLinkIvory } from '@/components/bandstream/landingpages/templates/ivory/SmartLinkIvory';
import { demoProps } from '../_mock';

export const dynamic = 'force-static';
export const metadata = { title: 'SmartLink Preview — Ivory' };

export default function IvoryDemo() {
  return <SmartLinkIvory {...demoProps} />;
}
