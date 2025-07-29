import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// 테스트 광고 단위 ID (실제 배포시에는 실제 ID로 변경)
const AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111', // 테스트 배너 ID
  interstitial: 'ca-app-pub-3940256099942544/1033173712', // 테스트 전면 ID
  reward: 'ca-app-pub-3940256099942544/1712485313' // 대안 보상형 테스트 ID
};

export class AdMobService {
  private static initialized = false;

  // AdMob 초기화
  static async initialize() {
    if (this.initialized) return;
    
    try {
      await AdMob.initialize({
        testingDevices: [], // 개발 중 테스트 기기 ID
        initializeForTesting: true
      });
      this.initialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }



  // 배너 광고 표시
  static async showBannerAd() {
    try {
      const options: BannerAdOptions = {
        adId: AD_UNITS.banner,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true // 개발 중에는 true
      };
      
      await AdMob.showBanner(options);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  }

  // 배너 광고 숨기기
  static async hideBannerAd() {
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  // 전면 광고 준비
  static async prepareInterstitialAd() {
    try {
      const options = {
        adId: AD_UNITS.interstitial,
        isTesting: true
      };
      
      await AdMob.prepareInterstitial(options);
      console.log('Interstitial ad prepared');
    } catch (error) {
      console.error('Failed to prepare interstitial ad:', error);
    }
  }

  // 전면 광고 표시
  static async showInterstitialAd() {
    try {
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown');
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    }
  }

  // 보상형 광고 준비
  static async prepareRewardAd() {
    try {
      const options = {
        adId: AD_UNITS.reward,
        isTesting: true
      };
      
      await AdMob.prepareRewardVideoAd(options);
      console.log('Reward ad prepared');
    } catch (error) {
      console.error('Failed to prepare reward ad:', error);
    }
  }

  // 보상형 광고 표시 (개선된 버전)
  static async showRewardAd(): Promise<boolean> {
    try {
      console.log('🎬 Starting reward ad...');
      
      // 광고 준비 상태 확인
      console.log('⏳ Preparing reward ad...');
      await this.prepareRewardAd();
      
      // 광고 준비 완료까지 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('▶️ Showing reward ad...');
      
      // 타임아웃과 함께 광고 표시
      const result = await Promise.race([
        AdMob.showRewardVideoAd(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Ad timeout')), 60000)
        )
      ]);
      
      console.log('✅ Reward ad completed:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to show reward ad:', error);
      
      // 상세한 오류 정보 로깅
      if (error && typeof error === 'object') {
        if ('message' in error) {
          console.log('📝 Error message:', error.message);
        }
        if ('code' in error) {
          console.log('🔢 Error code:', error.code);
        }
      }
      
      return false;
    }
  }
} 