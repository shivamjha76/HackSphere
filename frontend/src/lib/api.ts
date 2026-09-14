export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  skills?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  xp: number;
  level: number;
  is_active: boolean;
  is_superuser: boolean;
  roles: string[];
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  bio?: string;
  skills?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hacksphere_token");
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hacksphere_token", token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hacksphere_token");
}

export function getStoredActiveRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hacksphere_active_role");
}

export function setStoredActiveRole(role: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hacksphere_active_role", role);
}

export function removeStoredActiveRole(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hacksphere_active_role");
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<TokenResponse> => {
    return apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  signup: async (payload: SignupPayload): Promise<TokenResponse> => {
    return apiFetch<TokenResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<UserOut> => {
    return apiFetch<UserOut>("/auth/me", {
      method: "GET",
    });
  },
};

export interface OrganizationBrief {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  is_verified: boolean;
}

export interface HackathonOut {
  id: number;
  organization_id: number;
  title: string;
  slug: string;
  tagline?: string | null;
  short_description?: string | null;
  detailed_description?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  theme?: string | null;
  mode: string;
  status: string;
  visibility: string;
  registration_start?: string | null;
  registration_end?: string | null;
  event_start?: string | null;
  event_end?: string | null;
  submission_start?: string | null;
  submission_end?: string | null;
  result_date?: string | null;
  min_team_size: number;
  max_team_size: number;
  max_participants?: number | null;
  prize_pool_summary?: string | null;
  participant_count: number;
  organization?: OrganizationBrief | null;
  created_at: string;
}

export interface EvaluationCriterionBrief {
  id: number;
  name: string;
  description?: string | null;
  max_score: number;
  weight: number;
}

export interface JudgeBrief {
  id: number;
  user_id: number;
  full_name: string;
  avatar_url?: string | null;
  expertise?: string | null;
}

export interface HackathonDetailOut extends HackathonOut {
  rules?: string | null;
  eligibility?: string | null;
  judging_start?: string | null;
  judging_end?: string | null;
  evaluation_criteria: EvaluationCriterionBrief[];
  judges: JudgeBrief[];
  teams_count: number;
  is_user_registered: boolean;
}

export interface HackathonRegistrationOut {
  id: number;
  hackathon_id: number;
  user_id: number;
  status: string;
  registered_at: string;
  xp_awarded: number;
  message: string;
}

export interface RegistrationStatusOut {
  is_registered: boolean;
  registration_id?: number | null;
}

export interface HackathonFilterParams {
  search?: string;
  mode?: string;
  status?: string;
  theme?: string;
  sort_by?: string;
}

export const hackathonsApi = {
  getExploreHackathons: async (
    params: HackathonFilterParams = {}
  ): Promise<HackathonOut[]> => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.mode && params.mode !== "all") query.set("mode", params.mode);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.theme && params.theme !== "all") query.set("theme", params.theme);
    if (params.sort_by) query.set("sort_by", params.sort_by);

    const qs = query.toString();
    const endpoint = `/hackathons${qs ? `?${qs}` : ""}`;
    return apiFetch<HackathonOut[]>(endpoint, { method: "GET" });
  },

  getBySlugOrId: async (slugOrId: string): Promise<HackathonOut> => {
    return apiFetch<HackathonOut>(`/hackathons/${slugOrId}`, { method: "GET" });
  },

  getDetail: async (slugOrId: string): Promise<HackathonDetailOut> => {
    return apiFetch<HackathonDetailOut>(`/hackathons/${slugOrId}`, { method: "GET" });
  },

  register: async (slugOrId: string): Promise<HackathonRegistrationOut> => {
    return apiFetch<HackathonRegistrationOut>(`/hackathons/${slugOrId}/register`, {
      method: "POST",
    });
  },

  getRegistrationStatus: async (slugOrId: string): Promise<RegistrationStatusOut> => {
    return apiFetch<RegistrationStatusOut>(`/hackathons/${slugOrId}/registration-status`, {
      method: "GET",
    });
  },
};

export interface OrganizationMemberBrief {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  joined_at: string;
}

