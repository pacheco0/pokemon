'use client';

import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/pokemon';
import { generateEnemyPokemon, checkEvolution, createPlayerPokemon } from '@/utils/gameLogic';

interface VictoryScreenProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ 
  gameState, 
  updateGameState, 
  loading, 
  setLoading 
}) => {
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionPokemon, setEvolutionPokemon] = useState<any>(null);

  useEffect(() => {
    checkForEvolution();
  }, []);

  const checkForEvolution = async () => {
    if (!gameState.playerPokemon) return;
    
    try {
      const evolution = await checkEvolution(gameState.playerPokemon);
      if (evolution) {
        setEvolutionPokemon(evolution);
        setShowEvolution(true);
      }
    } catch (error) {
      console.error('Error checking evolution:', error);
    }
  };

  const handleEvolution = async () => {
    if (!evolutionPokemon || !gameState.playerPokemon) return;
    
    setLoading(true);
    try {
      const evolvedPokemon = await createPlayerPokemon(evolutionPokemon, gameState.playerPokemon.level);
      evolvedPokemon.currentHp = gameState.playerPokemon.currentHp;
      evolvedPokemon.experience = gameState.playerPokemon.experience;
      
      updateGameState({ playerPokemon: evolvedPokemon });
      setShowEvolution(false);
    } catch (error) {
      console.error('Error evolving Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueToNextWave = async () => {
    if (!gameState.playerPokemon) return;
    
    setLoading(true);
    try {
      const newWave = gameState.wave + 1;
      const bonusPokeballs = newWave % 5 === 0 ? 1 : 0; // +1 pokeball every 5 waves
      
      updateGameState({
        wave: newWave,
        pokeballs: gameState.pokeballs + bonusPokeballs,
        enemyPokemon: null,
        gamePhase: 'battle'
      });
    } catch (error) {
      console.error('Error continuing to next wave:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  if (showEvolution && evolutionPokemon) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Evolution Time! 🌟
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
            {/* Current Pokemon */}
            <div className="text-center">
              <img
                src={gameState.playerPokemon?.sprites.other['official-artwork'].front_default || gameState.playerPokemon?.sprites.front_default}
                alt={gameState.playerPokemon?.name}
                className="w-32 h-32 mx-auto object-contain mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {gameState.playerPokemon?.name}
              </h3>
              <p className="text-gray-600">Level {gameState.playerPokemon?.level}</p>
            </div>
            
            {/* Arrow */}
            <div className="text-center">
              <div className="text-4xl">→</div>
              <p className="text-lg font-medium text-gray-700 mt-2">Evolves into</p>
            </div>
            
            {/* Evolution Pokemon */}
            <div className="text-center">
              <img
                src={evolutionPokemon.sprites.other['official-artwork'].front_default || evolutionPokemon.sprites.front_default}
                alt={evolutionPokemon.name}
                className="w-32 h-32 mx-auto object-contain mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {evolutionPokemon.name}
              </h3>
              <p className="text-gray-600">Level {gameState.playerPokemon?.level}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleEvolution}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Evolve! ✨
            </button>
            <button
              onClick={() => setShowEvolution(false)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Skip Evolution
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
          Victory! 🎉
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
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-2">Battle Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Wave:</span> {gameState.wave}
              </div>
              <div>
                <span className="font-medium">Pokéballs:</span> {gameState.pokeballs}
              </div>
              <div>
                <span className="font-medium">HP:</span> {gameState.playerPokemon?.currentHp}/{gameState.playerPokemon?.maxHp}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {gameState.playerPokemon?.experience}
              </div>
            </div>
          </div>
          
          {gameState.wave % 5 === 0 && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">
                🎁 Bonus! You earned an extra Pokéball for reaching wave {gameState.wave}!
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={continueToNextWave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Continue to Wave {gameState.wave + 1}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen; 