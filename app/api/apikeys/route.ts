import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth-options";
import { NextResponse } from "next/server";
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
            {status: 400},
        );
    }

    const orgId = session.user.activeOrgId;

    const keys = await prisma.apiKey.findMany({
        where: {organizationId: orgId},
        select: {
            id: true,
            createdAt: true,
            revokedAt: true,
        },
    });

    return NextResponse.json(keys);
}