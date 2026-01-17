/**
 * PostNotFoundException
 *
 * 記事が見つからない場合の例外
 */

import { EntityNotFoundException } from "./domain.exception";

export class PostNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super("Post", identifier);
  }
}
