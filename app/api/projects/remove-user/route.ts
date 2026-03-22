import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }
    const { projectId, userId} = await req.json();

    if(!projectId || !userId){
        return NextResponse.json(
            {error: "projectId and userId required"},
            {status: 400}
        );
    }

    const actor = await prisma.user.findUnique({
        where:{email: session.user.email},
    });

    if(!actor){
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

    if(orgMembership.role == "MEMBER"){
        return NextResponse.json(
            {error: "Forbidden"},
            {status: 403}
        );
    }

    const project = await prisma.project.findUnique({
        where: {id: projectId}
    });

    if(!project || project.organizationId !== orgMembership.organizationId){
        return NextResponse.json(
            {error: "Invalid Project"},
            {status: 400}
        );
    }

    if(actor.id === userId){
        return NextResponse.json(
            {error: "Cannot remove yourself"},
            {status: 400}
        );
    }

    const membership = await prisma.projectMembership.findUnique({
        where: {
            userId_projectId:{
                userId,
                projectId,
            },
        },
    });

    if(!membership){
        return NextResponse.json(
            {error: "User not in project"},
            {status: 404}
        );
    }

    await prisma.projectMembership.delete({
        where: {
            userId_projectId:{
                userId,
                projectId,
            },
        },
    });

    await logAudit({
        action: "REMOVE_USER_FROM_PROJECT",
        userId: actor.id,
        organizationId: orgMembership.organizationId,
        resource: projectId,
    });
    
    return NextResponse.json({success: true});
}