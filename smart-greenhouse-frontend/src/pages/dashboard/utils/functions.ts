export function formatChange(current: number, previous: number): string {
    console.log("Current:", current, "Previous:", previous);
  const diff = ((current - previous) / 100);
  const formatted = diff.toFixed(2);
  return `${diff > 0 ? "+" : ""}${formatted}% from 1 hour ago`;
}