export type Props = Record<string, string | number | boolean>;
export type Provider = {
  captureError: (error: unknown, context?: Record<string, unknown>) => void;
  track: (name: string, props?: Props) => void;
};
