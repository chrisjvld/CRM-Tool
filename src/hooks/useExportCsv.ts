"use client";

export function useExportCsv() {
  function escapeCell(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    const needsQuotes = /[",\n\r]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  }

  return function exportCsv(
    rows: Array<Record<string, unknown>>,
    options?: { filename?: string; headers?: string[] }
  ) {
    const headers = options?.headers ?? (rows[0] ? Object.keys(rows[0]) : []);
    const lines: string[] = [];
    if (headers.length) lines.push(headers.map(escapeCell).join(","));
    for (const row of rows) {
      const line = headers.map((h) => escapeCell(row[h])).join(",");
      lines.push(line);
    }
    const csv = lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = options?.filename || "export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
}


