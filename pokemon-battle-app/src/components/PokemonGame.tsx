'use client';

import React, { useState, useEffect } from 'react';
import { GameState, PlayerPokemon } from '@/types/pokemon';
import { saveGameState, loadGameState } from '@/utils/gameLogic';
import HomeScreen from './HomeScreen';
import PokemonSelect from './PokemonSelect';
import RegionSelect from './RegionSelect';
import StarterSelect from './StarterSelect';
import BattleScreen from './BattleScreen';
import VictoryScreen from './VictoryScreen';
import DefeatScreen from './DefeatScreen';
import CaptureScreen from './CaptureScreen';
import Pokedex from './Pokedex';

const PokemonGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPokemon: null,
    enemyPokemon: null,
    lastDefeatedPokemon: null,
    wave: 1,
    pokeballs: 5,
    selectedRegion: 'kanto',
    gamePhase: 'home',
    capturedPokemon: [],
    chosenStarter: null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved game state on component mount
    const savedState = loadGameState();
    if (savedState) {
      // Ensure backward compatibility with older saves
      let updatedState = {
        ...savedState,
        capturedPokemon: savedState.capturedPokemon || [],
        chosenStarter: savedState.chosenStarter || null,
        gamePhase: savedState.gamePhase === 'region-select' ? 'home' : savedState.gamePhase
      };

      // If there's no active pokemon and the user is not in home/pokedex, go back to home
      // This ensures a clean startup experience
      if (!savedState.playerPokemon && 
          savedState.gamePhase !== 'home' && 
          savedState.gamePhase !== 'pokedex') {
        updatedState.gamePhase = 'home';
      }

      setGameState(updatedState);
    }
  }, []);

  useEffect(() => {
    // Save game state whenever it changes
    saveGameState(gameState);
  }, [gameState]);

  const updateGameState = (updates: Partial<GameState>) => {
    console.log('=== UPDATE GAME STATE ===');
    console.log('Current captured Pokemon:', gameState.capturedPokemon);
    console.log('Updates being applied:', updates);
    
    const newState = { ...gameState, ...updates };
    console.log('New captured Pokemon after update:', newState.capturedPokemon);
    
    setGameState(newState);
  };

  const resetGame = () => {
    setGameState({
      playerPokemon: null,
      enemyPokemon: null,
      lastDefeatedPokemon: null,
      wave: 1,
      pokeballs: 5,
      selectedRegion: 'kanto',
      gamePhase: 'home',
      capturedPokemon: [],
      chosenStarter: null
    });
  };

  const renderCurrentPhase = () => {
    switch (gameState.gamePhase) {
      case 'home':
        return (
          <HomeScreen
            gameState={gameState}
            updateGameState={updateGameState}
          />
        );
      
      case 'pokemon-select':
        return (
          <PokemonSelect
            gameState={gameState}
            updateGameState={updateGameState}
            loading={loading}
            setLoading={setLoading}
          />
        );
      
      case 'region-select':
        return (
          <RegionSelect
            selectedRegion={gameState.selectedRegion}
            onRegionSelect={(region: 'kanto' | 'johto' | 'hoenn' | 'sinnoh') => updateGameState({ selectedRegion: region, gamePhase: 'starter-select' })}
            onBackToHome={() => updateGameState({ gamePhase: 'home' })}
          />
        );
      
      case 'starter-select':
        return (
          <StarterSelect
            selectedRegion={gameState.selectedRegion}
            onStarterSelect={(pokemon: PlayerPokemon) => {
              updateGameState({ 
                playerPokemon: pokemon, 
                gamePhase: 'battle',
                chosenStarter: pokemon.id
              });
            }}
            loading={loading}
            setLoading={setLoading}
            onBackToHome={() => updateGameState({ gamePhase: 'region-select' })}
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
      
      case 'pokedex':
        return (
          <Pokedex
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

  // Only show background for non-home phases
  if (gameState.gamePhase === 'home' || gameState.gamePhase === 'pokedex' || gameState.gamePhase === 'pokemon-select') {
    return renderCurrentPhase();
  }

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