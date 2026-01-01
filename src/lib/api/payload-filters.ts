import type { Where } from "payload";

/**
 * 公開ステータスフィルターを生成
 */
export function buildPublishStatusFilter(draft: boolean): Where {
  return draft ? {} : { _status: { equals: "published" } };
}

/**
 * スラッグ検索用フィルターを生成
 */
export function buildSlugFilter(slug: string, draft: boolean): Where {
  const slugCondition = { slug: { equals: slug } };

  if (draft) {
    return slugCondition;
  }

  return {
    and: [slugCondition, buildPublishStatusFilter(false)],
  };
}
