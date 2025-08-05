
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

      {result.conversationTone && (
        <section>
          <h2 className="text-xl font-semibold text-purple-400 mb-3 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2" />
            대화 톤 분석
          </h2>
          <div className="p-4 glass-dark rounded-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">말투:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.conversationTone.formality === 'informal' 
                    ? 'bg-sky-500/20 text-sky-300' 
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {result.conversationTone.formality === 'informal' ? '반말/친근함' : '존댓말/정중함'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">이모티콘:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.conversationTone.emojiUsage === 'high' ? 'bg-yellow-500/20 text-yellow-300' :
                  result.conversationTone.emojiUsage === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {result.conversationTone.emojiUsage === 'high' ? '자주 사용' :
                   result.conversationTone.emojiUsage === 'medium' ? '보통' : '적게 사용'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">분위기:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  {result.conversationTone.style}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-sky-400 mb-4 flex items-center">
          <SparklesIcon className="w-7 h-7 mr-2" />
          추천 답변
        </h2>
        <div className="space-y-4">
          {result.suggestedReplies.length > 0 ? (
            result.suggestedReplies.map((reply, index) => (
              <div key={reply.id || index} className="p-5 glass-dark rounded-xl border border-white/10 hover-lift transition-all duration-300 group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-sky-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">추천 답변</span>
                    </div>
                    <p className="text-slate-100 text-base leading-relaxed font-medium">{reply.text}</p>
                  </div>
                  <ActionButton
                    onClick={() => onCopyText(reply.text)}
                    variant="primary"
                    size="sm"
                    className="flex-shrink-0 opacity-80 group-hover:opacity-100"
                    icon={<ClipboardCopyIcon className="w-4 h-4" />}
                    aria-label={`추천 답변 ${index + 1} 복사하기`}
                  >
                    복사
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 glass-dark rounded-xl border border-red-400/30 text-center">
              <p className="text-red-300">추천 답변을 생성하지 못했습니다.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-amber-400 mb-4 flex items-center">
          <LightbulbIcon className="w-7 h-7 mr-2" />
          대화 흐름 추천
        </h2>
        <div className="p-6 glass-dark rounded-xl border border-white/10 hover-lift">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
              <LightbulbIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-300 font-medium mb-2">전략적 조언</h3>
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                {result.conversationFlow || "대화 흐름에 대한 조언을 생성하지 못했습니다."}
              </p>
            </div>
          </div>
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
