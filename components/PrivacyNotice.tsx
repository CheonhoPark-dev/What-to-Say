
import React from 'react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mt-8 p-3 bg-slate-800 bg-opacity-50 rounded-lg text-center text-xs text-slate-400 shadow">
      <p>
        <strong>개인정보 보호 안내:</strong> 업로드하신 이미지는 AI 분석 목적으로만 사용되며, 분석 완료 후 서버에 저장되지 않습니다.
        AI가 생성한 결과는 참고용이며, 항상 완벽하지 않을 수 있습니다.
      </p>
    </div>
  );
};
