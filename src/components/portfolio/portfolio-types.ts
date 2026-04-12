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
  imageSrc: string;
  imageAlt: string;
  sectionId: string;
  href?: string;
  linkLabel?: string;
  transitionName?: string;
}

export interface CaseStudyNavItem {
  anchorId: string;
  label: string;
  /** モバイルチップ背面に重ねる番号（例: コレクションの `preset`） */
  mono?: string;
  /** 省略時は `#${anchorId}`（詳細ページなどで `/portfolio#…` を渡す） */
  href?: string;
}

export interface FooterLink {
  label: string;
  href?: string;
}

export interface PortfolioTopNavProps {
  brand: string;
  workHref: string;
  aboutHref: string;
  contactHref: string;
  ctaHref: string;
  ctaLabel: string;
  /** 一覧・詳細で「制作実績」Popover 内のケースリンク用 */
  caseNavItems?: CaseStudyNavItem[];
}
