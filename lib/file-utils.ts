import "client-only";

const TEXT_FILE_EXTENSION = /\.txt$/i;

export function isTextFile(file: File) {
  return TEXT_FILE_EXTENSION.test(file.name) || file.type === "text/plain";
}

export function normalizeTextFileName(fileName: string) {
  const trimmedName = fileName.trim() || "untitled";
  return TEXT_FILE_EXTENSION.test(trimmedName) ? trimmedName : `${trimmedName}.txt`;
}

export function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = normalizeTextFileName(fileName);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
