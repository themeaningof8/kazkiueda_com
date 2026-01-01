import type { CollectionConfig } from "payload";
import { IMAGE_SIZES } from "@/lib/constants";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "thumbnail",
        width: IMAGE_SIZES.THUMBNAIL.width,
        height: IMAGE_SIZES.THUMBNAIL.height,
        position: "centre",
      },
      {
        name: "card",
        width: IMAGE_SIZES.CARD.width,
        height: IMAGE_SIZES.CARD.height,
        position: "centre",
      },
    ],
  },
  admin: {
    useAsTitle: "filename",
  },
  access: {
    read: () => true, // 公開画像は誰でも読める
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "credit",
      type: "text",
      label: "Credit / Attribution",
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
    },
  ],
};
