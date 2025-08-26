
import React, { useState, useCallback } from 'react';
import { GameState, Character } from './types.ts';
import { getInitialStory, getNextStoryPart } from './services/geminiService.ts';
import CharacterCreationScreen from './components/CharacterCreationScreen.tsx';
import GameScreen from './components/GameScreen.tsx';
import EndScreen from './components/EndScreen.tsx';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.CHARACTER_CREATION);
  const [character, setCharacter] = useState<Character | null>(null);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCharacterCreate = useCallback(async (newCharacter: Character) => {
    setCharacter(newCharacter);
    setIsLoading(true);
    setError(null);
    try {
      const initialSegment = await getInitialStory(newCharacter);
      setStoryHistory([initialSegment.story]);
      setCurrentChoices(initialSegment.choices);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('無法開始新的冒險。請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChoice = useCallback(async (choice: string) => {
    if (!character) {
        setError("錯誤：找不到角色資訊。");
        return;
    }
    setIsLoading(true);
    setError(null);
    const currentHistory = [...storyHistory, `> ${choice}`];
    
    try {
      const nextSegment = await getNextStoryPart(character, currentHistory, choice);
      setStoryHistory([...currentHistory, nextSegment.story]);
      
      if (nextSegment.outcome === 'victory') {
        setGameState(GameState.VICTORY);
      } else if (nextSegment.outcome === 'game_over') {
        setGameState(GameState.GAME_OVER);
      } else {
        setCurrentChoices(nextSegment.choices);
      }
    } catch (err) {
      setError('故事無法繼續。請重新整理頁面再試一次。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [character, storyHistory]);

  const handlePlayAgain = useCallback(() => {
    setGameState(GameState.CHARACTER_CREATION);
    setCharacter(null);
    setStoryHistory([]);
    setCurrentChoices([]);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen onCharacterCreate={handleCharacterCreate} isLoading={isLoading} />;
      case GameState.PLAYING:
        return (
          <GameScreen
            storyHistory={storyHistory}
            choices={currentChoices}
            onChoice={handleChoice}
            isLoading={isLoading}
            error={error}
          />
        );
      case GameState.VICTORY:
      case GameState.GAME_OVER:
        return (
          <EndScreen
            gameState={gameState}
            story={storyHistory[storyHistory.length-1]}
            onPlayAgain={handlePlayAgain}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-wider">龍與地下城</h1>
          <p className="text-lg text-gray-400">AI 地下城主文字冒險</p>
        </header>
        <main className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-black/30 p-6 md:p-8 border border-gray-700">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;