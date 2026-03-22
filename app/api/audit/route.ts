import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    const membership = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: session.user.activeOrgId,
            },
        },
    });

    if(!membership){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgid = session.user.activeOrgId;

    const logs = await prisma.auditLog.findMany({
        where: {organizationId: orgid},
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return NextResponse.json(logs);
}