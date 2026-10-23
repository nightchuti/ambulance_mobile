export const INCIDENT_MODE = { QUICK: "quick", DETAILED: "detailed" };

export const INCIDENT_TYPES = [
  { key: "car_accident", title: "อุบัติเหตุรถ", icon: "car-emergency", color: "#F59E0B" },
  { key: "cardiac", title: "หัวใจ/หมดสติ", icon: "heart-pulse", color: "#EF4444" },
  { key: "injury", title: "บาดเจ็บ", icon: "bandage", color: "#8B5CF6" },
  { key: "fire", title: "ไฟไหม้", icon: "fire", color: "#F97316" },
  { key: "drowning", title: "จมน้ำ", icon: "water", color: "#0EA5E9" },
  { key: "other", title: "เหตุอื่น ๆ", icon: "alert-circle", color: "#64748B" },
];

export const SOS_TYPE = { key: "sos", title: "แจ้งเหตุด่วน (SOS)", icon: "alarm-light", color: "#f21212" };

export const getTypeInfo = (key) =>
  [...INCIDENT_TYPES, SOS_TYPE].find((t) => t.key === key) || INCIDENT_TYPES[5];

export const SEVERITY = [
  { key: "low", title: "ไม่รุนแรง", color: "#22C55E", desc: "ผู้ป่วยรู้สึกตัวดี ช่วยเหลือตัวเองได้ บาดเจ็บเล็กน้อย" },
  { key: "medium", title: "ปานกลาง", color: "#F59E0B", desc: "บาดเจ็บชัดเจนหรือเจ็บปวดมาก แต่ยังรู้สึกตัวและหายใจได้ปกติ" },
  { key: "high", title: "รุนแรง", color: "#F97316", desc: "บาดเจ็บหนัก เลือดออกมาก สงสัยกระดูกหัก หรือหายใจลำบาก" },
  { key: "critical", title: "วิกฤต", color: "#EF4444", desc: "หมดสติ ไม่หายใจ หัวใจหยุดเต้น หรือชีวิตอยู่ในอันตรายทันที" },
];
export const getSeverityInfo = (key) => SEVERITY.find((s) => s.key === key);

export const STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  ON_THE_WAY: "on_the_way",
  ARRIVED: "arrived",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const STATUS_LABEL = {
  pending: "รอเจ้าหน้าที่รับเรื่อง",
  accepted: "เจ้าหน้าที่รับเรื่องแล้ว",
  on_the_way: "กำลังเดินทางไปหาคุณ",
  arrived: "ถึงจุดเกิดเหตุแล้ว",
  completed: "ช่วยเหลือเสร็จสิ้น",
  cancelled: "ยกเลิกแล้ว",
};

export const STATUS_COLOR = {
  pending: "#F59E0B",
  accepted: "#3B82F6",
  on_the_way: "#8B5CF6",
  arrived: "#14B884",
  completed: "#16A34A",
  cancelled: "#94A3B8",
};

//ลำดับที่จะแสดงบน Status
export const STATUS_FLOW = ["pending", "accepted", "on_the_way", "arrived", "completed"];

//ตรวจว่าการแจ้งเหตุเสร็จสิ้นยัง t = ยัง
export const isActiveStatus = (s) => s !== STATUS.COMPLETED && s !== STATUS.CANCELLED;

//ใช้กับhistory 01 ม.ค. 2026 00:00
export const formatDateTime = (ts) =>
  ts?.toDate ? ts.toDate().toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

//ใช้กับstatus 01 ม.ค. 00:00
export const formatShortTime = (ts) =>
  ts?.toDate
    ? ts.toDate().toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";
    