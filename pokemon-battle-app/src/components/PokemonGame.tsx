'use client';

import React, { useState, useEffect } from 'react';
import { GameState, PlayerPokemon } from '@/types/pokemon';
import { saveGameState, loadGameState } from '@/utils/gameLogic';
import RegionSelect from './RegionSelect';
import StarterSelect from './StarterSelect';
import BattleScreen from './BattleScreen';
import VictoryScreen from './VictoryScreen';
import DefeatScreen from './DefeatScreen';
import CaptureScreen from './CaptureScreen';

const PokemonGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPokemon: null,
    enemyPokemon: null,
    lastDefeatedPokemon: null,
    wave: 1,
    pokeballs: 5,
    selectedRegion: 'kanto',
    gamePhase: 'region-select'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved game state on component mount
    const savedState = loadGameState();
    if (savedState) {
      setGameState(savedState);
    }
  }, []);

  useEffect(() => {
    // Save game state whenever it changes
    saveGameState(gameState);
  }, [gameState]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const resetGame = () => {
    setGameState({
      playerPokemon: null,
      enemyPokemon: null,
      lastDefeatedPokemon: null,
      wave: 1,
      pokeballs: 5,
      selectedRegion: 'kanto',
      gamePhase: 'region-select'
    });
  };

  const renderCurrentPhase = () => {
    switch (gameState.gamePhase) {
      case 'region-select':
        return (
          <RegionSelect
            selectedRegion={gameState.selectedRegion}
            onRegionSelect={(region: 'kanto' | 'johto' | 'hoenn' | 'sinnoh') => updateGameState({ selectedRegion: region, gamePhase: 'starter-select' })}
          />
        );
      
      case 'starter-select':
        return (
          <StarterSelect
            selectedRegion={gameState.selectedRegion}
            onStarterSelect={(pokemon: PlayerPokemon) => updateGameState({ playerPokemon: pokemon, gamePhase: 'battle' })}
            loading={loading}
            setLoading={setLoading}
          />
        );
      
      case 'battle':
        return (
          <BattleScreen
            gameState={gameState}
            updateGameState={updateGameState}
            loading={loading}
            setLoading={setLoading}
          />
        );
      
      case 'victory':
        return (
          <VictoryScreen
            gameState={gameState}
            updateGameState={updateGameState}
            loading={loading}
            setLoading={setLoading}
          />
        );
      
      case 'defeat':
        return (
          <DefeatScreen
            gameState={gameState}
            updateGameState={updateGameState}
            onRestart={resetGame}
          />
        );
      
      case 'capture':
        return (
          <CaptureScreen
            gameState={gameState}
            updateGameState={updateGameState}
            loading={loading}
            setLoading={setLoading}
          />
        );
      
      default:
        return <div>Unknown game phase</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            Pokémon Battle Waves
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Choose your starter and battle through endless waves!
          </p>
        </header>
        
        {renderCurrentPhase()}
      </div>
    </div>
  );
};

export default PokemonGame; 