"use server"

import { getServerSession } from "next-auth"
import authOptions from "../auth-options"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plans"
import { logAudit } from "../audit"

export async function createProject(formData: FormData){
    const name = formData.get("name") as string;

    if(!name){
        throw new Error("Project name required");
    }

    const session = await getServerSession(authOptions);

    if(!session?.user?.email || !session.user.id || !session.user.activeOrgId){
        throw new Error("Unauthroized");
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
    });

    if(!user){
        throw new Error("User not found");
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
        throw new Error("No organization");
    }

    const activeOrg = membership.organization;
    const limit = PLAN_LIMITS[activeOrg.plan].projects;

    if(activeOrg.projects.length >= limit){
        throw new Error("Project limit reached");
    }

    await prisma.$transaction(async (tx)=>{
        const project = await tx.project.create({
            data: {
                name,
                organizationId: activeOrg.id,
            },
        });

        await logAudit({
            action: "CREATE_PROJECT",
            userId: user.id,
            organizationId: activeOrg.id,
            resource: project.id,
        })

        await tx.projectMembership.create({
            data: {
                userId: user.id,
                projectId: project.id,
                role: "PROJECT_ADMIN",
            },
        });
    });
}
