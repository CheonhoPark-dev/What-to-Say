
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, XCircleIcon, ArrowUpIcon, ArrowDownIcon } from '../constants';
import { UploadedImageInfo } from '../types';
import { ActionButton } from './ActionButton';


interface ImageUploadAreaProps {
  uploadedImages: UploadedImageInfo[];
  onFilesSelected: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  onReorderImage: (id: string, direction: 'up' | 'down') => void;
  onImageClick: (imageUrl: string) => void; // New prop for image click
  maxImages: number;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ 
  uploadedImages, 
  onFilesSelected, 
  onRemoveImage, 
  onReorderImage,
  onImageClick,
  maxImages
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
      event.target.value = ''; 
    }
  };

  const handleAreaClick = () => {
    if (uploadedImages.length < maxImages) {
      fileInputRef.current?.click();
    } else {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadedImages.length < maxImages) {
      setIsDragging(true);
    }
  }, [uploadedImages.length, maxImages]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadedImages.length < maxImages && !isDragging) setIsDragging(true);
  }, [isDragging, uploadedImages.length, maxImages]);


  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadedImages.length + e.dataTransfer.files.length <= maxImages) {
        const validFiles = Array.from(e.dataTransfer.files).filter(file => 
          file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg"
        );
        if (validFiles.length !== e.dataTransfer.files.length) {
          alert("PNG, JPG, JPEG 파일만 업로드 가능합니다. 유효하지 않은 파일은 제외됩니다.");
        }
        if (validFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach(file => dataTransfer.items.add(file));
          onFilesSelected(dataTransfer.files);
        }
      } else {
        alert(`최대 ${maxImages}개까지 업로드 가능합니다. 현재 ${uploadedImages.length}개 선택됨.`);
      }
    }
  }, [onFilesSelected, uploadedImages.length, maxImages]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="image-upload-input" className="block text-sm font-medium text-slate-300 mb-1">
          대화 스크린샷 업로드 (최대 {maxImages}개)
        </label>
        <p className="text-xs text-slate-400">
          가장 오래된 대화가 위로, 가장 최근 대화가 아래로 오도록 순서를 정해주세요. 클릭 시 이미지 확대.
        </p>
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="space-y-3 p-3 bg-slate-700/50 rounded-md max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
          {uploadedImages.map((imgInfo, index) => (
            <div key={imgInfo.id} className="bg-slate-800 p-2 rounded-md shadow-sm flex items-center justify-between animate-fadeIn">
              <div 
                className="flex items-center space-x-2 flex-grow min-w-0 cursor-pointer hover:bg-slate-700/50 rounded p-1"
                onClick={() => onImageClick(imgInfo.previewUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onImageClick(imgInfo.previewUrl);}}
                aria-label={`이미지 ${imgInfo.file.name} 크게 보기`}
              >
                <img 
                  src={imgInfo.previewUrl} 
                  alt={`Preview ${imgInfo.file.name}`} 
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.error('Image failed to load:', imgInfo.file.name);
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'block';
                  }}
                />
                <span className="text-xs text-slate-300 truncate" title={imgInfo.file.name}>{index+1}. {imgInfo.file.name}</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                <ActionButton
                  size="sm"
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onReorderImage(imgInfo.id, 'up');}}
                  disabled={index === 0}
                  aria-label="위로 이동"
                  className="p-1"
                >
                  <ArrowUpIcon className="w-3 h-3" />
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onReorderImage(imgInfo.id, 'down');}}
                  disabled={index === uploadedImages.length - 1}
                  aria-label="아래로 이동"
                  className="p-1"
                >
                  <ArrowDownIcon className="w-3 h-3" />
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="danger"
                  onClick={(e) => { e.stopPropagation(); onRemoveImage(imgInfo.id);}}
                  aria-label="이미지 제거"
                  className="p-1"
                >
                  <XCircleIcon className="w-4 h-4" />
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length < maxImages && (
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-sky-500 bg-sky-900 bg-opacity-30' : 'border-slate-600 border-dashed'} rounded-md cursor-pointer hover:border-sky-500 transition-colors duration-200`}
          onClick={handleAreaClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          aria-label={uploadedImages.length === 0 ? "이미지 업로드 영역, 클릭 또는 드래그하여 파일 추가" : "이미지 추가 영역, 클릭 또는 드래그하여 파일 추가"}
        >
          <div className="space-y-1 text-center py-4">
            <UploadIcon className="mx-auto h-10 w-10 text-slate-400" />
            <div className="flex text-sm text-slate-400">
              <p className="pl-1">파일 드래그 또는 클릭하여 추가 ({uploadedImages.length}/{maxImages})</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, JPEG</p>
          </div>
          <input
            id="image-upload-input" 
            name="image-upload-input"
            type="file"
            className="sr-only"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            multiple 
            disabled={uploadedImages.length >= maxImages}
          />
        </div>
      )}
      {uploadedImages.length >= maxImages && (
        <p className="text-sm text-amber-400 text-center">이미지 업로드 최대 개수 ({maxImages}개)에 도달했습니다.</p>
      )}
    </div>
  );
};
