import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.activeOrgId){
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

    return NextResponse.json({success: true});
}