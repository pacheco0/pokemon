import { Pokemon, PlayerPokemon, Move } from '@/types/pokemon';
import { pokeAPI, extractIdFromUrl } from './pokeapi';

export const calculateStats = (pokemon: Pokemon, level: number) => {
  const baseHp = pokemon.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 50;
  const baseAttack = pokemon.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 50;
  const baseDefense = pokemon.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 50;
  const baseSpeed = pokemon.stats.find(stat => stat.stat.name === 'speed')?.base_stat || 50;

  // Simplified stat calculation formula
  const hp = Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
  const attack = Math.floor(((2 * baseAttack + 31) * level) / 100) + 5;
  const defense = Math.floor(((2 * baseDefense + 31) * level) / 100) + 5;
  const speed = Math.floor(((2 * baseSpeed + 31) * level) / 100) + 5;

  return { hp, attack, defense, speed };
};

export const calculateDamage = (
  attackerLevel: number,
  attackerAttack: number,
  defenderDefense: number,
  movePower: number
): number => {
  if (movePower === 0) return 0;
  
  // Simplified damage formula
  const baseDamage = ((2 * attackerLevel + 10) / 250) * (attackerAttack / defenderDefense) * movePower + 2;
  const randomFactor = 0.85 + Math.random() * 0.15; // 85-100% damage
  
  return Math.max(1, Math.floor(baseDamage * randomFactor));
};

export const calculateExperienceGain = (defeatedPokemonLevel: number): number => {
  return Math.floor(defeatedPokemonLevel * 50 + 100);
};

export const calculateExperienceToNextLevel = (level: number): number => {
  return Math.floor(Math.pow(level, 3));
};

export const createPlayerPokemon = async (pokemon: Pokemon, level: number = 5): Promise<PlayerPokemon> => {
  const stats = calculateStats(pokemon, level);
  const learnedMoves = await getLearnedMoves(pokemon, level);
  
  return {
    ...pokemon,
    level,
    currentHp: stats.hp,
    maxHp: stats.hp,
    experience: 0,
    experienceToNext: calculateExperienceToNextLevel(level + 1),
    learnedMoves: learnedMoves.slice(0, 4) // Max 4 moves
  };
};

export const getLearnedMoves = async (pokemon: Pokemon, level: number): Promise<Move[]> => {
  const availableMoves = pokemon.moves
    .filter(moveData => {
      const levelLearned = moveData.version_group_details.find(
        detail => detail.move_learn_method.name === 'level-up'
      )?.level_learned_at || 0;
      return levelLearned <= level && levelLearned > 0;
    })
    .sort((a, b) => {
      const aLevel = a.version_group_details.find(
        detail => detail.move_learn_method.name === 'level-up'
      )?.level_learned_at || 0;
      const bLevel = b.version_group_details.find(
        detail => detail.move_learn_method.name === 'level-up'
      )?.level_learned_at || 0;
      return bLevel - aLevel; // Most recent moves first
    });

  const moves: Move[] = [];
  for (const moveData of availableMoves.slice(0, 6)) { // Get top 6 moves
    try {
      const move = await pokeAPI.getMove(extractIdFromUrl(moveData.move.url));
      if (move.power && move.power > 0) { // Only offensive moves
        moves.push(move);
      }
    } catch (error) {
      console.error(`Failed to fetch move: ${moveData.move.name}`);
    }
  }

  // If no moves found, add a basic tackle move
  if (moves.length === 0) {
    try {
      const tackle = await pokeAPI.getMove('tackle');
      moves.push(tackle);
    } catch (error) {
      console.error('Failed to fetch tackle move');
    }
  }

  return moves;
};

export const levelUpPokemon = async (playerPokemon: PlayerPokemon, experienceGained: number): Promise<PlayerPokemon> => {
  let newExperience = playerPokemon.experience + experienceGained;
  let newLevel = playerPokemon.level;
  
  while (newExperience >= playerPokemon.experienceToNext) {
    newExperience -= playerPokemon.experienceToNext;
    newLevel++;
  }

  const newStats = calculateStats(playerPokemon, newLevel);
  const hpIncrease = newStats.hp - playerPokemon.maxHp;
  const newLearnedMoves = await getLearnedMoves(playerPokemon, newLevel);

  return {
    ...playerPokemon,
    level: newLevel,
    currentHp: playerPokemon.currentHp + hpIncrease,
    maxHp: newStats.hp,
    experience: newExperience,
    experienceToNext: calculateExperienceToNextLevel(newLevel + 1),
    learnedMoves: newLearnedMoves.slice(0, 4)
  };
};

