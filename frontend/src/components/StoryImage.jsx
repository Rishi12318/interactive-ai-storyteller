import { useState, useEffect } from "react";
import { useStoryStore } from "../Store/StoryStore";

export default function SceneImage() {
  const { imageUrl, sceneNumber } = useStoryStore();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset loaded/error state every time the imageUrl changes (new scene)
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden mb-6"
      style={{ aspectRatio: "16/9", minHeight: "180px", background: "#111827" }}
    >
      {/* Skeleton while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs animate-pulse">
            Painting scene {sceneNumber}...
          </p>
        </div>
      )}

      {/* Actual image — always rendered so the browser starts loading immediately */}
      <img
        key={imageUrl}
        src={imageUrl}
        alt={`Scene ${sceneNumber} illustration`}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />

      {/* Fallback if Pollinations fails */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <span className="text-gray-500 text-sm">Scene {sceneNumber}</span>
        </div>
      )}

      {/* Scene number badge — only once image is visible */}
      {loaded && (
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          Scene {sceneNumber}
        </div>
      )}
    </div>
  );
}