import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/api-key"
import { logAudit } from "@/lib/audit";

export async function POST(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
    });

    if(!user){
        return NextResponse.json(
            {error: "User not found"},
            {status: 404}
        );
    }

    const orgMembership = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: session.user.activeOrgId,
            },
        },
    });

    if(!orgMembership){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    if(orgMembership.role === "MEMBER"){
        return NextResponse.json(
            {error: "Forbidden"},
            {status: 403}
        );
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    const createdKey = await prisma.apiKey.create({
        data: {
            keyHash,
            organizationId: orgMembership.organizationId,
        },
        select: {
            id: true,
        },
    });

    await logAudit({
        action: "CREATE_API_KEY",
        userId: user.id,
        organizationId: orgMembership.organizationId,
        resource: `Created API key ${createdKey.id.slice(0, 8)}… (shown once)`,
    });
    
    return NextResponse.json({
        apiKey: rawKey,
    });
}