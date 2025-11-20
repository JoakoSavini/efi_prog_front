export async function exportTable({ columns = [], rows = [], title = "export" } = {}) {
  if (!rows || rows.length === 0) return;

  try {
    const mod = await import("jspdf");
    const { jsPDF } = mod;
    await import("jspdf-autotable");

    const doc = new jsPDF();
    const headers = columns.map((c) => c.headerName ?? c.field);

    const body = rows.map((r) =>
      columns.map((c) => {
        const raw =
          typeof c.renderData === "function"
            ? c.renderData(r)
            : typeof c.accessor === "function"
            ? c.accessor(r)
            : r[c.field];
        return raw === null || raw === undefined ? "" : String(raw);
      })
    );

    doc.setFontSize(10);
    doc.autoTable({
      head: [headers],
      body,
      styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [55, 71, 79], textColor: 255 },
      startY: 14,
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        doc.setFontSize(12);
        doc.text(title, data.settings.margin.left, 10);
      },
    });

    const fileName = `${title.replace(/\s+/g, "_").toLowerCase()}.pdf`;
    doc.save(fileName);
    return;
  } catch (err) {
  }

  const hdrs = columns.map((c) => c.headerName ?? c.field);
  const csvRows = [hdrs.join(",")];
  rows.forEach((r) => {
    const line = columns
      .map((c) => {
        const raw =
          typeof c.renderData === "function"
            ? c.renderData(r)
            : typeof c.accessor === "function"
            ? c.accessor(r)
            : r[c.field];
        const str = raw === null || raw === undefined ? "" : String(raw);
        return '"' + str.replace(/"/g, '""') + '"';
      })
      .join(",");
    csvRows.push(line);
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}