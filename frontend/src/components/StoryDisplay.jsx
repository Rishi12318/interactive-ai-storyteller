import { useStoryStore } from "../Store/StoryStore";
import ChoicePanel from "./ChoicePanel";
import EndingScreen from "./EndingScreen";
import CharacterCard from "./CharacterCard";
import SceneImage from "./StoryImage";

const STORY_BG = '/collage-abstract-background_53876-113040.avif'

export default function StoryDisplay() {
  const { sceneText, sceneNumber, isEnding, isLoading, imageUrl } = useStoryStore();

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex gap-6 p-6">
      <img src={imageUrl || STORY_BG} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" style={{ filter: imageUrl ? 'blur(12px) brightness(0.3) scale(1.1)' : 'brightness(0.5)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' }} />

      <div className="relative z-10 flex-1 max-w-2xl mx-auto space-y-6">
        <div className="text-sm tracking-widest" style={{ color: '#f5e0b5' }}>Scene {sceneNumber}</div>
        <SceneImage />
        <div className="rounded-xl p-6 leading-relaxed whitespace-pre-wrap min-h-48 backdrop-blur-sm" style={{ background: 'rgba(30,20,12,0.6)', border: '1px solid rgba(196,176,138,0.15)', color: '#f0e0c0' }}>
          {isLoading ? (
            <div className="animate-pulse" style={{ color: '#c4b08a' }}>The story continues...</div>
          ) : sceneText}
        </div>
        {!isEnding && !isLoading && <ChoicePanel />}
        {isEnding && <EndingScreen />}
      </div>
      <CharacterCard />
    </div>
  );
}
