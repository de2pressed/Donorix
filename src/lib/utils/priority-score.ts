import { differenceInHours, differenceInMinutes, parseISO } from "date-fns";

import type { FeedPost } from "@/types/post";

export function calculatePriorityScore(post: FeedPost) {
  const requiredBy = parseISO(post.required_by);
  const now = new Date();

  const minutesToNeed = Math.max(0, differenceInMinutes(requiredBy, now));
  const urgencyBoost = post.is_emergency ? 600 : 0;
  const nearDeadlineBoost = minutesToNeed <= 120 ? 260 : minutesToNeed <= 360 ? 160 : 40;
  const freshnessBoost = Math.max(0, 72 - differenceInHours(now, parseISO(post.created_at))) * 3;
  const momentumBoost = post.upvote_count * 9 + post.donor_count * 12;
  const creatorKarmaBoost = (post.creator?.karma ?? 0) * 0.15;

  return Math.round(
    urgencyBoost + nearDeadlineBoost + freshnessBoost + momentumBoost + creatorKarmaBoost,
  );
}

export function sortPostsByPriority(posts: FeedPost[]) {
  return [...posts].sort((left, right) => {
    const leftScore = left.priority_score || calculatePriorityScore(left);
    const rightScore = right.priority_score || calculatePriorityScore(right);
    return rightScore - leftScore;
  });
}
