import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json({error: "Unauthorized"});
    }

    const { email, role} = await req.json();

    if(!email || !role){
        return NextResponse.json(
            {error: "Email and role is required"},
            {status: 400}
        );
    };

    const inviter = await prisma.user.findUnique({
        where: {email: session.user.email},
        include:{
            orgMemberships:{
                include:{
                    organization: true
                },
            },
        },
    });

    if(!inviter || inviter.orgMemberships.length==0){
        return NextResponse.json({error: "No organization"},{status: 400});
    };

    const activeOrgMembership = inviter.orgMemberships[0];

    if(activeOrgMembership.role == "MEMBER"){
        return NextResponse.json({error: "Forbidden"}, {status: 403});
    };

    const invite = await prisma.orgInvite.create({
        data: {
            email,
            role,
            organizationId: activeOrgMembership.organizationId,
            inviteById: inviter.id,
        },
    });

    await logAudit({
        action: "INVITE_USER",
        userId: inviter.id,
        organizationId: activeOrgMembership.organizationId,
        resource: email,
    })
    return NextResponse.json(invite);
}