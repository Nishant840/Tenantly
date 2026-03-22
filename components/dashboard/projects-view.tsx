"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatProjectRole } from "@/lib/format-role";

export type ProjectRow = {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  myRole: string | null;
  members: {
    userId: string;
    role: string;
    email: string;
    name: string | null;
  }[];
};

export type OrgMemberOption = {
  userId: string;
  email: string;
  name: string | null;
};

type ProjectsViewProps = {
  projects: ProjectRow[];
  orgMembers: OrgMemberOption[];
  currentUserId: string;
  canManage: boolean;
  /** Only org owners and admins may delete entire projects (not org members). */
  canDeleteProject: boolean;
  atLimit: boolean;
  limitDescription: string;
};

export function ProjectsView({
  projects,
  orgMembers,
  currentUserId,
  canManage,
  canDeleteProject,
  atLimit,
  limitDescription,
}: ProjectsViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignProject, setAssignProject] = useState<ProjectRow | null>(null);
  const [deleteProject, setDeleteProject] = useState<ProjectRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    projectId: string;
    userId: string;
    label: string;
  } | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState<"PROJECT_ADMIN" | "PROJECT_MEMBER">(
    "PROJECT_MEMBER",
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const assignableForProject = assignProject
    ? orgMembers.filter(
        (m) => !assignProject.members.some((pm) => pm.userId === m.userId),
      )
    : [];

  async function submitAssign() {
    if (!assignProject || !assignUserId) return;
    setAssignError(null);
    setAssignLoading(true);
    try {
      const res = await fetch("/api/projects/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: assignProject.id,
          userId: assignUserId,
          role: assignRole,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setAssignError(data.error ?? "Could not assign user.");
        setAssignLoading(false);
        return;
      }
      setAssignProject(null);
      setAssignUserId("");
      router.refresh();
    } catch {
      setAssignError("Something went wrong.");
    } finally {
      setAssignLoading(false);
    }
  }

  async function confirmRemoveFromProject() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/projects/remove-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: removeTarget.projectId,
          userId: removeTarget.userId,
        }),
      });
      if (res.ok) {
        setRemoveTarget(null);
        router.refresh();
      }
    } finally {
      setRemoveLoading(false);
    }
  }

  async function confirmDeleteProject() {
    if (!deleteProject) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: deleteProject.id }),
      });
      if (res.ok) {
        setDeleteProject(null);
        router.refresh();
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Projects
          </h1>
          <p className="mt-1 text-[var(--foreground-muted)]">
            Create and manage projects for your active organization.
          </p>
        </div>
        {canManage ? (
          <Button type="button" onClick={() => setCreateOpen(true)} disabled={atLimit}>
            Create project
          </Button>
        ) : null}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create project"
        description={limitDescription}
      >
        {atLimit ? (
          <p className="text-sm text-[var(--foreground-muted)]">
            You have reached the project limit for your current plan.
          </p>
        ) : (
          <CreateProjectForm
            idPrefix="modal-new-project"
            onSuccess={() => setCreateOpen(false)}
          />
        )}
      </Modal>

      <Modal
        open={!!assignProject}
        onClose={() => {
          setAssignProject(null);
          setAssignUserId("");
          setAssignError(null);
        }}
        title="Assign to project"
        description={
          assignProject
            ? `Add a teammate to “${assignProject.name}”. They must already belong to your organization.`
            : undefined
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssignProject(null)}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitAssign()}
              disabled={assignLoading || !assignUserId}
            >
              {assignLoading ? "Assigning…" : "Assign"}
            </Button>
          </>
        }
      >
        {assignProject ? (
          <div className="space-y-4">
            {assignError ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {assignError}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="assign-user">Team member</Label>
              <select
                id="assign-user"
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
              >
                <option value="">Select a member</option>
                {assignableForProject.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
              {assignableForProject.length === 0 ? (
                <p className="text-xs text-[var(--foreground-muted)]">
                  Everyone in the org is already on this project, or there are no
                  other members.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-role">Project role</Label>
              <select
                id="assign-role"
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
                value={assignRole}
                onChange={(e) =>
                  setAssignRole(e.target.value as "PROJECT_ADMIN" | "PROJECT_MEMBER")
                }
              >
                <option value="PROJECT_MEMBER">Member</option>
                <option value="PROJECT_ADMIN">Project admin</option>
              </select>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemoveFromProject()}
        title="Remove from project"
        description={
          removeTarget
            ? `Remove ${removeTarget.label} from this project? They will lose access to its resources.`
            : ""
        }
        confirmLabel="Remove"
        loading={removeLoading}
      />

      <ConfirmDialog
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={() => void confirmDeleteProject()}
        title="Delete project"
        description={
          deleteProject
            ? `Permanently delete “${deleteProject.name}” and remove all members from it? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete project"
        loading={deleteLoading}
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            canManage
              ? "Create your first project to start organizing work for this organization."
              : "An admin can create projects for this organization."
          }
          action={
            canManage && !atLimit ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Create project
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription>
                    {project.memberCount} member
                    {project.memberCount === 1 ? "" : "s"}
                    {project.myRole ? (
                      <>
                        {" · "}
                        Your role: {formatProjectRole(project.myRole)}
                      </>
                    ) : null}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Created{" "}
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAssignUserId("");
                          setAssignError(null);
                          setAssignProject(project);
                        }}
                      >
                        Assign user
                      </Button>
                      {canDeleteProject ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => setDeleteProject(project)}
                        >
                          Delete project
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  {project.members.length > 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                        Members
                      </p>
                      <ul className="space-y-2 text-sm">
                        {project.members.map((m) => (
                          <li
                            key={m.userId}
                            className="flex flex-wrap items-center justify-between gap-2"
                          >
                            <span className="text-[var(--foreground)]">
                              <span className="font-medium">
                                {m.name || m.email}
                              </span>
                              <span className="text-[var(--foreground-muted)]">
                                {" "}
                                · {formatProjectRole(m.role)}
                              </span>
                            </span>
                            {canManage && m.userId !== currentUserId ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-600 hover:text-red-700 dark:text-red-400"
                                onClick={() =>
                                  setRemoveTarget({
                                    projectId: project.id,
                                    userId: m.userId,
                                    label: m.name || m.email,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
