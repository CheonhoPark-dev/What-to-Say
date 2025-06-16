import React, { useState, KeyboardEvent } from 'react';
import { TagIcon, RECOMMENDED_TAGS, MAX_TAGS } from '../constants';

interface TagInputProps {
  currentTags: string[];
  onTagsUpdate: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ currentTags, onTagsUpdate }) => {
  const [inputValue, setInputValue] = useState('');

  const canAddMoreTags = currentTags.length < MAX_TAGS;

  const attemptToAddTag = (tagValue: string) => {
    const trimmedValue = tagValue.trim();
    if (trimmedValue) {
      const newTag = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
      if (!currentTags.includes(newTag) && canAddMoreTags) {
        onTagsUpdate([...currentTags, newTag]);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
      event.preventDefault();
      attemptToAddTag(inputValue);
      setInputValue('');
    } else if (event.key === 'Backspace' && inputValue === '' && currentTags.length > 0) {
      onTagsUpdate(currentTags.slice(0, -1));
    }
  };
  
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text');
    const pastedTags = pasteData.split(/[\s,]+/).map(tag => tag.trim()).filter(tag => tag.length > 0);
    pastedTags.forEach(tag => attemptToAddTag(tag));
  };

  const removeTag = (tagToRemove: string) => {
    onTagsUpdate(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleRecommendedTagClick = (recommendedTag: string) => {
    attemptToAddTag(recommendedTag);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tag-input" className="block text-sm font-medium text-slate-300 flex items-center">
          <TagIcon className="w-4 h-4 mr-2 text-slate-400" />
          태그 추가 (선택 사항, 예: #친절하게 #데이트)
        </label>
        <div className="mt-1 flex flex-wrap gap-2 p-2 border border-slate-600 rounded-md bg-slate-700 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
          {currentTags.map(tag => (
            <span key={tag} className="flex items-center px-2 py-1 bg-sky-600 text-white text-xs font-medium rounded-full animate-fadeIn">
              {tag}
              <button
                type="button"
                className="ml-1.5 text-sky-200 hover:text-white focus:outline-none"
                onClick={() => removeTag(tag)}
                aria-label={`태그 ${tag} 제거`}
              >
                &times;
              </button>
            </span>
          ))}
          <input
            id="tag-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={canAddMoreTags ? (currentTags.length === 0 ? "태그 입력 후 Enter 또는 스페이스" : "태그 추가...") : `최대 ${MAX_TAGS}개 태그`}
            className="flex-grow bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none text-sm p-1 min-w-[150px]"
            disabled={!canAddMoreTags}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter, 스페이스, 또는 쉼표(,)로 태그를 구분하여 입력하세요. (현재 {currentTags.length}/{MAX_TAGS}개)</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">추천 태그</h4>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDED_TAGS.map(recTag => {
            const isAdded = currentTags.includes(recTag);
            const isDisabled = isAdded || !canAddMoreTags;
            return (
              <button
                key={recTag}
                type="button"
                onClick={() => handleRecommendedTagClick(recTag)}
                disabled={isDisabled}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-150
                  ${isAdded 
                    ? 'bg-sky-700 text-sky-300 cursor-default' 
                    : isDisabled // Not added, but limit reached
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50'
                  }
                `}
                aria-pressed={isAdded}
                aria-label={isAdded ? `${recTag} 태그 선택됨` : `${recTag} 태그 추가하기`}
              >
                {recTag}
              </button>
            );
          })}
        </div>
         {!canAddMoreTags && <p className="text-xs text-amber-400 mt-2">태그는 최대 {MAX_TAGS}개까지 추가할 수 있습니다.</p>}
      </div>
    </div>
  );
};