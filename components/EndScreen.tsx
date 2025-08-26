import React from 'react';
import { GameState, VictoryType } from '../types.ts';

interface Props {
  gameState: GameState.VICTORY | GameState.GAME_OVER;
  story: string;
  onPlayAgain: () => void;
  victoryType: VictoryType | null;
}

const EndScreen: React.FC<Props> = ({ gameState, story, onPlayAgain, victoryType }) => {
  const isVictory = gameState === GameState.VICTORY;

  const getVictoryTitle = () => {
    if (!isVictory) return '遊戲結束';
    switch (victoryType) {
      case VictoryType.BOSS_BATTLE:
        return '英勇的勝利！';
      case VictoryType.TREASURE_HUNT:
        return '滿載而歸！';
      case VictoryType.EPIC_JOURNEY:
        return '傳奇的終點！';
      default:
        return '冒險勝利！';
    }
  };
  
  const getVictorySubtitle = () => {
    if (!isVictory) return null;
     switch (victoryType) {
      case VictoryType.BOSS_BATTLE:
        return '你擊敗了強大的敵人，你的英勇將被世人傳唱。';
      case VictoryType.TREASURE_HUNT:
        return '你找到了失落的寶藏，財富與榮耀盡歸於你！';
      case VictoryType.EPIC_JOURNEY:
        return '你完成了艱辛的旅程，你的事蹟已成為傳說。';
      default:
        return '你成功克服了所有挑戰。';
    }
  }

  return (
    <div className="text-center animate-fade-in">
      <h2 className={`text-4xl font-bold mb-2 ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
        {getVictoryTitle()}
      </h2>
      <p className="text-yellow-300 mb-6 text-lg">{getVictorySubtitle()}</p>
      
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