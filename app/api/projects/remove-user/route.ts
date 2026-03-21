import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
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
        include:{orgMemberships:true},
    });

    if(!actor || actor.orgMemberships.length === 0){
        return NextResponse.json(
            {error: "No organization"},
            {status: 400}
        );
    }

    const orgMembership = actor.orgMemberships[0];

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

    return NextResponse.json({success: true});
}