export const generateEnemyPokemon = async (playerLevel: number): Promise<Pokemon> => {
  const maxAttempts = 10;
  let attempts = 0;
  
  // Get list of basic Pokemon (not evolved forms) for fair matchups
  const getBasicPokemonIds = (level: number) => {
    const basicPokemon = [
      // Gen 1 starters and basic Pokemon
      1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 84, 86, 88, 90, 92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118, 120, 122, 123, 124, 125, 126, 127, 128, 129, 131, 132, 133, 137, 138, 140, 142, 143, 144, 145, 146, 147, 150, 151,
      // Gen 2 basics if level allows
      ...(level > 10 ? [152, 155, 158, 161, 163, 165, 167, 170, 172, 173, 174, 175, 177, 179, 183, 185, 187, 190, 191, 193, 194, 198, 200, 201, 202, 203, 204, 206, 207, 209, 211, 213, 214, 215, 216, 218, 220, 222, 223, 225, 226, 227, 228, 231, 234, 235, 236, 238, 239, 240, 241, 243, 244, 245, 246] : []),
      // Gen 3 basics if level allows
      ...(level > 20 ? [252, 255, 258, 261, 263, 265, 270, 273, 276, 278, 280, 283, 285, 287, 290, 293, 296, 298, 299, 300, 301, 302, 303, 304, 307, 309, 311, 312, 313, 314, 315, 316, 318, 320, 322, 324, 325, 327, 328, 331, 333, 335, 336, 337, 338, 339, 341, 343, 345, 347, 349, 351, 352, 353, 355, 357, 358, 359, 360, 361, 363, 366, 369, 370, 371, 374, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386] : [])
    ];
    return basicPokemon;
  };
  
  while (attempts < maxAttempts) {
    try {
      const basicPokemonIds = getBasicPokemonIds(playerLevel);
      const randomId = basicPokemonIds[Math.floor(Math.random() * basicPokemonIds.length)];
      
      const enemy = await pokeAPI.getPokemon(randomId);
      
      // Enemy level should be same as player level (fair fight)
      const enemyLevel = playerLevel;
      
      // Add level property and calculate stats for enemy pokemon
      (enemy as any).level = enemyLevel;
      const enemyStats = calculateStats(enemy, enemyLevel);
      (enemy as any).currentHp = enemyStats.hp;
      (enemy as any).maxHp = enemyStats.hp;
      
      // Filter moves to only include those learnable at current level
      const learnableMoves = enemy.moves.filter(moveData => {
        const levelLearned = moveData.version_group_details.find(
          detail => detail.move_learn_method.name === 'level-up'
        )?.level_learned_at || 0;
        return levelLearned <= enemyLevel && levelLearned > 0 && levelLearned >= 1;
      });
      
      // If no learnable moves, add basic moves
      if (learnableMoves.length === 0) {
        const basicMoveUrls = [
          'https://pokeapi.co/api/v2/move/33/', // tackle
          'https://pokeapi.co/api/v2/move/10/', // scratch
          'https://pokeapi.co/api/v2/move/1/'   // pound
        ];
        
        enemy.moves = basicMoveUrls.map(url => ({
          move: { name: url.includes('33') ? 'tackle' : url.includes('10') ? 'scratch' : 'pound', url },
          version_group_details: [{
            level_learned_at: 1,
            move_learn_method: { name: 'level-up' }
          }]
        }));
      } else {
        // Keep only learnable moves, sorted by level learned (most recent first)
        enemy.moves = learnableMoves.sort((a, b) => {
          const aLevel = a.version_group_details.find(
            detail => detail.move_learn_method.name === 'level-up'
          )?.level_learned_at || 0;
          const bLevel = b.version_group_details.find(
            detail => detail.move_learn_method.name === 'level-up'
          )?.level_learned_at || 0;
          return bLevel - aLevel;
        }).slice(0, 4); // Max 4 moves
      }
      
      return enemy;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed to generate enemy Pokemon`);
    }
  }
  
  // Fallback to a known basic Pokemon if all attempts fail
  const fallbackIds = [25, 1, 4, 7]; // Pikachu, Bulbasaur, Charmander, Squirtle
  const fallbackId = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
  const fallback = await pokeAPI.getPokemon(fallbackId);
  (fallback as any).level = playerLevel;
  const fallbackStats = calculateStats(fallback, playerLevel);
  (fallback as any).currentHp = fallbackStats.hp;
  (fallback as any).maxHp = fallbackStats.hp;
  
  // Add basic tackle move for fallback
  fallback.moves = [{
    move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' },
    version_group_details: [{
      level_learned_at: 1,
      move_learn_method: { name: 'level-up' }
    }]
  }];
  
  return fallback;
};

export const checkEvolution = async (playerPokemon: PlayerPokemon): Promise<Pokemon | null> => {
  try {
    const species = await pokeAPI.getSpecies(playerPokemon.id);
    const evolutionChainId = extractIdFromUrl(species.evolution_chain.url);
    const evolutionChain = await pokeAPI.getEvolutionChain(evolutionChainId);
    
    // Find current pokemon in evolution chain
    const findEvolution = (chain: any): any => {
      if (chain.species.name === playerPokemon.name) {
        return chain.evolves_to[0] || null;
      }
      for (const evolution of chain.evolves_to) {
        const result = findEvolution(evolution);
        if (result) return result;
      }
      return null;
    };
    
    const nextEvolution = findEvolution(evolutionChain.chain);
    
    if (nextEvolution) {
      const minLevel = nextEvolution.evolution_details[0]?.min_level;
      if (minLevel && playerPokemon.level >= minLevel) {
        return await pokeAPI.getPokemon(nextEvolution.species.name);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking evolution:', error);
    return null;
  }
};

export const saveGameState = (gameState: any) => {
  if (typeof window !== 'undefined') {
    console.log('=== SAVE GAME STATE ===');
    console.log('Saving game state with captured Pokemon:', gameState.capturedPokemon);
    console.log('Captured Pokemon array length:', gameState.capturedPokemon?.length || 0);
    console.log('Full game state being saved:', gameState);
    localStorage.setItem('pokemon-battle-game', JSON.stringify(gameState));
    console.log('Game state saved to localStorage');
  }
};

export const loadGameState = (): any | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pokemon-battle-game');
    const parsed = saved ? JSON.parse(saved) : null;
    console.log('=== LOAD GAME STATE ===');
    console.log('Loaded game state with captured Pokemon:', parsed?.capturedPokemon);
    console.log('Captured Pokemon array length:', parsed?.capturedPokemon?.length || 0);
    console.log('Full loaded state:', parsed);
    return parsed;
  }
  return null;
};

export const clearGameState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pokemon-battle-game');
  }
}; 