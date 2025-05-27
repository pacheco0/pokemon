'use client';

import React from 'react';
import { GameState } from '@/types/pokemon';

interface DefeatScreenProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  onRestart: () => void;
}

const DefeatScreen: React.FC<DefeatScreenProps> = ({ 
  gameState, 
  updateGameState, 
  onRestart 
}) => {
  const handleCapture = () => {
    if (gameState.pokeballs > 0) {
      updateGameState({ gamePhase: 'capture' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-6">
          Defeat! 💔
        </h2>
        
        <div className="mb-8">
          <img
            src={gameState.playerPokemon?.sprites.other['official-artwork'].front_default || gameState.playerPokemon?.sprites.front_default}
            alt={gameState.playerPokemon?.name}
            className="w-32 h-32 mx-auto object-contain mb-4 grayscale"
          />
          <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2">
            {gameState.playerPokemon?.name} fainted!
          </h3>
          <p className="text-gray-600 mb-4">You reached wave {gameState.wave}</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-2">Final Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Waves Completed:</span> {gameState.wave - 1}
              </div>
              <div>
                <span className="font-medium">Final Level:</span> {gameState.playerPokemon?.level}
              </div>
              <div>
                <span className="font-medium">Pokéballs Left:</span> {gameState.pokeballs}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {gameState.playerPokemon?.experience}
              </div>
            </div>
          </div>
          
          {gameState.lastDefeatedPokemon && gameState.pokeballs > 0 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-yellow-800 mb-2">Capture Opportunity!</h4>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <img
                  src={gameState.lastDefeatedPokemon.sprites.other['official-artwork'].front_default || gameState.lastDefeatedPokemon.sprites.front_default}
                  alt={gameState.lastDefeatedPokemon.name}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <p className="text-yellow-800 font-medium capitalize">
                    {gameState.lastDefeatedPokemon.name}
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Level {(gameState.lastDefeatedPokemon as any).level || 5}
                  </p>
                </div>
              </div>
              <p className="text-yellow-800 text-sm">
                You can use a Pokéball to capture the last {gameState.lastDefeatedPokemon.name} you defeated!
                It will become your new partner.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          {gameState.lastDefeatedPokemon && gameState.pokeballs > 0 && (
            <button
              onClick={handleCapture}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Capture {gameState.lastDefeatedPokemon.name}! ⚡
            </button>
          )}
          
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start New Game
          </button>
        </div>
        
        {gameState.pokeballs === 0 && gameState.lastDefeatedPokemon && (
          <div className="mt-4 text-gray-600 text-sm">
            No Pokéballs left to capture {gameState.lastDefeatedPokemon.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefeatScreen; 