import type { Ref } from "vue";

export type TimestampInput =
  | string
  | Date
  | null
  | undefined
  | Ref<string | Date | null | undefined>
  | (() => string | Date | null | undefined);
