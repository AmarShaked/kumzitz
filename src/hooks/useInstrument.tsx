import { createContext, useContext, useState } from 'react';

export type Instrument = 'guitar' | 'ukulele' | 'piano';

type InstrumentContextType = {
  instrument: Instrument;
  setInstrument: (i: Instrument) => void;
};

const InstrumentContext = createContext<InstrumentContextType | undefined>(undefined);

export function InstrumentProvider({ children }: { children: React.ReactNode }) {
  const [instrument, setInstrument] = useState<Instrument>(() => {
    return (localStorage.getItem('kumzitz-instrument') as Instrument) || 'guitar';
  });

  const set = (i: Instrument) => {
    setInstrument(i);
    localStorage.setItem('kumzitz-instrument', i);
  };

  return (
    <InstrumentContext.Provider value={{ instrument, setInstrument: set }}>
      {children}
    </InstrumentContext.Provider>
  );
}

export function useInstrument() {
  const ctx = useContext(InstrumentContext);
  if (!ctx) throw new Error('useInstrument must be used within InstrumentProvider');
  return ctx;
}
