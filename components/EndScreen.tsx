
import React from 'react';
import { GameState } from '../types.ts';

interface Props {
  gameState: GameState.VICTORY | GameState.GAME_OVER;
  story: string;
  onPlayAgain: () => void;
}

const EndScreen: React.FC<Props> = ({ gameState, story, onPlayAgain }) => {
  const isVictory = gameState === GameState.VICTORY;

  return (
    <div className="text-center animate-fade-in">
      <h2 className={`text-4xl font-bold mb-4 ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
        {isVictory ? '冒險勝利！' : '遊戲結束'}
      </h2>
      <div className="bg-gray-900/50 p-6 rounded-lg mb-8 border border-gray-700">
        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{story}</p>
      </div>
      <button
        onClick={onPlayAgain}
        className="bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors text-lg"
      >
        再玩一次
      </button>
    </div>
  );
};

export default EndScreen;