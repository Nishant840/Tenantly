import { prisma } from "@/lib/prisma"
import { hashApiKey } from "./api-key"

export async function authenticateApiKey(req: Request){
    const authHeader = req.headers.get("authorization");

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return {error: "Missing API key"};
    }

    const rawKey = authHeader.split(" ")[1];
    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
        where: {
            keyHash
        }
    });

    if(!apiKey){
        return {error: "Invalid API key"};
    }

    if(apiKey.revokedAt){
        return {error: "API key revoked"};
    }

    return {
        organizationId: apiKey.organizationId,
    };
}