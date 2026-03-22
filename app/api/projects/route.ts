import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json({error: "Unauthorized"},{status:401});
    }

    const orgId = session.user.activeOrgId;

    const membership = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: orgId,
            },
        },
    });

    if(!membership){
        return NextResponse.json({error: "No Organization"},{status:400});
    }

    const projects = await prisma.project.findMany({
        where: { organizationId: orgId },
        include: {
            _count: { select: { members: true } },
            members: {
                include: {
                    user: { select: { email: true, name: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const payload = projects.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        memberCount: p._count.members,
        myRole: p.members.find((m) => m.userId === session.user.id)?.role ?? null,
        members: p.members.map((m) => ({
            userId: m.userId,
            role: m.role,
            email: m.user.email,
            name: m.user.name,
        })),
    }));

    return NextResponse.json(payload);
}

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