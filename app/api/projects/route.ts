import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options";
import { PLAN_LIMITS } from "@/lib/plans";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json({error: "Unauthorized"},{status:401});
    }

    const { name } = await req.json();

    if(!name){
        return NextResponse.json({error:"Project name required"},{status:400});
    }

    const user = await prisma.user.findUnique({
        where: {email:session.user.email},
    });

    if(!user){
        return NextResponse.json({error: "User not found"},{status:404});
    }

    const membership = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: session.user.activeOrgId,
            },
        },
        include: {
            organization: {
                include: { projects: true },
            },
        },
    });

    if(!membership){
        return NextResponse.json({error: "No Organization"},{status:400});
    }

    const activeOrg = membership.organization;
    const projectCount = activeOrg.projects.length;
    const limit = PLAN_LIMITS[activeOrg.plan].projects;

    if(projectCount >= limit){
        return NextResponse.json(
            {error: "Project limit reached, Upgrade plan"},
            {status: 403}
        )
    }

    const project = await prisma.$transaction(async (tx)=>{
        const project = await tx.project.create({
            data: {
                name,
                organizationId: activeOrg.id,
            },
        });

        await tx.projectMembership.create({
            data: {
                userId: user.id,
                projectId: project.id,
                role: "PROJECT_ADMIN",
            },
        });

        return project;
    });

    return NextResponse.json(project);
}