import type {
  OrientationAdvisorInput,
  OrientationAdvisorOutput,
} from "@/lib/orientation-engine/types";

export interface OrientationAdvisorProvider {
  readonly id: string;
  advise(input: OrientationAdvisorInput): Promise<OrientationAdvisorOutput>;
}
