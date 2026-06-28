import { useStoryStore } from "../Store/StoryStore";

export default function EndingScreen() {
  const { sceneNumber, choiceHistory, resetStory } = useStoryStore();
  return (
    <div className="bg-gray-900 border border-purple-800 rounded-xl p-6 space-y-4 text-center">
      <p className="text-2xl">🎭 The End</p>
      <p className="text-gray-400">You completed your story in {sceneNumber} scenes.</p>
      <div className="text-left space-y-1">
        <p className="text-gray-500 text-xs uppercase">Your journey:</p>
        {choiceHistory.map((c, i) => (
          <p key={i} className="text-gray-400 text-sm">• {c}</p>
        ))}
      </div>
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
        onClick={resetStory}
      >
        Start a New Story
      </button>
    </div>
  );
}