'use client';

import React, { useState, useEffect } from 'react';
import { GameState, Pokemon, PlayerPokemon, REGIONS } from '@/types/pokemon';
import { pokeAPI } from '@/utils/pokeapi';
import { createPlayerPokemon } from '@/utils/gameLogic';

interface PokemonSelectProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface AvailablePokemon {
  pokemon: Pokemon;
  region: string;
  isStarter: boolean;
  isCaptured: boolean;
  isChosen: boolean;
}

const PokemonSelect: React.FC<PokemonSelectProps> = ({ 
  gameState, 
  updateGameState, 
  loading, 
  setLoading 
}) => {
  const [availablePokemon, setAvailablePokemon] = useState<AvailablePokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    loadAvailablePokemon();
  }, [gameState.capturedPokemon, gameState.chosenStarter]);

  const loadAvailablePokemon = async () => {
    setLoading(true);
    try {
      const available: AvailablePokemon[] = [];
      
      // Get all starter IDs
      const allStarterIds = Object.values(REGIONS).flatMap(region => 
        region.starters.map(starter => starter.id)
      );

      // Load all starters (always available)
      for (const [regionKey, region] of Object.entries(REGIONS)) {
        for (const starter of region.starters) {
          try {
            const pokemon = await pokeAPI.getPokemon(starter.id);
            available.push({
              pokemon,
              region: region.name,
              isStarter: true,
              isCaptured: false,
              isChosen: gameState.chosenStarter === starter.id
            });
          } catch (error) {
            console.error(`Failed to load starter ${starter.name}:`, error);
          }
        }
      }

      // Load captured Pokemon (that are not starters)
      for (const pokemonId of gameState.capturedPokemon) {
        if (!allStarterIds.includes(pokemonId)) {
          try {
            const pokemon = await pokeAPI.getPokemon(pokemonId);
            
            // Determine region based on Pokemon ID
            let region = 'Unknown';
            if (pokemonId <= 151) region = 'Kanto';
            else if (pokemonId <= 251) region = 'Johto';
            else if (pokemonId <= 386) region = 'Hoenn';
            else if (pokemonId <= 493) region = 'Sinnoh';

            available.push({
              pokemon,
              region,
              isStarter: false,
              isCaptured: true,
              isChosen: false
            });
          } catch (error) {
            console.error(`Failed to load captured Pokemon ${pokemonId}:`, error);
          }
        }
      }

      // Sort by region order and then by ID
      const regionOrder = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'];
      available.sort((a, b) => {
        // Starters first
        if (a.isStarter && !b.isStarter) return -1;
        if (!a.isStarter && b.isStarter) return 1;
        
        // Then by region
        const regionDiff = regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region);
        if (regionDiff !== 0) return regionDiff;
        
        // Finally by ID
        return a.pokemon.id - b.pokemon.id;
      });

      setAvailablePokemon(available);
    } catch (error) {
      console.error('Failed to load available Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonSelect = async (pokemon: Pokemon) => {
    setLoading(true);
    try {
      const playerPokemon = await createPlayerPokemon(pokemon, 5);
      updateGameState({ 
        playerPokemon: playerPokemon, 
        gamePhase: 'battle',
        chosenStarter: pokemon.id
      });
    } catch (error) {
      console.error('Failed to create player Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      grass: 'from-green-400 to-green-600',
      fire: 'from-red-400 to-red-600',
      water: 'from-blue-400 to-blue-600',
      electric: 'from-yellow-400 to-yellow-600',
      psychic: 'from-pink-400 to-pink-600',
      ice: 'from-cyan-400 to-cyan-600',
      dragon: 'from-purple-400 to-purple-600',
      dark: 'from-gray-700 to-gray-900',
      fairy: 'from-pink-300 to-pink-500',
      fighting: 'from-red-600 to-red-800',
      poison: 'from-purple-500 to-purple-700',
      ground: 'from-yellow-600 to-yellow-800',
      flying: 'from-indigo-400 to-indigo-600',
      bug: 'from-green-500 to-green-700',
      rock: 'from-yellow-700 to-yellow-900',
      ghost: 'from-purple-600 to-purple-800',
      steel: 'from-gray-400 to-gray-600',
      normal: 'from-gray-300 to-gray-500'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const goBack = () => {
    updateGameState({ gamePhase: 'home' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading available Pokémon...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            Choose Your Partner
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Select from your available Pokémon to start your adventure
          </p>
        </header>

        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            {availablePokemon.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No Pokémon available to start with.</p>
                <p className="text-gray-500">All trainers have access to starter Pokémon from all regions!</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Available Pokémon ({availablePokemon.length})
                  </h3>
                  <p className="text-gray-600">
                    {availablePokemon.filter(p => p.isStarter).length} Starters + {availablePokemon.filter(p => p.isCaptured).length} Captured
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {availablePokemon.map((entry) => (
                    <div
                      key={entry.pokemon.id}
                      className={`
                        relative cursor-pointer transition-all duration-300 transform hover:scale-105 rounded-xl p-4
                        ${selectedPokemon?.id === entry.pokemon.id 
                          ? 'ring-4 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100' 
                          : 'hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100'
                        }
                      `}
                      onClick={() => setSelectedPokemon(entry.pokemon)}
                    >
                      {/* Status badges */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {entry.isChosen && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ⭐ Last Used
                          </span>
                        )}
                        {entry.isStarter && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            🏠 Starter
                          </span>
                        )}
                        {entry.isCaptured && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ✓ Caught
                          </span>
                        )}
                      </div>

                      {/* Pokemon Image */}
                      <div className="text-center mb-4">
                        <img
                          src={entry.pokemon.sprites.other['official-artwork'].front_default || entry.pokemon.sprites.front_default}
                          alt={entry.pokemon.name}
                          className="w-24 h-24 mx-auto object-contain"
                        />
                      </div>

                      {/* Pokemon Info */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 capitalize">
                          #{entry.pokemon.id.toString().padStart(3, '0')} {entry.pokemon.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {entry.region} Region
                        </p>

                        {/* Types */}
                        <div className="flex justify-center space-x-1 mb-2">
                          {entry.pokemon.types.map((typeInfo) => (
                            <span
                              key={typeInfo.type.name}
                              className={`
                                bg-gradient-to-r ${getTypeColor(typeInfo.type.name)}
                                text-white px-2 py-1 rounded-full text-xs font-medium capitalize
                              `}
                            >
                              {typeInfo.type.name}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                          <div>HP: {entry.pokemon.stats[0].base_stat}</div>
                          <div>ATK: {entry.pokemon.stats[1].base_stat}</div>
                          <div>DEF: {entry.pokemon.stats[2].base_stat}</div>
                          <div>SPD: {entry.pokemon.stats[5].base_stat}</div>
                        </div>
                      </div>

                      {selectedPokemon?.id === entry.pokemon.id && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => selectedPokemon && handlePokemonSelect(selectedPokemon)}
                    disabled={!selectedPokemon || loading}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mr-4"
                  >
                    {selectedPokemon ? `Start Adventure with ${selectedPokemon.name}!` : 'Select a Pokémon'}
                  </button>
                  
                  <button
                    onClick={goBack}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonSelect; 