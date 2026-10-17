import crypto from "crypto";
import { Assignment } from "@/types/assignment";

/**
 * Sanitasi string umum: mengubah '#VALUE!', '#N/A', '-', dll menjadi null
 */
export function sanitizeText(val: any): string | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (
    str === "" ||
    str === "-" ||
    str === "--" ||
    str === "(blank)" ||
    str === "#VALUE!" ||
    str === "#N/A" ||
    str === "#REF!" ||
    str === "#DIV/0!" ||
    str === "NULL" ||
    str === "null"
  ) {
    return null;
  }
  return str;
}

/**
 * Normalisasi format Title Case untuk wilayah (Area & Kabupaten)
 */
export function normalizeArea(val: any): string {
  const clean = sanitizeText(val);
  if (!clean) return "Unknown";

  const upper = clean.toUpperCase();
  if (upper === "JABO" || upper === "JABODETABEK") return "JABO";
  if (upper.includes("CENTRAL JAVA")) return "Central Java";
  if (upper.includes("EAST JAVA")) return "East Java";
  if (upper.includes("WEST JAVA")) return "West Java";
  if (upper.includes("BALI") || upper.includes("NUSRA")) return "Bali Nusra";
  if (upper.includes("SOUTH SUMATRA") || upper.includes("SUMATERA SELATAN")) return "South Sumatra";
  if (upper.includes("NORTH SUMATRA") || upper.includes("CENTRAL NORTH SUMATERA")) return "North Sumatra";
  if (upper.includes("KALIMANTAN")) return "Kalimantan";
  if (upper.includes("SULAWESI")) return "Sulawesi";

  // Default title case
  return clean
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function normalizeKabupaten(val: any): string {
  const clean = sanitizeText(val);
  if (!clean) return "Unknown";
  return clean
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Parsing Tanggal Khusus:
 * Sesuai aturan bisnis: '0-Jan-00', serial 0, atau format rusak menandakan
 * bahwa tahapan tersebut BELUM SELESAI / BELUM TERCAPAI -> diset NULL
 */
export function sanitizeDate(val: any): string | null {
  if (val === undefined || val === null) return null;

  // Jika bertipe Date JavaScript
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const year = val.getFullYear();
    // Excel date serial 0 atau tahun tidak masuk akal
    if (year <= 1901 || year > 2100) return null;
    return val.toISOString().slice(0, 10);
  }

  const str = String(val).trim();

  // Pengecekan string khusus '0-Jan-00'
  if (
    str === "0-Jan-00" ||
    str === "00-Jan-00" ||
    str === "0" ||
    str === "-" ||
    str === "#VALUE!" ||
    str === ""
  ) {
    return null;
  }

  // Jika berupa angka serial Excel (misal 45540 -> September 2024)
  const num = Number(str);
  if (!isNaN(num) && num > 0) {
    // Jika angka serial di luar rentang tanggal wajar (misal PO number 4100005479)
    if (num > 60000 || num < 30000) {
      return null;
    }
    try {
      // Excel epoch 1899-12-30
      const date = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (isNaN(date.getTime()) || date.getFullYear() <= 1901 || date.getFullYear() > 2100) {
        return null;
      }
      return date.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  }

  // Jika string biasa (ISO atau format tanggal)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    if (year <= 1901 || year > 2100) return null;
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Sanitasi Koordinat Latitude & Longitude
 */
export function sanitizeCoordinate(
  latVal: any,
  longVal: any,
  rawCoordStr?: any
): { lat: number | null; long: number | null } {
  let lat: number | null = null;
  let long: number | null = null;

  const latNum = parseFloat(String(latVal));
  const longNum = parseFloat(String(longVal));

  if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
    lat = latNum;
  }

  if (!isNaN(longNum) && longNum >= -180 && longNum <= 180) {
    long = longNum;
  }

  // Fallback dari string Coordinate_Raw (contoh: "-6.125,106.9") jika salah satu null
  if ((lat === null || long === null) && rawCoordStr) {
    const parts = String(rawCoordStr).split(",");
    if (parts.length === 2) {
      const pLat = parseFloat(parts[0].trim());
      const pLong = parseFloat(parts[1].trim());
      if (lat === null && !isNaN(pLat) && pLat >= -90 && pLat <= 90) lat = pLat;
      if (long === null && !isNaN(pLong) && pLong >= -180 && pLong <= 180) long = pLong;
    }
  }

  return { lat, long };
}

/**
 * Derivasi Status Final dan Milestone
 */
export function deriveOperationalStatus(row: {
  oaDate: string | null;
  dtDate: string | null;
  auditDate: string | null;
  reportSubmitDate: string | null;
  accDate: string | null;
  milestoneNw: string;
  rfCatIssueLevel2: string | null;
}): {
  statusOa: 'On Air' | 'Not Yet OA';
  statusDt: 'Done' | 'NY DT';
  finalStatus: 'Acc' | 'Not Yet Acc' | 'Reject';
} {
  const milestone = row.milestoneNw || "";
  const milestoneUpper = milestone.toUpperCase();

  // Status OA: On Air jika oaDate terisi dan milestone bukan '0. NY Connected'
  const isOa = !!row.oaDate && !milestoneUpper.startsWith("0. NY");
  const statusOa: 'On Air' | 'Not Yet OA' = isOa ? "On Air" : "Not Yet OA";

  // Status DT
  const statusDt: 'Done' | 'NY DT' = row.dtDate ? "Done" : "NY DT";

  // Final Status
  let finalStatus: 'Acc' | 'Not Yet Acc' | 'Reject' = "Not Yet Acc";

  if (
    milestoneUpper.includes("REJECT") ||
    milestoneUpper.includes("CANCEL")
  ) {
    finalStatus = "Reject";
  } else if (
    !!row.accDate ||
    milestoneUpper.includes("6.2 SAPLO ACCEPTED") ||
    milestoneUpper.includes("QC ACCEPTED") ||
    milestoneUpper.includes("QC APPROVED")
  ) {
    finalStatus = "Acc";
  } else {
    finalStatus = "Not Yet Acc";
  }

  return { statusOa, statusDt, finalStatus };
}

/**
 * Hashing SHA-256 untuk deteksi perubahan row
 */
export function computeRowHash(rawValues: any[]): string {
  const canonical = rawValues.map((v) => (v === null || v === undefined ? "" : String(v).trim())).join("|");
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

/**
 * Pembersihan Lengkap Satu Baris Data dari Book1.xlsx / GSheets
 */
export function cleanseAssignmentRow(raw: any[], rowIndex: number): Assignment | null {
  const pmoUniq = sanitizeText(raw[0]);
  const duId = sanitizeText(raw[1]);

  if (!duId && !pmoUniq) {
    return null; // Baris kosong
  }

  const primaryDuId = duId || `UNKNOWN-DU-${rowIndex}`;
  const recordId = `${primaryDuId}|${pmoUniq || "NA"}`;

  const siteId = sanitizeText(raw[2]) || "UNKNOWN";
  const siteName = sanitizeText(raw[3]) || siteId;
  const programId = sanitizeText(raw[4]);
  const duModel = sanitizeText(raw[5]);
  const area = normalizeArea(raw[6]);
  const kabupaten = normalizeKabupaten(raw[7]);

  const { lat, long } = sanitizeCoordinate(raw[9], raw[8], raw[23]);

  const poRelease = sanitizeText(raw[10]);
  const statusPo = sanitizeText(raw[11]);
  const m06Date = sanitizeDate(raw[12]);
  const oaDate = sanitizeDate(raw[13]);
  const dtDate = sanitizeDate(raw[14]);
  const auditDate = sanitizeDate(raw[15]);
  const reportSubmitDate = sanitizeDate(raw[16]);
  const accDate = sanitizeDate(raw[17]);

  const rfCatIssueLevel2 = sanitizeText(raw[18]);
  const picRf = sanitizeText(raw[19]);
  const isdpStatus = sanitizeText(raw[20]);
  const remark = sanitizeText(raw[21]);
  const milestoneNw = sanitizeText(raw[22]) || "0. NY Connected";
  const coordinateRaw = sanitizeText(raw[23]);
  const extraCol1 = sanitizeText(raw[24]);
  const extraCol2 = sanitizeText(raw[25]);

  const { statusOa, statusDt, finalStatus } = deriveOperationalStatus({
    oaDate,
    dtDate,
    auditDate,
    reportSubmitDate,
    accDate,
    milestoneNw,
    rfCatIssueLevel2,
  });

  const rowHash = computeRowHash(raw.slice(0, 26));

  return {
    recordId,
    pmoUniq,
    duId: primaryDuId,
    siteId,
    siteName,
    programId,
    duModel,
    area,
    kabupaten,
    longitude: long,
    latitude: lat,
    poRelease,
    statusPo,
    m06Date,
    oaDate,
    dtDate,
    auditDate,
    reportSubmitDate,
    accDate,
    rfCatIssueLevel2,
    picRf,
    isdpStatus,
    remark,
    milestoneNw,
    coordinateRaw,
    extraCol1,
    extraCol2,
    statusOa,
    statusDt,
    finalStatus,
    rowHash,
  };
}
