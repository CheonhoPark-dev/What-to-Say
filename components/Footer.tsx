
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-2xl py-6 text-center text-xs text-slate-500">
      <p>&copy; {new Date().getFullYear()} 뭐라해? (What-to-Say?). All rights reserved (not really, it's a demo!).</p>
      <p>Powered by AI magic.</p>
    </footer>
  );
};
