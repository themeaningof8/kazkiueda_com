import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';

interface JumbotronProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Jumbotron({
  title,
  subtitle,
  ctaText = '作品を見る',
  ctaLink = '/portfolio',
}: JumbotronProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;

    if (!container || !title || !subtitle || !cta) return;

    // 初期状態を設定
    gsap.set([title, subtitle, cta], {
      opacity: 0,
      y: 50,
    });

    // アニメーションのタイムライン
    const tl = gsap.timeline();

    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    })
      .to(
        subtitle,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5'
      )
      .to(
        cta,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.3'
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[600px] items-center justify-center bg-gradient-to-br from-background to-muted px-4"
    >
      <div className="container mx-auto text-center">
        <h1
          ref={titleRef}
          className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
        >
          {title}
        </h1>
        <p
          ref={subtitleRef}
          className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          {subtitle}
        </p>
        <div ref={ctaRef}>
          <Button asChild size="lg" className="px-8 py-3 text-base">
            <a href={ctaLink}>{ctaText}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
