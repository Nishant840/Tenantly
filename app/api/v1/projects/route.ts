import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(req: Request){
    const auth = await authenticateApiKey(req);

    if("error" in auth){
        return NextResponse.json(
            {error: auth.error},
            {status: 401}
        );
    }

    const projects = await prisma.project.findMany({
        where: {
            organizationId: auth.organizationId,
        },
        select: {
            id: true,
            name: true,
            createdAt: true
        },
    });

    return NextResponse.json(projects);
}