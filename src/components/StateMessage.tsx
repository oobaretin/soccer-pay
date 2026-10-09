type Props = {
  title: string;
  message: string;
  variant?: "error" | "empty";
};

export function StateMessage({ title, message, variant = "empty" }: Props) {
  const styles =
    variant === "error"
      ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100"
      : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";

  return (
    <div className={`rounded-xl border px-4 py-6 text-sm ${styles}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 opacity-90">{message}</p>
    </div>
  );
}
