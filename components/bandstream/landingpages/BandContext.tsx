import { createContext, useContext } from 'react';

interface BandContextType {
  // Add your band-related properties here, for example:
  id?: string;
  name?: string;
  // ... other band properties
}

export const BandContext = createContext<BandContextType | null>(null);
export const useBand = () => useContext(BandContext);