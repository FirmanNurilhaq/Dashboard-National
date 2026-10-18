import { NextResponse } from "next/server";
import { query } from "@/lib/db/mssql";

interface UserRow {
  Username: string;
  PasswordHash: string;
  FullName: string;
  Role: string;
  IsActive: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Cek kredensial langsung ke Microsoft SQL Server tabel Users
    try {
      const users = await query<UserRow>(
        `SELECT Username, PasswordHash, FullName, Role, IsActive 
         FROM Users 
         WHERE Username = @username AND IsActive = 1`,
        { username: username.trim() }
      );

      if (users && users.length > 0) {
        const user = users[0];
        // Verifikasi password (plaintext untuk kemudahan setup atau hash)
        if (user.PasswordHash === password.trim()) {
          return NextResponse.json({
            success: true,
            user: {
              username: user.Username,
              fullName: user.FullName,
              role: user.Role,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Koneksi DB Users gagal, menggunakan fallback validasi akun internal:", dbErr);
    }

    // 2. Fallback autentikasi kredensial bawaan admin / 4dmin123
    if (username.trim() === "admin" && password.trim() === "4dmin123") {
      return NextResponse.json({
        success: true,
        user: {
          username: "admin",
          fullName: "National System Administrator",
          role: "Admin",
        },
      });
    }

    return NextResponse.json(
      { error: "Username atau kata sandi tidak valid." },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Error pada endpoint login:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server saat login." },
      { status: 500 }
    );
  }
}
