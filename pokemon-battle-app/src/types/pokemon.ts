export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: {
        name: string;
      };
    }>;
  }>;
  species: {
    url: string;
  };
}

export interface Move {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: {
    name: string;
  };
  damage_class: {
    name: string;
  };
}

export interface PlayerPokemon extends Pokemon {
  level: number;
  currentHp: number;
  maxHp: number;
  experience: number;
  experienceToNext: number;
  learnedMoves: Move[];
}

export interface GameState {
  playerPokemon: PlayerPokemon | null;
  enemyPokemon: Pokemon | null;
  lastDefeatedPokemon: Pokemon | null;
  wave: number;
  pokeballs: number;
  selectedRegion: 'kanto' | 'johto' | 'hoenn';
  gamePhase: 'region-select' | 'starter-select' | 'battle' | 'victory' | 'defeat' | 'capture';
}

export interface EvolutionChain {
  id: number;
  chain: {
    evolves_to: Array<{
      evolution_details: Array<{
        min_level: number | null;
      }>;
      species: {
        name: string;
        url: string;
      };
      evolves_to: Array<any>;
    }>;
    species: {
      name: string;
      url: string;
    };
  };
}

export interface Region {
  name: string;
  starters: Array<{
    id: number;
    name: string;
  }>;
}

export const REGIONS: Record<string, Region> = {
  kanto: {
    name: 'Kanto',
    starters: [
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
      { id: 7, name: 'squirtle' }
    ]
  },
  johto: {
    name: 'Johto',
    starters: [
      { id: 152, name: 'chikorita' },
      { id: 155, name: 'cyndaquil' },
      { id: 158, name: 'totodile' }
    ]
  },
  hoenn: {
    name: 'Hoenn',
    starters: [
      { id: 252, name: 'treecko' },
      { id: 255, name: 'torchic' },
      { id: 258, name: 'mudkip' }
    ]
  }
}; 