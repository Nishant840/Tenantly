import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        include: {
            orgMemberships: true,
        },
    });

    if(!user || user.orgMemberships.length === 0){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgId = user.orgMemberships[0].organizationId;

    const members = await prisma.orgMembership.findMany({
        where: {
            organizationId: orgId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });

    const formatted = members.map((m)=>({
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        role: m.role
    }));

    return NextResponse.json(formatted);
}