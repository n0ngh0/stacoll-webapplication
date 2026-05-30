// ตัวแทนของข้อมูล User ที่จะได้ตอบกลับมาจาก API (Backend)
export interface User {
  _id: string; // MongoDB ObjectId จะส่งมาเป็น String
  username: string;
  email: string;
  role: string;
  imgUrl?: string;
  bio?: string;
  title?: string;
  projects?: Array<{
    title: string;
    description: string;
    tags: string[];
  }>;
  // วันที่และเวลาจะถูกแปลงเป็น ISO String เมื่อส่งผ่าน JSON
  createdAt: string;
  updatedAt: string;
}

// ข้อมูลสำหรับพวก Session (ใช้ใน use-user)
export interface SessionUser {
  id?: string;
  username: string;
  email: string;
  role: string;
  imgUrl?: string;
}

// (Optional) Type สำหรับเวลาส่งข้อมูลไป สมัครสมาชิก
export interface SignUpPayload {
  username: string;
  email: string;
  password: string;
}

// (Optional) Type สำหรับเวลาส่งข้อมูลไป เข้าสู่ระบบ
export interface SignInPayload {
  email: string; // หรือจะเป็น username ก็ได้ ขึ้นอยู่กับการออกแบบ API
  password: string;
}