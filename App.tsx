
import React, { useState, useCallback, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AnalysisResult, UploadedImageInfo } from './types';
import { analyzeConversation } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploadArea } from './components/ImageUploadArea';
import { TagInput } from './components/TagInput';
import { AnalysisResultsDisplay } from './components/AnalysisResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PrivacyNotice } from './components/PrivacyNotice';
import { ActionButton } from './components/ActionButton';
import { ImageModal } from './components/ImageModal'; // Import the new modal component
import { DEFAULT_TAGS, RefreshIcon, ExclamationCircleIcon, CheckCircleIcon, MAX_IMAGES } from './constants';

// Helper to generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'upload' | 'results'>('upload');
  const [uploadedImages, setUploadedImages] = useState<UploadedImageInfo[]>([]);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);
  const [modalImageData, setModalImageData] = useState<string | null>(null); // State for modal - using base64 data

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Return only the base64 data part
      };
      reader.onerror = (err) => reject(err);
    });
  }, []);

  const handleFilesSelected = useCallback(async (files: FileList) => {
    setError(null);
    const newImageInfos: UploadedImageInfo[] = [];
    const currentImageCount = uploadedImages.length;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 제한

    if (files.length + currentImageCount > MAX_IMAGES) {
      setError(`최대 ${MAX_IMAGES}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 파일 형식 검증
      if (!file.type.startsWith('image/')) {
        setError(`'${file.name}' 파일은 이미지 형식이 아닙니다. PNG, JPG, JPEG 파일만 가능합니다.`);
        continue; 
      }
      
      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        setError(`'${file.name}' 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`);
        continue;
      }
      
      // 중복 파일 검증
      if (uploadedImages.find(img => img.file.name === file.name && img.file.size === file.size)) {
        setError(`'${file.name}' 파일은 이미 추가된 파일입니다.`);
        continue;
      }

      try {
        // 이미지 유효성 검증을 위한 Image 객체 생성
        const tempUrl = URL.createObjectURL(file);
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            URL.revokeObjectURL(tempUrl);
            reject(new Error('이미지 파일이 손상되었거나 유효하지 않습니다.'));
          };
          img.src = tempUrl;
        });
        
        URL.revokeObjectURL(tempUrl);
        
        const base64Data = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);
        
        newImageInfos.push({
          id: generateId(),
          file,
          previewUrl,
          base64Data,
          mimeType: file.type,
        });
      } catch (e: any) {
        console.error("Error processing file:", file.name, e);
        setError(`'${file.name}' 파일 처리 중 오류 발생: ${e.message || '알 수 없는 오류'}`);
      }
    }
    setUploadedImages(prev => [...prev, ...newImageInfos].slice(0, MAX_IMAGES));
  }, [fileToBase64, uploadedImages]);

  const handleRemoveImage = useCallback((idToRemove: string) => {
    setUploadedImages(prev => prev.filter(img => {
      if (img.id === idToRemove) {
        URL.revokeObjectURL(img.previewUrl); 
        return false;
      }
      return true;
    }));
  }, []);

  const handleReorderImage = useCallback((id: string, direction: 'up' | 'down') => {
    setUploadedImages(prev => {
      const images = [...prev];
      const index = images.findIndex(img => img.id === id);
      if (index === -1) return images;

      if (direction === 'up' && index > 0) {
        [images[index - 1], images[index]] = [images[index], images[index - 1]];
      } else if (direction === 'down' && index < images.length - 1) {
        [images[index + 1], images[index]] = [images[index], images[index + 1]];
      }
      return images;
    });
  }, []);


  const handleTagsUpdate = useCallback((updatedTags: string[]) => {
    setTags(updatedTags);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError("먼저 대화 스크린샷을 하나 이상 업로드해주세요.");
      return;
    }
    if (!process.env.API_KEY) {
        setError("API 키가 설정되지 않았습니다. 관리자에게 문의하세요.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const imageApiData = uploadedImages.map(img => ({ base64: img.base64Data, mimeType: img.mimeType }));

    try {
      const result = await analyzeConversation(imageApiData, tags);
      setAnalysisResult(result);
      setCurrentPage('results');
    } catch (e: any) {
      console.error("Analysis error:", e);
      setError(e.message || "분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImages, tags]);

  const handleStartOver = useCallback(() => {
    setCurrentPage('upload');
    uploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl)); 
    setUploadedImages([]);
    setTags(DEFAULT_TAGS);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setCopySuccessMessage(null);
    setModalImageData(null); // Close modal on start over
  }, [uploadedImages]);

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccessMessage("답변이 복사되었습니다!");
      setTimeout(() => setCopySuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError("텍스트 복사에 실패했습니다.");
      setTimeout(() => setError(null), 2000);
    }
  }, []);

  const handleOpenImageModal = useCallback((imageUrl: string) => {
    // If it's already a base64 data URL, use it directly
    if (imageUrl.startsWith('data:')) {
      setModalImageData(imageUrl);
    } else {
      // Find the image info by previewUrl and use its base64 data
      const imageInfo = uploadedImages.find(img => img.previewUrl === imageUrl);
      if (imageInfo) {
        setModalImageData(`data:${imageInfo.mimeType};base64,${imageInfo.base64Data}`);
      }
    }
  }, [uploadedImages]);

  const handleCloseImageModal = useCallback(() => {
    setModalImageData(null);
  }, []);
  
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [uploadedImages]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseImageModal();
      }
    };
    if (modalImageData) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [modalImageData, handleCloseImageModal]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <Header />
      <main className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center py-8">
        {isLoading && <LoadingSpinner />}

        {error && !isLoading && (
          <div className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-xl flex items-center z-50 animate-fadeIn">
            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-xl font-bold">&times;</button>
          </div>
        )}

        {copySuccessMessage && !isLoading && (
           <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-xl flex items-center z-50 animate-fadeIn">
            <CheckCircleIcon className="h-6 w-6 mr-2" />
            <span>{copySuccessMessage}</span>
          </div>
        )}

        {!isLoading && currentPage === 'upload' && (
          <div className="w-full space-y-8 p-6 bg-slate-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md">
            <ImageUploadArea
              uploadedImages={uploadedImages}
              onFilesSelected={handleFilesSelected}
              onRemoveImage={handleRemoveImage}
              onReorderImage={handleReorderImage}
              onImageClick={handleOpenImageModal} // Pass handler
              maxImages={MAX_IMAGES}
            />
            <TagInput currentTags={tags} onTagsUpdate={handleTagsUpdate} />
            <ActionButton
              onClick={handleAnalyze}
              disabled={uploadedImages.length === 0 || isLoading}
              className="w-full"
              variant="primary"
            >
              AI 분석 요청하기 ({uploadedImages.length}/{MAX_IMAGES}개 이미지)
            </ActionButton>
          </div>
        )}

        {!isLoading && currentPage === 'results' && analysisResult && (
          <div className="w-full space-y-8 p-6">
            <AnalysisResultsDisplay 
              result={analysisResult} 
              onCopyText={handleCopyText} 
              originalImagePreviews={uploadedImages.map(img => `data:${img.mimeType};base64,${img.base64Data}`)}
              onImageClick={handleOpenImageModal} // Pass handler
            />
            <ActionButton
              onClick={handleStartOver}
              variant="secondary"
              className="w-full flex items-center justify-center"
              icon={<RefreshIcon className="w-5 h-5 mr-2" />}
            >
              새로 시작하기
            </ActionButton>
          </div>
        )}
      </main>
      <PrivacyNotice />
      <Footer />
      {modalImageData && (
        <ImageModal 
          imageUrl={modalImageData} 
          onClose={handleCloseImageModal} 
        />
      )}
      <Analytics />
    </div>
  );
};

export default App;
