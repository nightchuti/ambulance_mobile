import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

const sendOtpFn = httpsCallable(functions, "sendRegisterOtp");
const verifyFn = httpsCallable(functions, "verifyOtpAndRegister");

// ส่ง OTP ไปที่อีเมล -> { ok, resendAfterSec }
export const sendRegisterOtp = async (email) => {
  const res = await sendOtpFn({ email });
  return res.data;
};

// ตรวจ OTP แล้วสร้างบัญชี + โปรไฟล์ (ทำฝั่งเซิร์ฟเวอร์ทั้งหมด)
export const verifyOtpAndRegister = async (data) => {
  const res = await verifyFn(data);
  return res.data;
};

// แปลง error จาก Cloud Functions (error.message = รหัสที่ฟังก์ชัน throw) เป็นข้อความไทย
export const otpErrorMessage = (error) => {
  switch (error?.message) {
    case "invalid-email": return "รูปแบบอีเมลไม่ถูกต้อง";
    case "email-already-in-use": return "อีเมลนี้ถูกใช้งานแล้ว";
    case "too-soon": return "ขอรหัสบ่อยเกินไป กรุณารอสักครู่";
    case "otp-not-found": return "ไม่พบรหัส OTP กรุณากดขอรหัสใหม่";
    case "otp-expired": return "รหัส OTP หมดอายุ กรุณากดขอรหัสใหม่";
    case "otp-too-many-attempts": return "กรอกผิดเกินกำหนด กรุณากดขอรหัสใหม่";
    case "otp-invalid": return "รหัส OTP ไม่ถูกต้อง";
    case "invalid-data": return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    case "weak-password": return "รหัสผ่านง่ายเกินไป";
  }
  if (error?.code === "functions/unavailable" || error?.code === "functions/deadline-exceeded") {
    return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่";
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
};
