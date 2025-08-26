
import React, { useState } from 'react';
import { Character, CharacterClass } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface Props {
  onCharacterCreate: (character: Character) => void;
  isLoading: boolean;
}

const CharacterCreationScreen: React.FC<Props> = ({ onCharacterCreate, isLoading }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass>(CharacterClass.WARRIOR);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入你的角色名稱。');
      return;
    }
    setError('');
    onCharacterCreate({ name, characterClass });
  };

  const classOptions = [
    { class: CharacterClass.WARRIOR, description: "精通各種武器，是戰場上的勇者。" },
    { class: CharacterClass.MAGE, description: "操控強大法術，用智慧扭轉戰局。" },
    { class: CharacterClass.ROGUE, description: "潛行於陰影之中，擅長偵察與奇襲。" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-yellow-300">創建你的英雄</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-lg text-gray-300">角色名稱</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
            placeholder="例如：亞拉岡"
            disabled={isLoading}
          />
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>

        <div className="mb-8">
          <label className="block mb-4 text-lg text-gray-300">選擇職業</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classOptions.map(option => (
              <div
                key={option.class}
                onClick={() => !isLoading && setCharacterClass(option.class)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  characterClass === option.class
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                    : 'border-gray-600 hover:border-yellow-600 hover:bg-gray-700/50'
                }`}
              >
                <h3 className="text-xl font-bold text-yellow-400">{option.class}</h3>
                <p className="text-gray-400 mt-1 text-sm">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-3 bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {isLoading ? <><LoadingSpinner /> 正在生成世界...</> : '開始冒險'}
        </button>
      </form>
    </div>
  );
};

export default CharacterCreationScreen;