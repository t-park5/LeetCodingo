import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import mascot from '@/assets/mascot.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'enter' | 'text' | 'exit'>('enter');

  useEffect(() => {
    // 마스코트 등장 (0.4s) → 텍스트 등장 (1.2s) → 페이드아웃 (2.6s) → 완료 (3.2s)
    const t1 = setTimeout(() => setPhase('text'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2400);
    const t3 = setTimeout(onFinish, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      style={{
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.6s ease-in-out' : 'none',
      }}
    >
      {/* 마스코트 이미지 */}
      <div
        style={{
          transform: phase === 'enter' ? 'scale(0.5) translateY(30px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
        }}
      >
        <img
          src={mascot}
          alt="LeetCodingo Mascot"
          className="w-[600px] h-[600px] object-contain select-none"
          draggable={false}
        />
      </div>

      {/* 로고 텍스트 */}
      <div
        className="mt-6 text-center"
        style={{
          opacity: phase === 'text' || phase === 'exit' ? 1 : 0,
          transform: phase === 'text' || phase === 'exit' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <h1 className="text-8xl font-extrabold tracking-tight text-[#ff6b00]">
          LeetCodingo
          <span className="text-gray-800">!</span>
        </h1>
        <p className="mt-3 text-xl text-gray-500 font-semibold">{t('splash.subtitle')}</p>
      </div>

      {/* 하단 점 인디케이터 */}
      <div className="absolute bottom-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-300"
            style={{
              backgroundColor:
                (phase === 'enter' && i === 0) ||
                (phase === 'text' && i === 1) ||
                (phase === 'exit' && i === 2)
                  ? 'var(--color-primary)'
                  : undefined,
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
