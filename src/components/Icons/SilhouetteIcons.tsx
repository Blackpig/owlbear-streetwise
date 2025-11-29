// Simple character silhouette icon

export const CharacterSilhouetteIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="100" cy="75" r="40" fill="currentColor" opacity="0.15"/>

    {/* Shoulders/Torso */}
    <path
      d="M 50 200 Q 50 140 60 130 Q 70 120 85 120 Q 92 115 100 115 Q 108 115 115 120 Q 130 120 140 130 Q 150 140 150 200 Z"
      fill="currentColor"
      opacity="0.15"
    />
  </svg>
);
