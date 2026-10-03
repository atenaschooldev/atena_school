import type { Student } from "../types";
import { parseLanguageLevel } from "@atena/api-types";

const LEVEL_LABELS: Record<number, string> = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
};

export function formatLevel(level: unknown): string {
  const num = parseLanguageLevel(level as any);
  return LEVEL_LABELS[num] || "A1";
}

function downloadFile(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestampString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

export function exportStudentsToCsv(students: Student[], customFilename?: string) {
  const headers = [
    "ID",
    "Nome Completo",
    "Nome",
    "Cognome",
    "Email",
    "Telefono",
    "Codice Fiscale",
    "Data di Nascita",
    "Luogo di Nascita",
    "Livello Linguistico",
    "Quota Associativa (€30)",
    "Data Pagamento Quota",
    "Stato",
    "Data Registrazione",
    "Note",
  ];

  const escapeCsvValue = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = students.map((s) => [
    escapeCsvValue(s.id),
    escapeCsvValue(s.full_name || ""),
    escapeCsvValue(s.first_name || ""),
    escapeCsvValue(s.last_name || ""),
    escapeCsvValue(s.email || ""),
    escapeCsvValue(s.phone || ""),
    escapeCsvValue(s.tax_code || ""),
    escapeCsvValue(s.birth_date || ""),
    escapeCsvValue(s.birth_place || ""),
    escapeCsvValue(formatLevel(s.language_level)),
    escapeCsvValue(s.annual_fee_paid ? "Saldata" : "Da Saldare"),
    escapeCsvValue(s.annual_fee_paid_at || ""),
    escapeCsvValue(s.status ?? "attivo"),
    escapeCsvValue(s.registration_date || ""),
    escapeCsvValue(s.notes || ""),
  ]);

  // Include UTF-8 BOM (\uFEFF) for seamless Microsoft Excel import
  const csvContent =
    "\uFEFF" +
    [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

  const filename =
    customFilename || `studenti_export_${getTimestampString()}.csv`;
  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportStudentsToExcel(students: Student[], customFilename?: string) {
  const headers = [
    "ID",
    "Nome Completo",
    "Nome",
    "Cognome",
    "Email",
    "Telefono",
    "Codice Fiscale",
    "Data di Nascita",
    "Luogo di Nascita",
    "Livello Linguistico",
    "Quota Associativa (€30)",
    "Data Pagamento Quota",
    "Stato",
    "Data Registrazione",
    "Note",
  ];

  const escapeXml = (unsafe: unknown): string => {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Build Excel XML (SpreadsheetML) compatible with all versions of Microsoft Excel
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="FeePaid">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#166534" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="FeePending">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Studenti Atena">
  <Table>
   <Row ss:Height="24">
    ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
   </Row>`;

  for (const s of students) {
    const feeStyle = s.annual_fee_paid ? "FeePaid" : "FeePending";
    xml += `
   <Row ss:Height="20">
    <Cell><Data ss:Type="String">${escapeXml(s.id)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.full_name || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.first_name || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.last_name || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.email || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.phone || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.tax_code || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.birth_date || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.birth_place || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(formatLevel(s.language_level))}</Data></Cell>
    <Cell ss:StyleID="${feeStyle}"><Data ss:Type="String">${s.annual_fee_paid ? "Saldata" : "Da Saldare"}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.annual_fee_paid_at || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.status ?? "attivo")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.registration_date || "")}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(s.notes || "")}</Data></Cell>
   </Row>`;
  }

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  const filename =
    customFilename || `studenti_export_${getTimestampString()}.xls`;
  downloadFile(xml, filename, "application/vnd.ms-excel;charset=utf-8;");
}

export function exportStudentsToJson(students: Student[], customFilename?: string) {
  const jsonString = JSON.stringify(students, null, 2);
  const filename =
    customFilename || `studenti_export_${getTimestampString()}.json`;
  downloadFile(jsonString, filename, "application/json;charset=utf-8;");
}
