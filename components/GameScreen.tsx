
import React, { useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

interface Props {
  storyHistory: string[];
  choices: string[];
  onChoice: (choice: string) => void;
  isLoading: boolean;
  error: string | null;
}

const GameScreen: React.FC<Props> = ({ storyHistory, choices, onChoice, isLoading, error }) => {
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  return (
    <div className="flex flex-col h-[60vh] max-h-[700px]">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-6 custom-scrollbar">
        {storyHistory.map((part, index) => {
          const isChoice = part.startsWith('>');
          return (
            <div key={index} className="animate-fade-in-slow mb-4">
              {isChoice ? (
                <p className="text-yellow-400 italic text-lg pl-4 border-l-2 border-yellow-700">
                  {part.substring(1).trim()}
                </p>
              ) : (
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{part}</p>
              )}
            </div>
          );
        })}
        <div ref={storyEndRef} />
      </div>

      {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg mb-4">{error}</div>}

      {isLoading && (
        <div className="text-center p-4">
          <LoadingSpinner />
          <p className="text-gray-400 mt-2">地下城主正在思考...</p>
        </div>
      )}

      {!isLoading && choices.length > 0 && (
        <div className="mt-auto animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-center text-yellow-300">你該怎麼辦？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onChoice(choice)}
                className="w-full bg-gray-700 text-yellow-300 font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 hover:border-yellow-500 border-2 border-transparent transition-all duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;