import { AssistantExperience } from '@/components/assistant/assistant-experience';

export default function HomePage() {
  return (
    <main className="h-screen w-screen bg-navy-deep">
      <div className="relative w-full h-full bg-black/[0.96] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jarvis-purple/20 via-transparent to-jarvis-violet/10 pointer-events-none" />
        <AssistantExperience />
      </div>
    </main>
  );
}
