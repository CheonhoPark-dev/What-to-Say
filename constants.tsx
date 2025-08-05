import React from 'react';
import {
  ArrowUpTrayIcon,
  TagIcon as HeroTagIcon,
  ClipboardDocumentIcon,
  LightBulbIcon as HeroLightBulbIcon,
  SparklesIcon as HeroSparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon as HeroCheckCircleIcon,
  ExclamationCircleIcon as HeroExclamationCircleIcon,
  XCircleIcon as HeroXCircleIcon,
  ArrowUpIcon as HeroArrowUpIcon,
  ArrowDownIcon as HeroArrowDownIcon,
} from '@heroicons/react/24/outline';

export const APP_TITLE = "뭐라해? (What-to-Say?)";
export const MAX_IMAGES = 5; // Maximum number of images allowed

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = ArrowUpTrayIcon;

export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroTagIcon;

export const ClipboardCopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = ClipboardDocumentIcon;

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroLightBulbIcon;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroSparklesIcon;

export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = ArrowPathIcon;

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroCheckCircleIcon;

export const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroExclamationCircleIcon;

export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroXCircleIcon;

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroArrowUpIcon;

export const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = HeroArrowDownIcon;


export const DEFAULT_TAGS = ['#친절하게', '#일상대화', '#긍정적으로'];

export const RECOMMENDED_TAGS = [
  '#오랜만연락', '#약속잡기', '#남자친구에게', '#여자친구에게', 
  '#썸타는중', '#사과하기', '#단호하게', '#회사동료', 
  '#친구사이', '#새로운주제', '#축하하기', "#찐친", "#이모지사용😄"
];

export const MAX_TAGS = 10; // Maximum number of tags allowed (including user-added and recommended)
