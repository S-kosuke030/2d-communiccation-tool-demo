import Game from '../components/Game';
import VoiceChat from '../components/VoiceChat';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Game />
      <VoiceChat />
    </main>
  );
}
