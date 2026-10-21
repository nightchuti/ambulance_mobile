import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, decodeUTF8 } from "tweetnacl-util";

const PUBKEY_B64 = process.env.EXPO_PUBLIC_IDCARD_PUBKEY;

const getPublicKey = () => {
  if (!PUBKEY_B64) throw new Error("ยังไม่ได้ตั้งค่า public key");
  const key = decodeBase64(PUBKEY_B64);
  if (key.length !== nacl.box.publicKeyLength) throw new Error("public key ไม่ถูกต้อง"); //ของ nacl.box จะยาว32ไบต์
  return key;
};

//เข้ารหัสเลขบัตร
export const sealIdCard = (idcard) => {
  const adminPub = getPublicKey();
  const eph = nacl.box.keyPair(); //public+secret keyของคนส่ง
  const nonce = nacl.randomBytes(nacl.box.nonceLength); //ค่าที่สุ่มต้องใช้ตอนเข้าและถอดรหัส
  const ct = nacl.box(
    decodeUTF8(idcard), 
    nonce, 
    adminPub, 
    eph.secretKey
);
  eph.secretKey.fill(0); //ล้างsecretKeyออก
  return {
    v: 1,
    epk: encodeBase64(eph.publicKey),
    nonce: encodeBase64(nonce),
    ct: encodeBase64(ct),
  };
};

export const maskIdCard = (id) => `${id[0]}-xxxx-xxxxx-xx-${id[12]}`;