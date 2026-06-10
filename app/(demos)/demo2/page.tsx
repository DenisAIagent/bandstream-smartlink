import { SmartLinkOnyx } from '@/components/bandstream/landingpages/templates/onyx/SmartLinkOnyx';
import { demoProps } from '../_mock';

export const dynamic = 'force-static';
export const metadata = { title: 'SmartLink Preview — Onyx' };

export default function OnyxDemo() {
  return <SmartLinkOnyx {...demoProps} />;
}
