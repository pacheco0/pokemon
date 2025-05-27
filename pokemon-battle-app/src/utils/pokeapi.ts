import axios from 'axios';
import { Pokemon, Move, EvolutionChain } from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const pokeAPI = {
  async getPokemon(idOrName: string | number): Promise<Pokemon> {
    const response = await axios.get(`${BASE_URL}/pokemon/${idOrName}`);
    return response.data;
  },

  async getMove(idOrName: string | number): Promise<Move> {
    const response = await axios.get(`${BASE_URL}/move/${idOrName}`);
    return response.data;
  },

  async getEvolutionChain(id: number): Promise<EvolutionChain> {
    const response = await axios.get(`${BASE_URL}/evolution-chain/${id}`);
    return response.data;
  },

  async getSpecies(idOrName: string | number) {
    const response = await axios.get(`${BASE_URL}/pokemon-species/${idOrName}`);
    return response.data;
  },

  async getRandomPokemon(maxId: number = 1010): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    return this.getPokemon(randomId);
  }
};

export const getEvolutionChainId = (speciesUrl: string): number => {
  const parts = speciesUrl.split('/');
  return parseInt(parts[parts.length - 2]);
};

export const extractIdFromUrl = (url: string): number => {
  const parts = url.split('/');
  return parseInt(parts[parts.length - 2]);
}; 