export interface OrganizationListItem {
  id: number;
  name: string;
  slug: string;
  org_type: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description?: string | null;
  country: string;
  city?: string | null;
  is_verified: boolean;
  hackathons_count: number;
  created_at: string;
}

export interface OrganizationProfileOut {
  id: number;
  name: string;
  slug: string;
  org_type: string;
  logo_url?: string | null;
  cover_url?: string | null;
  official_email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  description?: string | null;
  country: string;
  state?: string | null;
  city?: string | null;
  is_verified: boolean;
  hackathons_count: number;
  total_participants_reached: number;
  active_hackathons: HackathonOut[];
  past_hackathons: HackathonOut[];
  members: OrganizationMemberBrief[];
  created_at: string;
}

export const organizationsApi = {
  listAll: async (params?: { search?: string; org_type?: string }): Promise<OrganizationListItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.org_type && params.org_type !== "all") query.set("org_type", params.org_type);
    const qs = query.toString();
    return apiFetch<OrganizationListItem[]>(`/organizations${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getBySlug: async (slugOrId: string): Promise<OrganizationProfileOut> => {
    return apiFetch<OrganizationProfileOut>(`/organizations/${slugOrId}`, { method: "GET" });
  },
};

export interface DeadlineItem {
  title: string;
  hackathon_title: string;
  hackathon_slug: string;
  deadline_date: string;
  days_left: number;
  milestone_type: string;
}

export interface ParticipantTeamSummary {
  team_id: number;
  team_name: string;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  members_count: number;
  max_members: number;
  is_leader: boolean;
  invite_code: string;
}

export interface ParticipantHackathonItem extends HackathonOut {
  registration_status: string;
  team?: ParticipantTeamSummary | null;
  submission_status?: string | null;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  event_type: string;
  xp_earned?: number | null;
}

export interface ParticipantDashboardStats {
  registered_count: number;
  teams_count: number;
  submissions_count: number;
  certificates_count: number;
}

export interface ParticipantDashboardOut {
  user: UserOut;
  stats: ParticipantDashboardStats;
  registered_hackathons: ParticipantHackathonItem[];
  teams: ParticipantTeamSummary[];
  upcoming_deadlines: DeadlineItem[];
  recent_activities: ActivityItem[];
}

export const dashboardApi = {
  getParticipantDashboard: async (): Promise<ParticipantDashboardOut> => {
    return apiFetch<ParticipantDashboardOut>("/dashboard/participant", { method: "GET" });
  },
};

export interface TeamMember {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  skills?: string | null;
  role: "leader" | "member" | string;
  status: string;
  joined_at: string;
}

export interface TeamCreatePayload {
  hackathon_id: number;
  name: string;
  track?: string | null;
}

export interface TeamJoinPayload {
  invite_code: string;
}

export interface TeamDetailOut {
  id: number;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  min_team_size: number;
  max_team_size: number;
  name: string;
  invite_code: string;
  track?: string | null;
  status: string;
  is_frozen: boolean;
  created_by_user_id?: number | null;
  members: TeamMember[];
  has_submission: boolean;
  created_at: string;
}

export interface TeamSummaryOut {
  id: number;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  name: string;
  invite_code: string;
  members_count: number;
  max_members: number;
  is_leader: boolean;
  is_frozen: boolean;
  created_at: string;
}

export const teamsApi = {
  create: async (payload: TeamCreatePayload): Promise<TeamDetailOut> => {
    return apiFetch<TeamDetailOut>("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  join: async (payload: TeamJoinPayload): Promise<TeamDetailOut> => {
    return apiFetch<TeamDetailOut>("/teams/join", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyTeams: async (): Promise<TeamSummaryOut[]> => {
    return apiFetch<TeamSummaryOut[]>("/teams/my", {
      method: "GET",
    });
  },

  getDetail: async (teamId: number): Promise<TeamDetailOut> => {
    return apiFetch<TeamDetailOut>(`/teams/${teamId}`, {
      method: "GET",
    });
  },

  transferLeadership: async (teamId: number, newLeaderUserId: number): Promise<TeamDetailOut> => {
    return apiFetch<TeamDetailOut>(`/teams/${teamId}/transfer-leadership`, {
      method: "POST",
      body: JSON.stringify({ new_leader_user_id: newLeaderUserId }),
    });
  },

  leave: async (teamId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/teams/${teamId}/leave`, {
      method: "POST",
    });
  },

  removeMember: async (teamId: number, userId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};

