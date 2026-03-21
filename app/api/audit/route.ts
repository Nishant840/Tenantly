import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
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
        include: {orgMemberships:true},
    });

    if(!user || user.orgMemberships.length === 0){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgid = user.orgMemberships[0].organizationId;

    const logs = await prisma.auditLog.findMany({
        where: {organizationId: orgid},
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return NextResponse.json(logs);
}