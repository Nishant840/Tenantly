import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401},
        );
    }

    const { keyId } = await req.json();

    if(!keyId){
        return NextResponse.json(
            {error: "keyId required"},
            {status: 400},
        );
    }

    const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
    });

    if(!key || key.organizationId !== session.user.activeOrgId){
        return NextResponse.json(
            {error: "Not found"},
            {status: 404},
        );
    }

    await prisma.apiKey.update({
        where: {id: keyId},
        data: {
            revokedAt: new Date(),
        },
    });

    await logAudit({
        action: "REVOKE_API_KEY",
        userId: session.user.id,
        organizationId: session.user.activeOrgId,
        resource: `Revoked API key ${key.id.slice(0, 8)}…`,
    });

    return NextResponse.json({success: true});
}