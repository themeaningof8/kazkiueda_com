import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface JumbotronProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export function Jumbotron({
  title,
  subtitle,
  description,
  className,
}: JumbotronProps) {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline();

      // 初期状態設定
      gsap.set(
        [titleRef.current, subtitleRef.current, descriptionRef.current],
        {
          opacity: 0,
          y: 30,
        }
      );

      // アニメーション実行
      timeline
        .to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.4'
        )
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3'
        );

      return () => {
        timeline.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative min-h-[60vh] flex items-center justify-center',
        'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
        'overflow-hidden',
        className
      )}
    >
      <div className="container mx-auto px-4 text-center">
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          {title}
        </h1>

        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-4 text-xl md:text-2xl text-slate-600 dark:text-slate-300"
          >
            {subtitle}
          </p>
        )}

        {description && (
          <p
            ref={descriptionRef}
            className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"
          >
            {description}
          </p>
        )}
      </div>

      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl" />
      </div>
    </section>
  );
}
