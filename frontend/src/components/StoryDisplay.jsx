import { useStoryStore } from "../Store/StoryStore";
import ChoicePanel from "./ChoicePanel";
import EndingScreen from "./EndingScreen";
import CharacterCard from "./CharacterCard";
import SceneImage from "./StoryImage";

export default function StoryDisplay() {
  const { sceneText, sceneNumber, isEnding, isLoading } = useStoryStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex gap-6 p-6">
      <div className="flex-1 max-w-2xl mx-auto space-y-6">
        <div className="text-purple-400 text-sm">Scene {sceneNumber}</div>
        <SceneImage />
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 leading-relaxed text-gray-200 whitespace-pre-wrap min-h-48">
          {isLoading ? (
            <div className="animate-pulse text-gray-500">The story continues...</div>
          ) : sceneText}
        </div>
        {!isEnding && !isLoading && <ChoicePanel />}
        {isEnding && <EndingScreen />}
      </div>
      <CharacterCard />
    </div>
  );
}