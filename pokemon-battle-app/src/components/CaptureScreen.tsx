'use client';

import React, { useState } from 'react';
import { GameState } from '@/types/pokemon';
import { createPlayerPokemon } from '@/utils/gameLogic';

interface CaptureScreenProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ 
  gameState, 
  updateGameState, 
  loading, 
  setLoading 
}) => {
  const [captureComplete, setCaptureComplete] = useState(false);

  const handleCapture = async () => {
    if (!gameState.lastDefeatedPokemon || gameState.pokeballs <= 0) return;
    
    setLoading(true);
    try {
      // Create player Pokemon from captured defeated Pokemon
      const capturedPokemon = await createPlayerPokemon(
        gameState.lastDefeatedPokemon, 
        (gameState.lastDefeatedPokemon as any).level || 5
      );
      
      // Add the captured Pokemon ID to capturedPokemon array if not already there
      const newCapturedPokemon = [...gameState.capturedPokemon];
      if (!newCapturedPokemon.includes(gameState.lastDefeatedPokemon.id)) {
        newCapturedPokemon.push(gameState.lastDefeatedPokemon.id);
      }
      
      // Update game state with new Pokemon, reduced pokeballs, and updated captured list
      updateGameState({
        playerPokemon: capturedPokemon,
        pokeballs: gameState.pokeballs - 1,
        lastDefeatedPokemon: null,
        enemyPokemon: null,
        capturedPokemon: newCapturedPokemon
      });
      
      setCaptureComplete(true);
    } catch (error) {
      console.error('Error capturing Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueGame = () => {
    updateGameState({ gamePhase: 'battle' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Capturing Pokémon...</p>
        </div>
      </div>
    );
  }

  if (captureComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            Capture Successful! 🎉
          </h2>
          
          <div className="mb-8">
            <img
              src={gameState.playerPokemon?.sprites.other['official-artwork'].front_default || gameState.playerPokemon?.sprites.front_default}
              alt={gameState.playerPokemon?.name}
              className="w-32 h-32 mx-auto object-contain mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2">
              {gameState.playerPokemon?.name}
            </h3>
            <p className="text-gray-600 mb-4">Level {gameState.playerPokemon?.level}</p>
            
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                {gameState.playerPokemon?.name} is now your partner!
              </p>
              <p className="text-green-700 text-sm mt-2">
                You have {gameState.pokeballs} Pokéballs remaining.
              </p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-800 mb-2">New Partner Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Level:</span> {gameState.playerPokemon?.level}
                </div>
                <div>
                  <span className="font-medium">HP:</span> {gameState.playerPokemon?.maxHp}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {gameState.playerPokemon?.types.map(t => t.type.name).join(', ')}
                </div>
                <div>
                  <span className="font-medium">Moves:</span> {gameState.playerPokemon?.learnedMoves.length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={continueGame}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Continue Adventure!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Capture Pokémon! ⚡
        </h2>
        
        <div className="mb-8">
          <img
            src={gameState.lastDefeatedPokemon?.sprites.other['official-artwork'].front_default || gameState.lastDefeatedPokemon?.sprites.front_default}
            alt={gameState.lastDefeatedPokemon?.name}
            className="w-32 h-32 mx-auto object-contain mb-4"
          />
          <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2">
            {gameState.lastDefeatedPokemon?.name}
          </h3>
          <p className="text-gray-600 mb-4">Level {(gameState.lastDefeatedPokemon as any).level || 5}</p>
          
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium mb-2">
              Use a Pokéball to capture this Pokémon!
            </p>
            <p className="text-blue-700 text-sm">
              This Pokémon will become your new partner and replace your current one.
              Capture rate: 100% guaranteed!
            </p>
          </div>
          
                      <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-800 mb-2">Pokémon Info</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Level:</span> {(gameState.lastDefeatedPokemon as any).level || 5}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {gameState.lastDefeatedPokemon?.types.map(t => t.type.name).join(', ')}
                </div>
                <div>
                  <span className="font-medium">HP:</span> {gameState.lastDefeatedPokemon?.stats[0].base_stat}
                </div>
                <div>
                  <span className="font-medium">Attack:</span> {gameState.lastDefeatedPokemon?.stats[1].base_stat}
                </div>
              </div>
            </div>
          
          <div className="text-sm text-gray-600 mb-6">
            Pokéballs remaining: {gameState.pokeballs}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCapture}
            disabled={gameState.pokeballs <= 0 || !gameState.lastDefeatedPokemon}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Throw Pokéball! 🔴
          </button>
          
          <button
            onClick={() => updateGameState({ gamePhase: 'defeat' })}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Skip Capture
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureScreen; 