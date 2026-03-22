import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    const membership = await prisma.orgMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: session.user.activeOrgId,
            },
        },
    });

    if(!membership){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgId = session.user.activeOrgId;

    const members = await prisma.orgMembership.findMany({
        where: {
            organizationId: orgId,
        },
        include: {
            user: {
                include: {
                    projectMemberships: {
                        include: {
                            project: {
                                select: {
                                    id: true,
                                    name: true,
                                    organizationId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const formatted = members.map((m)=>({
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        role: m.role,

        projects: m.user.projectMemberships.filter((pm) => pm.project.organizationId === orgId)
        .map((pm) => ({
            projectId: pm.project.id,
            projectName: pm.project.name,
        })),
    }));

    return NextResponse.json(formatted);
}