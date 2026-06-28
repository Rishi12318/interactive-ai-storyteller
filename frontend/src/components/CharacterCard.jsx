import { useStoryStore } from "../Store/StoryStore";

const getCharacterImageUrl = (char) => {
  const prompt = encodeURIComponent(
    `Portrait of ${char.name}, ${char.description}, fantasy art, detailed face, dramatic lighting`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=200&height=200&nologo=true`;
};

export default function CharacterCard() {
  const { characters } = useStoryStore();
  return (
    <div className="w-64 space-y-3 hidden lg:block">
      <p className="text-gray-500 text-xs uppercase tracking-widest">Characters</p>
      {Object.entries(characters).map(([key, char]) => (
        <div key={key} className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-1">
          <img
            src={getCharacterImageUrl(char)}
            alt={char.name}
            className="w-12 h-12 rounded-full object-cover mb-2"
            onError={(e) => (e.target.style.display = "none")}
          />
          <p className="font-semibold text-purple-300">{char.name}</p>
          <p className="text-gray-400 text-xs">{char.description}</p>
          {char.relationship && <p className="text-gray-600 text-xs italic">{char.relationship}</p>}
        </div>
      ))}
    </div>
  );
}