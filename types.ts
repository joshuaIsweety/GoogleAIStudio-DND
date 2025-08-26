export enum CharacterClass {
  WARRIOR = '戰士',
  MAGE = '法師',
  ROGUE = '盜賊',
}

export interface Character {
  name: string;
  characterClass: CharacterClass;
}

export enum GameState {
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export type StoryOutcome = 'continue' | 'victory' | 'game_over';

export enum VictoryType {
  BOSS_BATTLE = 'BOSS_BATTLE',
  TREASURE_HUNT = 'TREASURE_HUNT',
  EPIC_JOURNEY = 'EPIC_JOURNEY',
}

export interface StorySegment {
  story: string;
  choices: string[];
  outcome: StoryOutcome;
  victoryType?: VictoryType;
  imageUrl?: string;
  isPlayerChoice?: boolean;
}