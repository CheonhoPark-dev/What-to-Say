
import React from 'react';
import { APP_TITLE, SparklesIcon } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-2xl py-6 text-center">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center">
        <SparklesIcon className="w-10 h-10 mr-3 text-sky-400" />
        {APP_TITLE}
      </h1>
      <p className="text-slate-400 mt-2 text-sm">AI가 제안하는 센스있는 다음 대화</p>
    </header>
  );
};
