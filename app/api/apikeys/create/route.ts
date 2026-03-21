import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/api-key"
import { logAudit } from "@/lib/audit";

export async function POST(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        include:{
            orgMemberships: true
        },
    });

    if(!user || user.orgMemberships.length === 0){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgMembership = user.orgMemberships[0];

    if(orgMembership.role === "MEMBER"){
        return NextResponse.json(
            {error: "Forbidden"},
            {status: 403}
        );
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    await prisma.apiKey.create({
        data: {
            keyHash,
            organizationId: orgMembership.organizationId,
        },
    });

    await logAudit({
        action: "CREATE_API_KEY",
        userId: user.id,
        organizationId: orgMembership.organizationId,
    });
    
    return NextResponse.json({
        apiKey: rawKey,
    });
}