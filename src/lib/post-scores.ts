export const postTypes = ["affiliate", "news", "guide", "community"] as const;
export type PostType = (typeof postTypes)[number];

export interface PostScores {
  empathy: number;
  storytelling: number;
  cta: number;
}

/** Target score profiles per postType — used by AI generator and review. */
export const scoreProfiles: Record<PostType, PostScores> = {
  affiliate: { empathy: 80, storytelling: 70, cta: 60 },
  news: { empathy: 60, storytelling: 50, cta: 30 },
  guide: { empathy: 85, storytelling: 75, cta: 40 },
  community: { empathy: 90, storytelling: 90, cta: 50 },
};

export function scoreProfileFor(postType: PostType): PostScores {
  return scoreProfiles[postType];
}