export interface SubmissionCreatePayload {
  team_id: number;
  project_title: string;
  tagline?: string | null;
  description?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  video_url?: string | null;
  presentation_url?: string | null;
  attachment_url?: string | null;
  is_final?: boolean;
}

export interface SubmissionUpdatePayload {
  project_title?: string | null;
  tagline?: string | null;
  description?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  video_url?: string | null;
  presentation_url?: string | null;
  attachment_url?: string | null;
  is_final?: boolean | null;
}

export interface SubmissionDetailOut {
  id: number;
  submission_code: string;
  team_id: number;
  team_name: string;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  project_title: string;
  tagline?: string | null;
  description?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  video_url?: string | null;
  presentation_url?: string | null;
  attachment_url?: string | null;
  version: number;
  is_final: boolean;
  is_locked: boolean;
  status: string;
  submitted_at: string;
  can_edit: boolean;
}

export interface SubmissionSummaryOut {
  id: number;
  submission_code: string;
  team_id: number;
  team_name: string;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  project_title: string;
  tagline?: string | null;
  status: string;
  version: number;
  is_locked: boolean;
  submitted_at: string;
}

export const submissionsApi = {
  create: async (payload: SubmissionCreatePayload): Promise<SubmissionDetailOut> => {
    return apiFetch<SubmissionDetailOut>("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (
    submissionId: number,
    payload: SubmissionUpdatePayload
  ): Promise<SubmissionDetailOut> => {
    return apiFetch<SubmissionDetailOut>(`/submissions/${submissionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getMySubmissions: async (): Promise<SubmissionSummaryOut[]> => {
    return apiFetch<SubmissionSummaryOut[]>("/submissions/my", {
      method: "GET",
    });
  },

  getDetail: async (submissionId: number): Promise<SubmissionDetailOut> => {
    return apiFetch<SubmissionDetailOut>(`/submissions/${submissionId}`, {
      method: "GET",
    });
  },

  getByTeamId: async (teamId: number): Promise<SubmissionDetailOut | null> => {
    return apiFetch<SubmissionDetailOut | null>(`/submissions/team/${teamId}`, {
      method: "GET",
    });
  },

  lock: async (submissionId: number): Promise<SubmissionDetailOut> => {
    return apiFetch<SubmissionDetailOut>(`/submissions/${submissionId}/lock`, {
      method: "POST",
    });
  },
};

export interface CertificateOut {
  id: number;
  certificate_code: string;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  org_name: string;
  certificate_type: "winner" | "runner_up" | "participation" | "judge" | "organizer" | string;
  title: string;
  recipient_name: string;
  team_name?: string | null;
  issue_date: string;
  qr_verification_url?: string | null;
  pdf_url?: string | null;
  is_valid: boolean;
}

export interface CertificateVerifyOut {
  certificate_code: string;
  is_valid: boolean;
  title: string;
  recipient_name: string;
  certificate_type: string;
  hackathon_title: string;
  hackathon_slug: string;
  org_name: string;
  team_name?: string | null;
  issue_date: string;
  verification_message: string;
}

export const certificatesApi = {
  getMyCertificates: async (): Promise<CertificateOut[]> => {
    return apiFetch<CertificateOut[]>("/certificates/my", {
      method: "GET",
    });
  },

  verify: async (codeOrId: string): Promise<CertificateVerifyOut> => {
    return apiFetch<CertificateVerifyOut>(`/certificates/verify/${codeOrId}`, {
      method: "GET",
    });
  },

  getDetail: async (id: number): Promise<CertificateOut> => {
    return apiFetch<CertificateOut>(`/certificates/${id}`, {
      method: "GET",
    });
  },
};

