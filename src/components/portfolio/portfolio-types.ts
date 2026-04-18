import type { ImageMetadata } from 'astro';

export type CaseStudyPreset = '01' | '02' | '03' | '04';

export interface CaseStudy {
  preset: CaseStudyPreset;
  tags: string[];
  title: string;
  description: string;
  roleBadge: string;
  outcomeLabel: string;
  outcomeTitle: string;
  rowIndex: number;
  sectionId: string;
  href?: string;
  linkLabel?: string;
  heroImage?: ImageMetadata;
  /** 一覧のカード背景。省略時は `heroImage` */
  listingImage?: ImageMetadata;
  heroAlt?: string;
  transitionName?: string;
}

export interface FooterLink {
  label: string;
  href?: string;
}

/** Paper「Case Study Detail」系のコンパクトヘッダ（詳細ページ専用） */
export interface CaseStudyDetailHeaderProps {
  brand: string;
  caseStudyTitle: string;
  backHref?: string;
  backLabel?: string;
  aboutHref: string;
  aboutLabel?: string;
  /** ヘッダ直下に固定表示するタグ（ケーススタディ詳細） */
  tags?: string[];
}

/** Paper「Portfolio Page」一覧用のコンパクトヘッダ */
export interface PortfolioListingHeaderProps {
  brand: string;
  /** ヘッダ2行目（例: 「ポートフォリオ」） */
  tagline: string;
  aboutHref: string;
  aboutLabel?: string;
}
