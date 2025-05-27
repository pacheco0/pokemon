'use client';

import React, { useState, useEffect } from 'react';
import { REGIONS, Pokemon, PlayerPokemon } from '@/types/pokemon';
import { pokeAPI } from '@/utils/pokeapi';
import { createPlayerPokemon } from '@/utils/gameLogic';

interface StarterSelectProps {
  selectedRegion: 'kanto' | 'johto' | 'hoenn';
  onStarterSelect: (pokemon: PlayerPokemon) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const StarterSelect: React.FC<StarterSelectProps> = ({ 
  selectedRegion, 
  onStarterSelect, 
  loading, 
  setLoading 
}) => {
  const [starters, setStarters] = useState<Pokemon[]>([]);
  const [selectedStarter, setSelectedStarter] = useState<Pokemon | null>(null);

  useEffect(() => {
    const loadStarters = async () => {
      setLoading(true);
      try {
        const region = REGIONS[selectedRegion];
        const starterPromises = region.starters.map(starter => 
          pokeAPI.getPokemon(starter.id)
        );
        const starterData = await Promise.all(starterPromises);
        setStarters(starterData);
      } catch (error) {
        console.error('Failed to load starters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStarters();
  }, [selectedRegion, setLoading]);

  const handleStarterSelect = async (pokemon: Pokemon) => {
    setLoading(true);
    try {
      const playerPokemon = await createPlayerPokemon(pokemon, 5);
      onStarterSelect(playerPokemon);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading starters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Choose Your Starter Pokémon
        </h2>
        <p className="text-center text-gray-600 mb-8">
          From the {REGIONS[selectedRegion].name} region
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {starters.map((pokemon) => (
            <div
              key={pokemon.id}
              className={`
                relative cursor-pointer transition-all duration-300 transform hover:scale-105
                ${selectedStarter?.id === pokemon.id 
                  ? 'ring-4 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-lg'
                }
              `}
              onClick={() => setSelectedStarter(pokemon)}
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                <div className="relative mb-4">
                  <img
                    src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                    alt={pokemon.name}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
                  {pokemon.name}
                </h3>
                
                <div className="flex justify-center space-x-2 mb-4">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className={`
                        bg-gradient-to-r ${getTypeColor(typeInfo.type.name)}
                        text-white px-3 py-1 rounded-full text-sm font-medium capitalize
                      `}
                    >
                      {typeInfo.type.name}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">HP:</span> {pokemon.stats[0].base_stat}
                  </div>
                  <div>
                    <span className="font-medium">Attack:</span> {pokemon.stats[1].base_stat}
                  </div>
                  <div>
                    <span className="font-medium">Defense:</span> {pokemon.stats[2].base_stat}
                  </div>
                  <div>
                    <span className="font-medium">Speed:</span> {pokemon.stats[5].base_stat}
                  </div>
                </div>
                
                {selectedStarter?.id === pokemon.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={() => selectedStarter && handleStarterSelect(selectedStarter)}
            disabled={!selectedStarter || loading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {selectedStarter ? `Start with ${selectedStarter.name}!` : 'Select a Pokémon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarterSelect; 