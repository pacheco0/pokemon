'use client';

import React, { useState, useEffect } from 'react';
import { GameState, Pokemon, REGIONS } from '@/types/pokemon';
import { pokeAPI } from '@/utils/pokeapi';

interface PokedexProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface PokedexEntry {
  pokemon: Pokemon;
  region: string;
  isStarter: boolean;
  isCaptured: boolean;
  isChosen: boolean;
}

const Pokedex: React.FC<PokedexProps> = ({ gameState, updateGameState, loading, setLoading }) => {
  const [pokedexEntries, setPokedexEntries] = useState<PokedexEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'captured' | 'uncaptured' | string>('all');
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, region: '' });

  useEffect(() => {
    loadPokedexData();
  }, [gameState.capturedPokemon, gameState.chosenStarter]);

  const loadPokedexData = async () => {
    setLoading(true);
    setLoadingProgress({ current: 0, total: 493, region: 'Initializing...' });
    try {
      const entries: PokedexEntry[] = [];
      
      // Define Pokemon ranges for each region (based on National Dex)
      const regionRanges = {
        'Kanto': { start: 1, end: 151 },    // Gen 1: 1-151
        'Johto': { start: 152, end: 251 },  // Gen 2: 152-251
        'Hoenn': { start: 252, end: 386 },  // Gen 3: 252-386
        'Sinnoh': { start: 387, end: 493 }  // Gen 4: 387-493
      };

      // Get all starter IDs for easy checking
      const allStarterIds = Object.values(REGIONS).flatMap(region => 
        region.starters.map(starter => starter.id)
      );

      let totalLoaded = 0;

      // Load ALL Pokemon for each region
      for (const [regionName, range] of Object.entries(regionRanges)) {
        setLoadingProgress({ current: totalLoaded, total: 493, region: regionName });
        console.log(`Loading ${regionName} Pokemon (${range.start}-${range.end})...`);
        
        // Create array of all Pokemon IDs in this region
        const pokemonIds = [];
        for (let id = range.start; id <= range.end; id++) {
          pokemonIds.push(id);
        }
        
        // Load Pokemon in batches to avoid overwhelming the API
        const batchSize = 20;
        for (let i = 0; i < pokemonIds.length; i += batchSize) {
          const batch = pokemonIds.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (pokemonId) => {
            try {
              const pokemon = await pokeAPI.getPokemon(pokemonId);
              const isStarter = allStarterIds.includes(pokemonId);
              const isCaptured = gameState.capturedPokemon.includes(pokemonId);
              const isChosen = gameState.chosenStarter === pokemonId;
              
              return {
                pokemon,
                region: regionName,
                isStarter,
                isCaptured,
                isChosen
              };
            } catch (error) {
              console.error(`Failed to load Pokemon ${pokemonId}:`, error);
              return null;
            }
          });
          
          // Wait for current batch to complete
          const batchResults = await Promise.all(batchPromises);
          
          // Add successful results to entries
          const validResults = batchResults.filter(result => result !== null) as PokedexEntry[];
          entries.push(...validResults);
          totalLoaded += validResults.length;
          
          // Update progress
          setLoadingProgress({ current: totalLoaded, total: 493, region: regionName });
          
          // Small delay between batches to be respectful to the API
          if (i + batchSize < pokemonIds.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        console.log(`Completed loading ${regionName} Pokemon`);
      }

      // Sort by region order and then by ID
      const regionOrder = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'];
      entries.sort((a, b) => {
        const regionDiff = regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region);
        if (regionDiff !== 0) return regionDiff;
        return a.pokemon.id - b.pokemon.id;
      });

      setPokedexEntries(entries);
      console.log(`Total Pokemon loaded: ${entries.length}`);
    } catch (error) {
      console.error('Failed to load Pokedex data:', error);
    } finally {
      setLoading(false);
      setLoadingProgress({ current: 0, total: 0, region: '' });
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

  const filteredEntries = pokedexEntries.filter(entry => {
    switch (selectedFilter) {
      case 'captured':
        return entry.isCaptured || entry.isChosen || entry.isStarter;
      case 'uncaptured':
        return !entry.isCaptured && !entry.isChosen && !entry.isStarter;
      case 'all':
      default:
        if (selectedFilter !== 'all' && selectedFilter !== 'captured' && selectedFilter !== 'uncaptured') {
          return entry.region === selectedFilter;
        }
        return true;
    }
  });

  const goBack = () => {
    updateGameState({ gamePhase: 'home' });
  };

  if (loading) {
    const progressPercentage = loadingProgress.total > 0 ? Math.round((loadingProgress.current / loadingProgress.total) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 mb-4">Loading Complete Pokédex...</p>
              
              {loadingProgress.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Loading {loadingProgress.region} Region</span>
                    <span>{loadingProgress.current} / {loadingProgress.total} ({progressPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Loading all 493 Pokémon from Kanto, Johto, Hoenn, and Sinnoh regions...
                <br />This may take a moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            Pokédex
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Your collection of discovered Pokémon
          </p>
          
          {/* Back to Home button at the top */}
          <div className="mt-6">
            <button
              onClick={goBack}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {pokedexEntries.filter(e => e.isCaptured || e.isChosen || e.isStarter).length}
                </div>
                <div className="text-sm text-gray-600">Captured</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {pokedexEntries.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {pokedexEntries.filter(e => e.isStarter).length}
                </div>
                <div className="text-sm text-gray-600">Starters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((pokedexEntries.filter(e => e.isCaptured || e.isChosen || e.isStarter).length / pokedexEntries.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-wrap gap-2 justify-center">
              {['all', 'captured', 'uncaptured', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter === 'all' ? 'All' : 
                   filter === 'captured' ? 'Captured' :
                   filter === 'uncaptured' ? 'Undiscovered' :
                   filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pokemon Grid */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.pokemon.id}
                  className={`relative rounded-xl p-4 transition-all duration-300 transform hover:scale-105 ${
                    entry.isCaptured || entry.isChosen || entry.isStarter
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-md'
                  }`}
                >
                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {entry.isChosen && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        ⭐ Chosen
                      </span>
                    )}
                    {entry.isStarter && !entry.isChosen && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🏠 Starter
                      </span>
                    )}
                    {entry.isCaptured && !entry.isStarter && (
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
                      className={`w-24 h-24 mx-auto object-contain ${
                        entry.isCaptured || entry.isChosen || entry.isStarter ? '' : 'grayscale brightness-75'
                      }`}
                    />
                  </div>

                  {/* Pokemon Info */}
                  <div className="text-center">
                    <h3 className={`text-lg font-bold mb-1 capitalize ${
                      entry.isCaptured || entry.isChosen || entry.isStarter ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      #{entry.pokemon.id.toString().padStart(3, '0')} {entry.pokemon.name}
                    </h3>
                    
                    <p className={`text-sm mb-2 ${
                      entry.isCaptured || entry.isChosen || entry.isStarter ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {entry.region} Region
                    </p>

                    {/* Types */}
                    <div className="flex justify-center space-x-1 mb-2">
                      {entry.pokemon.types.map((typeInfo) => (
                        <span
                          key={typeInfo.type.name}
                          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                            entry.isCaptured || entry.isChosen || entry.isStarter
                              ? `bg-gradient-to-r ${getTypeColor(typeInfo.type.name)} text-white`
                              : 'bg-gray-500 text-gray-300'
                          }`}
                        >
                          {typeInfo.type.name}
                        </span>
                      ))}
                    </div>

                    {/* Stats preview (only for captured/starters) */}
                    {(entry.isCaptured || entry.isChosen || entry.isStarter) && (
                      <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                        <div>HP: {entry.pokemon.stats[0].base_stat}</div>
                        <div>ATK: {entry.pokemon.stats[1].base_stat}</div>
                        <div>DEF: {entry.pokemon.stats[2].base_stat}</div>
                        <div>SPD: {entry.pokemon.stats[5].base_stat}</div>
                      </div>
                    )}

                    {/* Unknown stats for uncaptured */}
                    {!entry.isCaptured && !entry.isChosen && !entry.isStarter && (
                      <div className="text-xs text-gray-500">
                        Stats unknown - catch to reveal!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No Pokémon found with the current filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={goBack}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pokedex; 