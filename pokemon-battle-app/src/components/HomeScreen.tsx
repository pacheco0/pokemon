'use client';

import React from 'react';
import { GameState, REGIONS } from '@/types/pokemon';
import { clearGameState } from '@/utils/gameLogic';

interface HomeScreenProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ gameState, updateGameState }) => {
  const startNewGame = () => {
    updateGameState({ gamePhase: 'pokemon-select' });
  };

  const startFreshGame = () => {
    clearGameState();
    updateGameState({
      playerPokemon: null,
      enemyPokemon: null,
      lastDefeatedPokemon: null,
      wave: 1,
      pokeballs: 5,
      selectedRegion: 'kanto',
      gamePhase: 'region-select',
      capturedPokemon: [],
      chosenStarter: null
    });
  };

  const openPokedex = () => {
    updateGameState({ gamePhase: 'pokedex' });
  };

  // Calculate total discovered Pokemon (captured + chosen starter + all starters available)
  const allStarterIds = Object.values(REGIONS).flatMap(region => 
    region.starters.map(starter => starter.id)
  );
  const totalDiscovered = gameState.capturedPokemon.length + allStarterIds.length + (gameState.chosenStarter && !allStarterIds.includes(gameState.chosenStarter) ? 1 : 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with Pokemon-themed gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce delay-75"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-yellow-300/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-red-400/25 rounded-full animate-bounce delay-150"></div>
        <div className="absolute bottom-32 right-12 w-12 h-12 bg-green-400/30 rounded-full animate-pulse delay-300"></div>
        
        {/* Pokeball decorative elements */}
        <div className="absolute top-20 right-1/4 w-8 h-8 bg-white rounded-full border-4 border-red-500 opacity-70 animate-spin"></div>
        <div className="absolute bottom-40 left-1/3 w-6 h-6 bg-white rounded-full border-3 border-red-500 opacity-60 animate-bounce"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl animate-pulse">
            Pokémon
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-yellow-300 mb-2 drop-shadow-lg">
            Battle Waves
          </h2>
          <p className="text-lg md:text-xl text-white/90 drop-shadow max-w-md mx-auto">
            Choose your starter and battle through endless waves of wild Pokémon!
          </p>
        </div>

        {/* Game stats if there's a saved game */}
        {gameState.playerPokemon && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Continue Your Adventure</h3>
            <div className="flex items-center justify-center space-x-4">
              <img
                src={gameState.playerPokemon.sprites.other['official-artwork'].front_default || gameState.playerPokemon.sprites.front_default}
                alt={gameState.playerPokemon.name}
                className="w-16 h-16 object-contain"
              />
              <div className="text-left text-white">
                <p className="font-bold capitalize">{gameState.playerPokemon.name}</p>
                <p className="text-sm">Level {gameState.playerPokemon.level}</p>
                <p className="text-sm">Wave {gameState.wave}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <button
            onClick={startNewGame}
            className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <span className="relative z-10">
              {gameState.playerPokemon ? 'Continue Adventure' : 'Start Game'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          {gameState.playerPokemon && (
            <button
              onClick={startFreshGame}
              className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="relative z-10">Start Fresh Game</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          )}

          <button
            onClick={openPokedex}
            className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <span className="relative z-10 flex items-center justify-center">
              <span className="mr-2">📖</span>
              Pokédex
              <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded-full">
                {totalDiscovered}
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-white/70 text-sm">
          <p>Catch 'em all and become the ultimate Pokémon trainer!</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen; 