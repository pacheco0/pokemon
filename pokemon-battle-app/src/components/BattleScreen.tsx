'use client';

import React, { useState, useEffect } from 'react';
import { GameState, PlayerPokemon, Pokemon, Move } from '@/types/pokemon';
import { 
  calculateStats, 
  calculateDamage, 
  generateEnemyPokemon,
  calculateExperienceGain,
  levelUpPokemon,
  checkEvolution
} from '@/utils/gameLogic';
import { pokeAPI, extractIdFromUrl } from '@/utils/pokeapi';

interface BattleScreenProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ 
  gameState, 
  updateGameState, 
  loading, 
  setLoading 
}) => {
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battlePhase, setBattlePhase] = useState<'select-move' | 'animating' | 'battle-end'>('select-move');
  
  // Local state for enemy HP to prevent state management issues
  const [enemyCurrentHp, setEnemyCurrentHp] = useState<number>(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState<number>(0);

  useEffect(() => {
    if (!gameState.enemyPokemon && gameState.playerPokemon) {
      generateEnemy();
    }
  }, [gameState.playerPokemon]);

  const generateEnemy = async () => {
    if (!gameState.playerPokemon) return;
    
    setLoading(true);
    try {
      const enemy = await generateEnemyPokemon(gameState.playerPokemon.level);
      
      // Ensure the enemy has the correct HP structure
      const enemyWithHp = {
        ...enemy,
        currentHp: (enemy as any).currentHp,
        maxHp: (enemy as any).maxHp,
        level: (enemy as any).level
      };
      
      // Initialize local HP state
      const maxHp = (enemy as any).maxHp;
      const currentHp = (enemy as any).currentHp;
      setEnemyMaxHp(maxHp);
      setEnemyCurrentHp(currentHp);
      
      console.log('=== GENERATE ENEMY DEBUG ===');
      console.log('Generated enemy:', enemy.name);
      console.log('Enemy currentHp:', currentHp);
      console.log('Enemy maxHp:', maxHp);
      console.log('Local state initialized - currentHp:', currentHp, 'maxHp:', maxHp);
      
      updateGameState({ enemyPokemon: enemyWithHp });
      setBattleLog([`A wild ${enemy.name} appeared!`]);
      
      // Player always goes first at the start of battle
      setIsPlayerTurn(true);
      setBattlePhase('select-move');
    } catch (error) {
      console.error('Failed to generate enemy:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeMove = async (move: Move, attacker: PlayerPokemon | Pokemon, defender: PlayerPokemon | Pokemon, isPlayerAttacking: boolean) => {
    setBattlePhase('animating');
    
    const attackerLevel = isPlayerAttacking ? (attacker as PlayerPokemon).level : ((attacker as any).level || 5);
    const defenderLevel = isPlayerAttacking ? ((defender as any).level || 5) : (defender as PlayerPokemon).level;
    
    const attackerStats = calculateStats(attacker, attackerLevel);
    const defenderStats = calculateStats(defender, defenderLevel);
    
    const damage = calculateDamage(
      attackerLevel,
      attackerStats.attack,
      defenderStats.defense,
      move.power || 40
    );

    const attackerName = isPlayerAttacking ? gameState.playerPokemon!.name : gameState.enemyPokemon!.name;
    const defenderName = isPlayerAttacking ? gameState.enemyPokemon!.name : gameState.playerPokemon!.name;

    setBattleLog(prev => [...prev, `${attackerName} used ${move.name}!`]);

    // Apply damage after a short delay for animation
    setTimeout(() => {
      if (isPlayerAttacking) {
        // Player attacking enemy - use local state
        const newEnemyHp = Math.max(0, enemyCurrentHp - damage);
        setEnemyCurrentHp(newEnemyHp);
        
        // Also update the global state for consistency
        const updatedEnemy = { 
          ...gameState.enemyPokemon!, 
          currentHp: newEnemyHp,
          maxHp: enemyMaxHp,
          level: (gameState.enemyPokemon as any).level || 5
        };
        
        console.log('=== PLAYER ATTACK DEBUG ===');
        console.log('Enemy HP before attack:', enemyCurrentHp);
        console.log('Damage dealt:', damage);
        console.log('Enemy HP after attack:', newEnemyHp);
        console.log('Local state updated to:', newEnemyHp);
        
        updateGameState({ enemyPokemon: updatedEnemy });
        
        setBattleLog(prev => [...prev, `It dealt ${damage} damage!`]);
        
        if (newEnemyHp <= 0) {
          // Enemy defeated
          setTimeout(() => handleVictory(), 1000);
        } else {
          // Enemy's turn
          setTimeout(() => {
            setIsPlayerTurn(false);
            enemyTurn();
          }, 1500);
        }
      } else {
        // Enemy attacking player
        const playerCurrentHp = Math.max(0, gameState.playerPokemon!.currentHp - damage);
        const updatedPlayer = { ...gameState.playerPokemon!, currentHp: playerCurrentHp };
        updateGameState({ playerPokemon: updatedPlayer });
        
        console.log('=== ENEMY ATTACK DEBUG ===');
        console.log('Player HP before attack:', gameState.playerPokemon!.currentHp);
        console.log('Damage dealt:', damage);
        console.log('Player HP after attack:', playerCurrentHp);
        
        setBattleLog(prev => [...prev, `It dealt ${damage} damage!`]);
        
        if (playerCurrentHp <= 0) {
          // Player defeated
          setTimeout(() => handleDefeat(), 1000);
        } else {
          // Player's turn
          setTimeout(() => {
            setIsPlayerTurn(true);
            setBattlePhase('select-move');
          }, 1500);
        }
      }
    }, 1000);
  };

  const enemyTurn = async () => {
    if (!gameState.enemyPokemon || !gameState.playerPokemon) return;
    
    const enemyLevel = (gameState.enemyPokemon as any).level || 5;
    
    // Get moves that the enemy can actually learn at its current level
    const learnableMoves = gameState.enemyPokemon.moves.filter(moveData => {
      const levelLearned = moveData.version_group_details.find(
        detail => detail.move_learn_method.name === 'level-up'
      )?.level_learned_at || 0;
      return levelLearned <= enemyLevel && levelLearned > 0;
    });
    
    if (learnableMoves.length === 0) {
      // Fallback to basic moves appropriate for low level Pokemon
      const basicMoves = [
        { name: 'tackle', power: 40, type: 'normal' },
        { name: 'scratch', power: 40, type: 'normal' },
        { name: 'pound', power: 40, type: 'normal' }
      ];
      const randomBasic = basicMoves[Math.floor(Math.random() * basicMoves.length)];
      
      const basicMove: Move = {
        id: 1,
        name: randomBasic.name,
        power: randomBasic.power,
        accuracy: 100,
        pp: 35,
        type: { name: randomBasic.type },
        damage_class: { name: 'physical' }
      };
      executeMove(basicMove, gameState.enemyPokemon, gameState.playerPokemon, false);
    } else {
      // Pick a random learnable move and fetch its real data
      const randomMoveData = learnableMoves[Math.floor(Math.random() * learnableMoves.length)];
      
      try {
        const moveId = extractIdFromUrl(randomMoveData.move.url);
        const realMove = await pokeAPI.getMove(moveId);
        
        // Limit power for low level Pokemon to keep it balanced
        const adjustedPower = Math.min(realMove.power || 40, enemyLevel <= 10 ? 60 : 80);
        
        const balancedMove: Move = {
          ...realMove,
          power: adjustedPower
        };
        
        executeMove(balancedMove, gameState.enemyPokemon, gameState.playerPokemon, false);
      } catch (error) {
        // Fallback to tackle if move fetch fails
        const tackleMove: Move = {
          id: 33,
          name: 'tackle',
          power: 40,
          accuracy: 100,
          pp: 35,
          type: { name: 'normal' },
          damage_class: { name: 'physical' }
        };
        executeMove(tackleMove, gameState.enemyPokemon, gameState.playerPokemon, false);
      }
    }
  };

  const handleVictory = async () => {
    if (!gameState.playerPokemon || !gameState.enemyPokemon) return;
    
    setBattlePhase('battle-end');
    const expGained = calculateExperienceGain((gameState.enemyPokemon as any).level || 5);
    setBattleLog(prev => [...prev, `${gameState.enemyPokemon!.name} fainted!`, `${gameState.playerPokemon!.name} gained ${expGained} experience!`]);
    
    // Level up check
    const leveledUpPokemon = await levelUpPokemon(gameState.playerPokemon, expGained);
    const leveledUp = leveledUpPokemon.level > gameState.playerPokemon.level;
    
    if (leveledUp) {
      setBattleLog(prev => [...prev, `${gameState.playerPokemon!.name} leveled up to level ${leveledUpPokemon.level}!`]);
    }
    
    // Evolution check
    const evolution = await checkEvolution(leveledUpPokemon);
    
    updateGameState({ 
      playerPokemon: leveledUpPokemon,
      lastDefeatedPokemon: gameState.enemyPokemon,
      gamePhase: 'victory'
    });
  };

  const handleDefeat = () => {
    console.log('=== DEFEAT DEBUG ===');
    console.log('Player defeated naturally, preserving captured Pokemon:', gameState.capturedPokemon);
    
    // When defeated, preserve all captured Pokemon
    updateGameState({ 
      gamePhase: 'defeat',
      // Explicitly preserve captured Pokemon list
      capturedPokemon: [...gameState.capturedPokemon]
    });
  };

  const handleSurrender = () => {
    console.log('=== SURRENDER DEBUG ===');
    console.log('Player surrendering, preserving captured Pokemon:', gameState.capturedPokemon);
    console.log('Current player Pokemon:', gameState.playerPokemon?.name);
    
    // When surrendering, preserve all captured Pokemon and current game state
    updateGameState({ 
      gamePhase: 'defeat',
      // Explicitly preserve captured Pokemon list
      capturedPokemon: [...gameState.capturedPokemon]
    });
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

  if (loading || !gameState.playerPokemon || !gameState.enemyPokemon) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing battle...</p>
        </div>
      </div>
    );
  }

  const playerStats = calculateStats(gameState.playerPokemon, gameState.playerPokemon.level);
  const enemyStats = calculateStats(gameState.enemyPokemon, (gameState.enemyPokemon as any).level || 5);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl relative">
        {/* Surrender Button */}
        <button
          onClick={handleSurrender}
          className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
        >
          <span>🏳️</span>
          <span>Rendirse</span>
        </button>

        {/* Battle Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Wave {gameState.wave} Battle
          </h2>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <span>Pokéballs: {gameState.pokeballs}</span>
            <span>•</span>
            <span>Level: {gameState.playerPokemon.level}</span>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player Pokemon */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
              {gameState.playerPokemon.name} (You)
            </h3>
            <div className="relative mb-4">
              <img
                src={gameState.playerPokemon.sprites.back_default}
                alt={gameState.playerPokemon.name}
                className="w-32 h-32 mx-auto object-contain"
              />
            </div>
            <div className="bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(gameState.playerPokemon.currentHp / gameState.playerPokemon.maxHp) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              HP: {gameState.playerPokemon.currentHp}/{gameState.playerPokemon.maxHp}
            </p>
            <p className="text-xs text-gray-500">Level {gameState.playerPokemon.level}</p>
          </div>

          {/* Enemy Pokemon */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
              {gameState.enemyPokemon.name} (Wild)
            </h3>
            <div className="relative mb-4">
              <img
                src={gameState.enemyPokemon.sprites.front_default}
                alt={gameState.enemyPokemon.name}
                className="w-32 h-32 mx-auto object-contain"
              />
            </div>
            <div className="bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(enemyCurrentHp / enemyMaxHp) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              HP: {enemyCurrentHp}/{enemyMaxHp}
            </p>
            <p className="text-xs text-gray-500">Level {(gameState.enemyPokemon as any).level || 5}</p>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6 h-32 overflow-y-auto">
          {battleLog.map((log, index) => (
            <p key={index} className="text-sm text-gray-700 mb-1">
              {log}
            </p>
          ))}
        </div>

        {/* Move Selection */}
        {battlePhase === 'select-move' && isPlayerTurn && (
          <div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Choose your move! (Moves: {gameState.playerPokemon.learnedMoves.length})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gameState.playerPokemon.learnedMoves.length > 0 ? (
                gameState.playerPokemon.learnedMoves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => executeMove(move, gameState.playerPokemon!, gameState.enemyPokemon!, true)}
                    className={`
                      bg-gradient-to-r ${getTypeColor(move.type.name)}
                      text-white p-3 rounded-lg font-medium hover:scale-105 transition-all duration-200
                    `}
                  >
                    <div className="text-left">
                      <div className="font-bold capitalize">{move.name}</div>
                      <div className="text-xs opacity-90">
                        Power: {move.power || 'N/A'} • Type: {move.type.name}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <button
                  onClick={() => {
                    const tackleMove: Move = {
                      id: 33,
                      name: 'tackle',
                      power: 40,
                      accuracy: 100,
                      pp: 35,
                      type: { name: 'normal' },
                      damage_class: { name: 'physical' }
                    };
                    executeMove(tackleMove, gameState.playerPokemon!, gameState.enemyPokemon!, true);
                  }}
                  className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 col-span-2"
                >
                  <div className="text-center">
                    <div className="font-bold">Tackle</div>
                    <div className="text-xs opacity-90">
                      Power: 40 • Type: Normal
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Turn Indicator */}
        {battlePhase === 'animating' && (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isPlayerTurn ? 'Your turn...' : 'Enemy turn...'}
            </p>
          </div>
        )}

        {/* Debug Info */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Battle Phase: {battlePhase} | Player Turn: {isPlayerTurn ? 'Yes' : 'No'} | Moves: {gameState.playerPokemon.learnedMoves.length}
          </p>
          {battlePhase === 'select-move' && isPlayerTurn && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Should show attack buttons
            </p>
          )}
          {battlePhase !== 'select-move' && (
            <p className="text-xs text-red-600 mt-1">
              ❌ Wrong battle phase for attacks
            </p>
          )}
          {!isPlayerTurn && (
            <p className="text-xs text-red-600 mt-1">
              ❌ Not player's turn
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleScreen; 