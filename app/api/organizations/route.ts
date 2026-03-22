import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import {prisma} from "@/lib/prisma"
import { userActiveOrgUpdateData } from "@/lib/user-active-org-data";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }

    const body = await req.json();
    const {name, slug } = body;

    if(!name || !slug){
        return NextResponse.json(
            {error: "Name and slug are required"},
            {status: 400}
        );
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email}
    })

    if(!user){
        return NextResponse.json(
            {error: "User not found"},
            {status: 404}
        )
    }

    const org = await prisma.$transaction(async (tx)=>{
        const organization = await tx.organization.create({
            data: {name, slug}
        });

        await tx.orgMembership.create({
            data: {
                role: "OWNER",
                userId: user.id,
                organizationId: organization.id
            },
        });

        await tx.user.update({
            where: { id: user.id },
            data: userActiveOrgUpdateData(organization.id),
        });

        return organization;
    })

    return NextResponse.json({
        org
    })
}