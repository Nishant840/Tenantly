import {prisma} from "@/lib/prisma"

type AuditParams = {
    action: string,
    userId?: string,
    organizationId?: string,
    resource?: string,
    ipAddress?: string
}

export async function logAudit({
    action,
    userId,
    organizationId,
    resource,
    ipAddress,
}: AuditParams){
    try{
        await prisma.auditLog.create({
            data: {
                action,
                userId,
                organizationId,
                resource,
                ipAddress,
            },
        });
    } catch(err){
        console.error("Audit log failed:", err);
    }
}