import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "모든 필드를 입력해주세요." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "이미 존재하는 이메일입니다." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        const account = await prisma.account.create({
            data: {
                type: "personal",
                name: name,
                plan: "basic",
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                personalAccountId: account.id,
            },
        });

        return NextResponse.json(
            { message: "회원가입 완료", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "회원가입 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
