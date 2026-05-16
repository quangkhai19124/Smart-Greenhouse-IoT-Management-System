export function toVietnamTime(isoString: string): string {
  const date = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function toVietnamDate(isoString: string): string {
  const date = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");

  return date.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  });
}