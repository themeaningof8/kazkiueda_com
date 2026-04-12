export type CaseStudyPreset = '01' | '02' | '03' | '04';

export interface CaseStudy {
  preset: CaseStudyPreset;
  tags: string[];
  title: string;
  description: string;
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
}

export interface FooterLink {
  label: string;
  href?: string;
}
