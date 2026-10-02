import "server-only";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  buildOrientationHumanReviewProfileFingerprint,
} from "@/lib/orientation-engine/review/core";
import type {
  OrientationHumanReviewBundle,
  OrientationHumanReviewPersistence,
  OrientationHumanReviewPipelineStatus,
} from "@/lib/orientation-engine/review/types";

const REUSE_PENDING_WINDOW_MS = 20 * 60 * 1000;

function reviewClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
    || !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  return createPrivilegedSupabaseClient();
}

export async function persistOrientationHumanReview(input: {
  profile: PublicOrientationAnswers;
  bundle: OrientationHumanReviewBundle;
  pipelineStatus: OrientationHumanReviewPipelineStatus;
}): Promise<OrientationHumanReviewPersistence> {
  const supabase = reviewClient();
  if (!supabase) {
    return { reviewId: null, available: false };
  }

  const fingerprint = buildOrientationHumanReviewProfileFingerprint(input.profile);
  const reuseAfter = new Date(Date.now() - REUSE_PENDING_WINDOW_MS).toISOString();

  const { data: recent } = await supabase
    .from("orientation_human_reviews")
    .select("id")
    .eq("profile_fingerprint", fingerprint)
    .eq("review_status", "pending")
    .is("orientation_id", null)
    .gte("created_at", reuseAfter)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.id) {
    const { error } = await supabase
      .from("orientation_human_reviews")
      .update({
        profile: input.profile,
        bundle: input.bundle,
        pipeline_status: input.pipelineStatus,
        selected_count: input.bundle.selection.selected.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recent.id)
      .eq("review_status", "pending")
      .is("orientation_id", null);

    if (!error) {
      return { reviewId: String(recent.id), available: true };
    }
  }

  const { data, error } = await supabase
    .from("orientation_human_reviews")
    .insert({
      profile_fingerprint: fingerprint,
      profile: input.profile,
      bundle: input.bundle,
      pipeline_status: input.pipelineStatus,
      selected_count: input.bundle.selection.selected.length,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { reviewId: null, available: false };
  }

  return {
    reviewId: String(data.id),
    available: true,
  };
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function linkOrientationHumanReview(input: {
  reviewId: string;
  profile: PublicOrientationAnswers;
  orientationId: string;
}) {
  if (!validUuid(input.reviewId) || !validUuid(input.orientationId)) return false;

  const supabase = reviewClient();
  if (!supabase) return false;

  const fingerprint = buildOrientationHumanReviewProfileFingerprint(input.profile);

  const { data, error } = await supabase
    .from("orientation_human_reviews")
    .update({
      orientation_id: input.orientationId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.reviewId)
    .eq("profile_fingerprint", fingerprint)
    .is("orientation_id", null)
    .select("id")
    .maybeSingle();

  return !error && Boolean(data?.id);
}
