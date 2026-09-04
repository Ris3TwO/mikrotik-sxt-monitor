import type { Ref } from "vue";

/**
 * Flexible input type supporting raw date values, reactive refs, or getter functions for timestamps.
 */
export type TimestampInput =
  | string
  | Date
  | null
  | undefined
  | Ref<string | Date | null | undefined>
  | (() => string | Date | null | undefined);