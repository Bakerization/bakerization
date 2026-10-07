export type ArtifactSource = "web" | "api" | "mcp";
/** members: login required (default). public: anyone with the link, no login. */
export type ArtifactVisibility = "members" | "public";

export type ResearchProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  ownerId: string | null;
  isDefault: boolean;
  artifactCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ResearchArtifactMeta = {
  id: string;
  projectId: string;
  projectSlug: string;
  projectName: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  title: string;
  description: string;
  sizeBytes: number;
  sha256: string;
  position: number;
  source: ArtifactSource;
  visibility: ArtifactVisibility;
  createdAt: string;
  updatedAt: string;
};

export type ResearchMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

export type ResearchActor = ResearchMember & {
  via: "session" | "apikey" | "oauth";
};
