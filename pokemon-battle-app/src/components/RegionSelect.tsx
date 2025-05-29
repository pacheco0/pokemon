'use client';

import React from 'react';
import { REGIONS } from '@/types/pokemon';

interface RegionSelectProps {
  selectedRegion: 'kanto' | 'johto' | 'hoenn' | 'sinnoh';
  onRegionSelect: (region: 'kanto' | 'johto' | 'hoenn' | 'sinnoh') => void;
}

const RegionSelect: React.FC<RegionSelectProps> = ({ selectedRegion, onRegionSelect }) => {
  const regionImages = {
    kanto: '/images/kanto.svg',
    johto: '/images/johto.svg',
    hoenn: '/images/hoenn.svg',
    sinnoh: '/images/sinnoh.svg'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Choose Your Region
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(REGIONS).map(([key, region]) => (
            <div
              key={key}
              className={`
                relative cursor-pointer transition-all duration-300 transform hover:scale-105
                ${selectedRegion === key 
                  ? 'ring-4 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-lg'
                }
              `}
              onClick={() => onRegionSelect(key as 'kanto' | 'johto' | 'hoenn' | 'sinnoh')}
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {region.name.charAt(0)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {region.name}
                </h3>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Starters:</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    {region.starters.map((starter) => (
                      <span
                        key={starter.id}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs capitalize"
                      >
                        {starter.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedRegion === key && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={() => onRegionSelect(selectedRegion)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Continue to Starter Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionSelect; 