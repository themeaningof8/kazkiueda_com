import { describe, expect, test } from "vitest";
import { buildPublishStatusFilter, buildSlugFilter } from "@/lib/api/payload-filters";

describe("payload-filters", () => {
  describe("buildPublishStatusFilter", () => {
    test("should return empty filter when draft is true", () => {
      const filter = buildPublishStatusFilter(true);
      expect(filter).toEqual({});
    });

    test("should return published status filter when draft is false", () => {
      const filter = buildPublishStatusFilter(false);
      expect(filter).toEqual({ _status: { equals: "published" } });
    });
  });

  describe("buildSlugFilter", () => {
    test("should return slug-only filter when draft is true", () => {
      const filter = buildSlugFilter("test-slug", true);
      expect(filter).toEqual({ slug: { equals: "test-slug" } });
    });

    test("should return combined filter when draft is false", () => {
      const filter = buildSlugFilter("test-slug", false);
      expect(filter).toEqual({
        and: [
          { slug: { equals: "test-slug" } },
          { _status: { equals: "published" } },
        ],
      });
    });

    test("should handle special characters in slug", () => {
      const filter = buildSlugFilter("hello-world_123", false);
      expect(filter).toEqual({
        and: [
          { slug: { equals: "hello-world_123" } },
          { _status: { equals: "published" } },
        ],
      });
    });

    test("should handle empty string slug", () => {
      const filter = buildSlugFilter("", false);
      expect(filter).toEqual({
        and: [
          { slug: { equals: "" } },
          { _status: { equals: "published" } },
        ],
      });
    });

    test("should handle empty string slug in draft mode", () => {
      const filter = buildSlugFilter("", true);
      expect(filter).toEqual({ slug: { equals: "" } });
    });

    test("should handle slug with various special characters", () => {
      const specialSlugs = [
        "post-with-dashes",
        "post_with_underscores",
        "post123",
        "post-with-123-and_underscores",
        "post.with.dots",
      ];

      specialSlugs.forEach((slug) => {
        const filter = buildSlugFilter(slug, false);
        expect(filter).toEqual({
          and: [
            { slug: { equals: slug } },
            { _status: { equals: "published" } },
          ],
        });
      });
    });
  });
});