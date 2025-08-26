import React, { useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';
import { StorySegment } from '../types.ts';

interface Props {
  storySegments: StorySegment[];
  choices: string[];
  onChoice: (choice: string) => void;
  isLoading: boolean;
  error: string | null;
}

const GameScreen: React.FC<Props> = ({ storySegments, choices, onChoice, isLoading, error }) => {
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storySegments]);

  return (
    <div className="flex flex-col h-[60vh] max-h-[700px]">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-6 custom-scrollbar">
        {storySegments.map((segment, index) => {
          if (segment.isPlayerChoice) {
            return (
              <div key={index} className="animate-fade-in-slow my-6">
                <p className="text-yellow-400 italic text-lg pl-4 border-l-2 border-yellow-700">
                  {segment.story.substring(1).trim()}
                </p>
              </div>
            );
          }

          return (
            <div key={index} className="animate-fade-in-slow mb-6 space-y-4">
              {segment.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-lg shadow-black/30 min-h-[200px] flex items-end aspect-video">
                  <img src={segment.imageUrl} alt="遊戲場景" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
                  <div className="relative z-20 p-4">
                    <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{segment.story}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{segment.story}</p>
                </div>
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
          <p className="text-gray-400 mt-2">地下城主正在思考並繪製場景...</p>
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
