
import React from 'react';
import { APP_TITLE, SparklesIcon } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-2xl py-8 text-center relative">
      <div className="animate-fadeIn">
        <h1 className="text-5xl font-bold gradient-text flex items-center justify-center mb-4">
          <SparklesIcon className="w-12 h-12 mr-4 text-sky-400 animate-sparkle" />
          {APP_TITLE}
        </h1>
        <div className="relative">
          <p className="text-slate-300 text-lg font-medium mb-1">AI가 제안하는 센스있는 다음 대화</p>
          <p className="text-slate-500 text-sm">스크린샷을 업로드하고 맞춤형 답변을 받아보세요</p>
          
          {/* Decorative line */}
          <div className="mt-4 flex items-center justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent w-48"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
