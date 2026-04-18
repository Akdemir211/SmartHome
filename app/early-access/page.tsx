import { ParallaxBackground } from '@/components/early-access/parallax-background';
import { EarlyAccessSpaceScene } from '@/components/early-access/early-access-space-scene';
import { EarlyAccessForm } from '@/components/early-access/early-access-form';

const BACKGROUND_IMAGE = '/early-access-bg.jpg';

export default function EarlyAccessPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#02040a]">
      <ParallaxBackground imageSrc={BACKGROUND_IMAGE}>
        <EarlyAccessSpaceScene />
        <EarlyAccessForm />
      </ParallaxBackground>
    </main>
  );
}
