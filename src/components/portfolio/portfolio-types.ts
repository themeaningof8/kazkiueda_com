export type CaseStudyPreset = '01' | '02' | '03' | '04';

export interface CaseStudy {
  preset: CaseStudyPreset;
  tags: string[];
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  /** 案件詳細・ケーススタディページなど（あるときだけタイトル〜画像がリンクになる） */
  href?: string;
  /** `href` 時の短い `aria-label`（未指定時はタイトルから自動生成） */
  linkLabel?: string;
}

/** `href` が無いときはリンク未設定として `<span>` で描画（キーボードで空の `#` に飛ばない） */
export interface FooterLink {
  label: string;
  href?: string;
}
