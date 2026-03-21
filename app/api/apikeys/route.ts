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
            orgMemberships: true
        },
    });

    if(!user || user.orgMemberships.length === 0){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400},
        );
    }

    const orgId = user.orgMemberships[0].organizationId;

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