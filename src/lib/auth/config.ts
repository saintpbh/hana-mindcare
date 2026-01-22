import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("이메일과 비밀번호를 입력해주세요.");
                }

                // User 조회
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        personalAccount: true,
                        memberships: {
                            include: {
                                account: true,
                            },
                        },
                    },
                });

                if (!user) {
                    throw new Error("존재하지 않는 이메일입니다.");
                }

                // Check Approval Status
                if (user.isApproved === false) {
                    throw new Error("관리자의 승인이 필요한 계정입니다.");
                }

                // 비밀번호 검증
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("비밀번호가 일치하지 않습니다.");
                }

                // Email 인증 확인 (선택)
                // if (!user.emailVerified) {
                //   throw new Error("이메일 인증이 필요합니다.");
                // }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.profileImage,
                    isSuperAdmin: user.isSuperAdmin,
                    isApproved: user.isApproved,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // 초기 로그인 시
            if (user) {
                token.userId = user.id;
                token.isSuperAdmin = user.isSuperAdmin;
                token.isApproved = user.isApproved;

                // 기본 accountId (Personal Account)
                const personalAccount = await prisma.account.findFirst({
                    where: {
                        type: "personal",
                        personalUser: { id: user.id },
                    },
                });

                if (personalAccount) {
                    token.accountId = personalAccount.id;
                    token.accountType = "personal";
                    token.role = "owner"; // Personal은 항상 owner
                }
            }

            // Account 전환 시 (클라이언트에서 update 호출)
            if (trigger === "update" && session?.accountId) {
                token.accountId = session.accountId;

                // 역할 조회
                const member = await prisma.member.findFirst({
                    where: {
                        userId: token.userId as string,
                        accountId: session.accountId,
                    },
                    include: { account: true },
                });

                if (member) {
                    token.accountType = member.account.type;
                    token.role = member.role;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.userId as string;
                session.user.isSuperAdmin = token.isSuperAdmin as boolean;
                session.user.isApproved = token.isApproved as boolean;

                session.accountId = token.accountId as string;
                session.accountType = token.accountType as "personal" | "organization";
                session.role = token.role as "owner" | "admin" | "counselor" | "staff";
                session.isSuperAdmin = token.isSuperAdmin as boolean;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
