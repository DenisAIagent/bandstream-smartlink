import { SmartLinkObsidian } from '@/components/bandstream/landingpages/templates/obsidian/SmartLinkObsidian';
import { demoProps } from '../_mock';

export const dynamic = 'force-static';
export const metadata = { title: 'SmartLink Preview — Obsidian' };

export default function ObsidianDemo() {
  return <SmartLinkObsidian {...demoProps} />;
}
