import { useStoryStore } from "../Store/StoryStore";
import { nextScene } from "../../api/storyApi";

export default function ChoicePanel() {
  const { choices, sessionId, setStory, setLoading, addChoice, isLoading } = useStoryStore();

  const handleChoice = async (index) => {
    setLoading(true);
    addChoice(choices[index]);
    try {
      const data = await nextScene(sessionId, index);
      setStory(data);
    } catch (e) {
      alert("Error fetching next scene.");
      setLoading(false);
    }
  };

  const labels = ["A", "B", "C"];
  return (
    <div className="space-y-3 mt-6">
      <p className="text-gray-400 text-sm uppercase tracking-widest">What do you do?</p>
      {choices.map((choice, i) => (
        <button
          key={i}
          className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 text-white p-4 rounded-lg transition disabled:opacity-40"
          onClick={() => handleChoice(i)}
          disabled={isLoading}
        >
          <span className="text-purple-400 font-bold mr-3">[{labels[i]}]</span>
          {choice}
        </button>
      ))}
    </div>
  );
}