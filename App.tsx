import React, { useState, useCallback } from 'react';
import { GameState, Character, StorySegment, VictoryType } from './types.ts';
import { getInitialStory, getNextStoryPart, generateImageForStory } from './services/geminiService.ts';
import CharacterCreationScreen from './components/CharacterCreationScreen.tsx';
import GameScreen from './components/GameScreen.tsx';
import EndScreen from './components/EndScreen.tsx';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.CHARACTER_CREATION);
  const [character, setCharacter] = useState<Character | null>(null);
  const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [victoryType, setVictoryType] = useState<VictoryType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCharacterCreate = useCallback(async (newCharacter: Character) => {
    setCharacter(newCharacter);
    setIsLoading(true);
    setError(null);
    setStorySegments([]);
    setVictoryType(null);
    try {
      const initialTextSegment = await getInitialStory(newCharacter);
      const imageUrl = await generateImageForStory(initialTextSegment.story);
      
      const fullSegment: StorySegment = { ...initialTextSegment, imageUrl, isPlayerChoice: false };

      setStorySegments([fullSegment]);
      setCurrentChoices(initialTextSegment.choices);
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

    const choiceSegment: StorySegment = {
      story: `> ${choice}`,
      choices: [],
      outcome: 'continue',
      isPlayerChoice: true,
    };
    
    const historyForAI = [...storySegments, choiceSegment].map(s => s.story);
    setStorySegments(prev => [...prev, choiceSegment]);
    
    try {
      const nextTextSegment = await getNextStoryPart(character, historyForAI, choice);
      
      let imageUrl: string | undefined;
      if (nextTextSegment.story && (nextTextSegment.outcome === 'continue' || nextTextSegment.choices.length > 0)) {
        imageUrl = await generateImageForStory(nextTextSegment.story);
      }
      
      const fullNextSegment: StorySegment = { ...nextTextSegment, imageUrl, isPlayerChoice: false };
      
      setStorySegments(prev => [...prev, fullNextSegment]);
      
      if (fullNextSegment.outcome === 'victory') {
        setGameState(GameState.VICTORY);
        setVictoryType(fullNextSegment.victoryType || null);
      } else if (fullNextSegment.outcome === 'game_over') {
        setGameState(GameState.GAME_OVER);
      } else {
        setCurrentChoices(fullNextSegment.choices);
      }
    } catch (err) {
      setError('故事無法繼續。請重新整理頁面再試一次。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [character, storySegments]);

  const handlePlayAgain = useCallback(() => {
    setGameState(GameState.CHARACTER_CREATION);
    setCharacter(null);
    setStorySegments([]);
    setCurrentChoices([]);
    setVictoryType(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen onCharacterCreate={handleCharacterCreate} isLoading={isLoading} />;
      case GameState.PLAYING:
        return (
          <GameScreen
            storySegments={storySegments}
            choices={currentChoices}
            onChoice={handleChoice}
            isLoading={isLoading}
            error={error}
          />
        );
      case GameState.VICTORY:
      case GameState.GAME_OVER:
        const lastStory = storySegments.filter(s => !s.isPlayerChoice).pop()?.story || "冒險結束了。";
        return (
          <EndScreen
            gameState={gameState}
            story={lastStory}
            onPlayAgain={handlePlayAgain}
            victoryType={victoryType}
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