
import React from 'react';
import { AnalysisResult } from '../types';
import { ClipboardCopyIcon, LightbulbIcon, SparklesIcon } from '../constants';
import { ActionButton } from './ActionButton';

interface AnalysisResultsDisplayProps {
  result: AnalysisResult;
  onCopyText: (text: string) => void;
  originalImagePreviews: string[] | null; 
  onImageClick: (imageUrl: string) => void; // New prop
}

export const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({ result, onCopyText, originalImagePreviews, onImageClick }) => {
  return (
    <div className="w-full space-y-8" style={fadeInStyles}>
      {originalImagePreviews && originalImagePreviews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-300 mb-3">원본 대화 이미지 ({originalImagePreviews.length}개) - 클릭 시 확대</h3>
          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
            {originalImagePreviews.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Original conversation ${index + 1}`} 
                className="max-h-48 md:max-h-60 object-contain rounded-lg shadow-lg border-2 border-slate-700 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageClick(url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onImageClick(url);}}
                aria-label={`원본 대화 이미지 ${index + 1} 크게 보기`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  console.error('Analysis result image failed to load:', index);
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'block';
                }}
              />
            ))}
          </div>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-sky-400 mb-4 flex items-center">
          <SparklesIcon className="w-7 h-7 mr-2" />
          추천 답변
        </h2>
        <div className="space-y-3">
          {result.suggestedReplies.length > 0 ? (
            result.suggestedReplies.map((reply, index) => (
              <div key={reply.id || index} className="p-4 bg-slate-800 rounded-lg shadow-md flex justify-between items-center transition-all hover:bg-slate-700">
                <p className="text-slate-200 text-sm md:text-base">{reply.text}</p>
                <ActionButton
                  onClick={() => onCopyText(reply.text)}
                  variant="secondary"
                  size="sm"
                  className="ml-3 flex-shrink-0"
                  icon={<ClipboardCopyIcon className="w-4 h-4" />}
                  aria-label={`추천 답변 ${index + 1} 복사하기`}
                >
                  복사
                </ActionButton>
              </div>
            ))
          ) : (
            <p className="text-slate-400">추천 답변을 생성하지 못했습니다.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-amber-400 mb-4 flex items-center">
          <LightbulbIcon className="w-7 h-7 mr-2" />
          대화 흐름 추천
        </h2>
        <div className="p-4 bg-slate-800 rounded-lg shadow-md">
          <p className="text-slate-300 whitespace-pre-line text-sm md:text-base leading-relaxed">
            {result.conversationFlow || "대화 흐름에 대한 조언을 생성하지 못했습니다."}
          </p>
        </div>
      </section>
    </div>
  );
};

// Add fade-in animation using inline styles to avoid CORS issues with CDN
const fadeInStyles = {
  animation: 'fadeIn 0.5s ease-out forwards'
};

// Add keyframes using a style element
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('fadeInKeyframes');
  if (!existingStyle) {
    const styleEl = document.createElement('style');
    styleEl.id = 'fadeInKeyframes';
    styleEl.textContent = `
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  }
}

// Minimal scrollbar styling for Webkit/Blink based browsers (Chrome, Edge, Safari)
// For Firefox, you'd use scrollbar-color and scrollbar-width (Tailwind plugin helps here)
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent; /* Assuming slate-800 is a dark color */
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #475569; /* slate-600 approx */
    border-radius: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #334155; /* slate-700 approx */
  }
`;

if (typeof document !== 'undefined' && document.createElement) {
  const styleEl = document.createElement('style');
  styleEl.textContent = scrollbarStyles;
  document.head.appendChild(styleEl);
}
