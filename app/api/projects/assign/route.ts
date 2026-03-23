import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json({error:"Unauthorized"},{status:401});
    }

    const { projectId, userId,role } = await req.json();

    if(!projectId || !userId || !role){
        return NextResponse.json({error:"projectId, userId and role reuired"},{status:400});
    }

    if(!["PROJECT_ADMIN", "PROJECT_MEMBER"].includes(role)){
        return NextResponse.json(
            {error:"Invalid project role"},
            {status: 400}
        );
    }

    const actor = await prisma.user.findUnique({
        where:{email: session.user.email},
    });

    if(!actor){
        return NextResponse.json({error:"User not found"},{status:404});
    }

    const orgMemberships = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: session.user.activeOrgId,
            },
        },
    });

    if(!orgMemberships){
        return NextResponse.json({error:"No organization"},{status:400});
    }

    if(orgMemberships.role == "MEMBER"){
        return NextResponse.json({error:"Forbidden"},{status:403});
    }

    const project = await prisma.project.findUnique({
        where:{id: projectId},
    });

    if(!project || project.organizationId !== orgMemberships.organizationId){
        return NextResponse.json({error:"Invalid project"},{status:400});
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
    });

    const targetMembership = await prisma.orgMembership.findUnique({
        where:{
            userId_organizationId: {
                userId,
                organizationId: orgMemberships.organizationId,
            },
        },
    });
    if(!targetMembership){
        return NextResponse.json(
            {error: "User not in this organization"},
            {status: 400}
        );
    }

    const existing = await prisma.projectMembership.findUnique({
        where: {
            userId_projectId:{
                userId,
                projectId,
            },
        },
    });

    if(existing){
        return NextResponse.json(
            {error: "User already assigned to project"},
            {status: 400}
        );
    }

    await prisma.projectMembership.create({
        data:{
            userId,
            projectId,
            role,
        },
    });

    await logAudit({
        action: "ASSIGN_USER_TO_PROJECT",
        userId: actor.id,
        organizationId: orgMemberships.organizationId,
        resource: `Assigned ${targetUser?.email ?? userId} to project "${project.name}" as ${role}`,
    });
    
    return NextResponse.json({success: true});
}