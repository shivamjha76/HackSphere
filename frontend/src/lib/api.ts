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

export interface CriterionCreatePayload {
  name: string;
  description?: string | null;
  max_score: number;
  weight: number;
}

export interface HackathonCreatePayload {
  title: string;
  slug?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  detailed_description?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  theme?: string | null;
  mode?: string;
  status?: string;
  visibility?: string;
  min_team_size?: number;
  max_team_size?: number;
  max_participants?: number | null;
  max_teams?: number | null;
  prize_pool_summary?: string | null;
  rules?: string | null;
  eligibility?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  event_start?: string | null;
  event_end?: string | null;
  submission_start?: string | null;
  submission_end?: string | null;
  judging_start?: string | null;
  judging_end?: string | null;
  result_date?: string | null;
  criteria?: CriterionCreatePayload[];
}

export interface PhaseTransitionPayload {
  phase: string;
  override_reason?: string | null;
}

export interface SubmissionModerationPayload {
  status: "submitted" | "flagged" | "disqualified" | string;
  notes?: string | null;
}

export interface ManagedSubmissionItemOut {
  id: number;
  team_id: number;
  team_name: string;
  team_members_count: number;
  project_title: string;
  tagline?: string | null;
  description?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  video_url?: string | null;
  presentation_url?: string | null;
  attachment_url?: string | null;
  version: number;
  is_locked: boolean;
  status: string;
  submitted_at: string;
  evaluations_count: number;
  average_score?: number | null;
}

export interface HackathonManagementDetailOut {
  id: number;
  slug: string;
  title: string;
  tagline?: string | null;
  status: string;
  mode: string;
  theme?: string | null;
  min_team_size: number;
  max_team_size: number;
  prize_pool_summary?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  event_start?: string | null;
  event_end?: string | null;
  submission_start?: string | null;
  submission_end?: string | null;
  judging_start?: string | null;
  judging_end?: string | null;
  result_date?: string | null;
  total_registered: number;
  total_teams: number;
  total_submissions: number;
  locked_submissions_count: number;
  flagged_submissions_count: number;
  average_evaluations_per_submission: number;
  submissions: ManagedSubmissionItemOut[];
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

  getManagementDetail: async (slugOrId: string): Promise<HackathonManagementDetailOut> => {
    return apiFetch<HackathonManagementDetailOut>(`/hackathons/${slugOrId}/manage`, {
      method: "GET",
    });
  },

  transitionPhase: async (slugOrId: string, payload: PhaseTransitionPayload): Promise<HackathonManagementDetailOut> => {
    return apiFetch<HackathonManagementDetailOut>(`/hackathons/${slugOrId}/phase`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  moderateSubmission: async (
    slugOrId: string,
    submissionId: number,
    payload: SubmissionModerationPayload
  ): Promise<ManagedSubmissionItemOut> => {
    return apiFetch<ManagedSubmissionItemOut>(`/hackathons/${slugOrId}/submissions/${submissionId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  create: async (payload: HackathonCreatePayload): Promise<HackathonDetailOut> => {
    return apiFetch<HackathonDetailOut>("/hackathons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
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

export interface OrganizerStatsOut {
  total_hackathons: number;
  draft_hackathons: number;
  live_hackathons: number;
  completed_hackathons: number;
  total_participants: number;
  total_submissions: number;
  total_judges: number;
}

export interface ManagedHackathonItemOut {
  id: number;
  title: string;
  slug: string;
  mode: string;
  status: string;
  visibility: string;
  tagline?: string | null;
  theme?: string | null;
  short_description?: string | null;
  budget_or_revenue?: number | null;
  participant_count: number;
  submissions_count: number;
  teams_count: number;
  registration_end?: string | null;
  submission_end?: string | null;
  event_start?: string | null;
  event_end?: string | null;
}

export interface OrganizerActivityItemOut {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  event_type: string;
  hackathon_title?: string | null;
}

export interface OrganizerDashboardOut {
  organization_id: number;
  organization_name: string;
  organization_slug: string;
  organization_logo_url?: string | null;
  is_verified: boolean;
  stats: OrganizerStatsOut;
  hackathons: ManagedHackathonItemOut[];
  recent_activity: OrganizerActivityItemOut[];
}

export const dashboardApi = {
  getParticipantDashboard: async (): Promise<ParticipantDashboardOut> => {
    return apiFetch<ParticipantDashboardOut>("/dashboard/participant", { method: "GET" });
  },

  getOrganizerDashboard: async (): Promise<OrganizerDashboardOut> => {
    return apiFetch<OrganizerDashboardOut>("/dashboard/organizer", { method: "GET" });
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

export interface JudgeInvitePayload {
  email: string;
  expertise?: string | null;
}

export interface AutoDistributePayload {
  reviews_per_team: number;
  strategy?: string;
}

export interface ManualAssignmentPayload {
  judge_id: number;
  team_id: number;
}

export interface JudgeAssignmentItemOut {
  id: number;
  judge_id: number;
  judge_name: string;
  team_id: number;
  team_name: string;
  status: string;
  assigned_at: string;
  is_evaluated: boolean;
}

export interface AppointedJudgeOut {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  expertise?: string | null;
  status: string;
  assigned_at: string;
  assigned_teams_count: number;
  completed_evaluations_count: number;
  completion_percentage: number;
}

export interface HackathonJudgesOverviewOut {
  hackathon_id: number;
  hackathon_slug: string;
  hackathon_title: string;
  total_judges: number;
  total_teams: number;
  total_assignments: number;
  completed_assignments: number;
  overall_progress_percentage: number;
  judges: AppointedJudgeOut[];
  assignments: JudgeAssignmentItemOut[];
}

export const judgingApi = {
  getHackathonJudgesOverview: async (slugOrId: string): Promise<HackathonJudgesOverviewOut> => {
    return apiFetch<HackathonJudgesOverviewOut>(`/judging/hackathons/${slugOrId}`, {
      method: "GET",
    });
  },

  appointJudge: async (slugOrId: string, payload: JudgeInvitePayload): Promise<AppointedJudgeOut> => {
    return apiFetch<AppointedJudgeOut>(`/judging/hackathons/${slugOrId}/judges`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  autoDistribute: async (slugOrId: string, payload: AutoDistributePayload): Promise<HackathonJudgesOverviewOut> => {
    return apiFetch<HackathonJudgesOverviewOut>(`/judging/hackathons/${slugOrId}/distribute`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createManualAssignment: async (slugOrId: string, payload: ManualAssignmentPayload): Promise<JudgeAssignmentItemOut> => {
    return apiFetch<JudgeAssignmentItemOut>(`/judging/hackathons/${slugOrId}/assignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteAssignment: async (assignmentId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/judging/assignments/${assignmentId}`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------------------
// ANNOUNCEMENTS & LIVE BROADCAST APIS
// -------------------------------------------------------------------------

export interface AnnouncementAuthorBrief {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

export interface Announcement {
  id: number;
  hackathon_id: number;
  organization_id: number;
  author_id?: number | null;
  author_name?: string | null;
  author?: AnnouncementAuthorBrief | null;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  status: "published" | "scheduled" | "draft";
  target_audience: "all" | "participants" | "judges" | "team_leaders";
  is_pinned: boolean;
  scheduled_for?: string | null;
  views_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AnnouncementCreateInput {
  title: string;
  content: string;
  priority?: "normal" | "important" | "urgent";
  status?: "published" | "scheduled" | "draft";
  target_audience?: "all" | "participants" | "judges" | "team_leaders";
  is_pinned?: boolean;
  scheduled_for?: string | null;
}

export interface AnnouncementUpdateInput {
  title?: string;
  content?: string;
  priority?: "normal" | "important" | "urgent";
  status?: "published" | "scheduled" | "draft";
  target_audience?: "all" | "participants" | "judges" | "team_leaders";
  is_pinned?: boolean;
  scheduled_for?: string | null;
}

export interface AnnouncementStats {
  total_announcements: number;
  published_count: number;
  scheduled_count: number;
  draft_count: number;
  total_views: number;
  published_percentage: number;
  scheduled_percentage: number;
}

export const announcementsApi = {
  getAnnouncements: async (
    slugOrId: string,
    params?: { status?: string; priority?: string; search?: string }
  ): Promise<Announcement[]> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.priority && params.priority !== "all") query.set("priority", params.priority);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<Announcement[]>(`/announcements/hackathons/${slugOrId}${qs}`, {
      method: "GET",
    });
  },

  getAnnouncementStats: async (slugOrId: string): Promise<AnnouncementStats> => {
    return apiFetch<AnnouncementStats>(`/announcements/hackathons/${slugOrId}/stats`, {
      method: "GET",
    });
  },

  createAnnouncement: async (
    slugOrId: string,
    payload: AnnouncementCreateInput
  ): Promise<Announcement> => {
    return apiFetch<Announcement>(`/announcements/hackathons/${slugOrId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateAnnouncement: async (
    slugOrId: string,
    id: number,
    payload: AnnouncementUpdateInput
  ): Promise<Announcement> => {
    return apiFetch<Announcement>(`/announcements/hackathons/${slugOrId}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteAnnouncement: async (
    slugOrId: string,
    id: number
  ): Promise<{ message: string; id: number }> => {
    return apiFetch<{ message: string; id: number }>(
      `/announcements/hackathons/${slugOrId}/${id}`,
      {
        method: "DELETE",
      }
    );
  },

  togglePinAnnouncement: async (slugOrId: string, id: number): Promise<Announcement> => {
    return apiFetch<Announcement>(`/announcements/hackathons/${slugOrId}/${id}/pin`, {
      method: "POST",
    });
  },

  recordAnnouncementView: async (
    slugOrId: string,
    id: number
  ): Promise<{ id: number; views_count: number }> => {
    return apiFetch<{ id: number; views_count: number }>(
      `/announcements/hackathons/${slugOrId}/${id}/view`,
      {
        method: "POST",
      }
    );
  },
};

// ==========================================
// WINNERS, PODIUM & CERTIFICATE ENGINE TYPES (Step 27)
// ==========================================

export interface WinnerOut {
  id: number;
  hackathon_id: number;
  team_id: number;
  team_name: string;
  members_count: number;
  members: string[];
  submission_id?: number | null;
  project_title?: string | null;
  rank: number;
  title: string;
  prize_amount?: string | null;
  prize_type: string;
  notes?: string | null;
  is_published: boolean;
  announced_at: string;
  average_score?: number | null;
  created_at: string;
}

export interface LeaderboardEntryOut {
  rank: number;
  team_id: number;
  team_name: string;
  project_title: string;
  submission_id: number;
  average_score: number;
  evaluations_count: number;
  demo_url?: string | null;
  github_url?: string | null;
  is_winner: boolean;
}

export interface PrizeDistributionItemOut {
  rank: number;
  place_title: string;
  amount_summary: string;
  amount_in_words: string;
  prize_type: string;
  team_quantity: number;
  assigned_team_name?: string | null;
}

export interface PrizePoolOverviewOut {
  total_prize_pool_summary: string;
  total_winners_count: number;
  prizes: PrizeDistributionItemOut[];
}

export interface WinnerItemCreate {
  team_id: number;
  rank: number;
  title: string;
  prize_amount?: string;
  prize_type?: string;
  notes?: string;
}

export interface DeclareWinnersPayload {
  winners: WinnerItemCreate[];
  auto_issue_certificates?: boolean;
  broadcast_announcement?: boolean;
}

export interface BulkCertificateIssueResult {
  message: string;
  issued_count: number;
  skipped_count: number;
  total_certificates: number;
}

export interface WinnersDashboardOverviewOut {
  hackathon_id: number;
  hackathon_slug: string;
  hackathon_title: string;
  is_completed: boolean;
  total_submissions: number;
  total_evaluated: number;
  winners: WinnerOut[];
  prizes_overview: PrizePoolOverviewOut;
}

export const winnersApi = {
  getWinnersOverview: async (slugOrId: string): Promise<WinnersDashboardOverviewOut> => {
    return apiFetch<WinnersDashboardOverviewOut>(`/winners/hackathons/${slugOrId}`);
  },

  getLeaderboard: async (slugOrId: string): Promise<LeaderboardEntryOut[]> => {
    return apiFetch<LeaderboardEntryOut[]>(`/winners/hackathons/${slugOrId}/leaderboard`);
  },

  declareWinners: async (
    slugOrId: string,
    payload: DeclareWinnersPayload
  ): Promise<WinnersDashboardOverviewOut> => {
    return apiFetch<WinnersDashboardOverviewOut>(`/winners/hackathons/${slugOrId}/declare`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getPrizesOverview: async (slugOrId: string): Promise<PrizePoolOverviewOut> => {
    return apiFetch<PrizePoolOverviewOut>(`/winners/hackathons/${slugOrId}/prizes`);
  },

  getHackathonCertificates: async (slugOrId: string): Promise<CertificateOut[]> => {
    return apiFetch<CertificateOut[]>(`/winners/hackathons/${slugOrId}/certificates`);
  },

  bulkIssueCertificates: async (
    slugOrId: string,
    certificateType: "all" | "winner" | "participation" = "all"
  ): Promise<BulkCertificateIssueResult> => {
    return apiFetch<BulkCertificateIssueResult>(
      `/winners/hackathons/${slugOrId}/certificates/bulk-issue`,
      {
        method: "POST",
        body: JSON.stringify({ certificate_type: certificateType }),
      }
    );
  },
};

// ==========================================
// JUDGE PORTAL & EVALUATION ENGINE TYPES (Step 28)
// ==========================================

export interface JudgeAssignedHackathonOut {
  id: number;
  title: string;
  slug: string;
  organization_name: string;
  mode: string;
  total_teams: number;
  judging_end?: string | null;
  days_remaining: number;
  pending_reviews_count: number;
  completed_reviews_count: number;
}

export interface JudgeSubmissionQueueItemOut {
  submission_id: number;
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  team_id: number;
  team_name: string;
  team_code: string;
  project_title: string;
  tagline?: string | null;
  submitted_at: string;
  evaluation_status: "not_started" | "in_progress" | "completed";
  total_score?: number | null;
  evaluation_id?: number | null;
  demo_url?: string | null;
  github_url?: string | null;
}

export interface JudgeDashboardStatsOut {
  completed_evaluations: number;
  pending_evaluations: number;
  total_assigned_submissions: number;
  average_score_given: number;
}

export interface JudgeUpcomingDeadlineOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  judging_end?: string | null;
  days_remaining: number;
  pending_count: number;
}

export interface JudgeDashboardOverviewOut {
  judge_id: number;
  judge_name: string;
  expertise?: string | null;
  stats: JudgeDashboardStatsOut;
  assigned_hackathons: JudgeAssignedHackathonOut[];
  submissions_queue: JudgeSubmissionQueueItemOut[];
  upcoming_deadlines: JudgeUpcomingDeadlineOut[];
}

export interface JudgeSubmissionsFilterParams {
  hackathon_id?: number;
  status?: string;
  search?: string;
}

export interface RubricCriterionItem {
  id: number;
  name: string;
  description?: string | null;
  max_score: number;
  weight: number;
}

export interface EvaluationScoreItem {
  criterion_id: number;
  criterion_name: string;
  score: number;
}

export interface ExistingEvaluationOut {
  id: number;
  status: "draft" | "submitted";
  total_score: number;
  scores: EvaluationScoreItem[];
  feedback?: string | null;
  is_flagged_for_review: boolean;
  flag_reason?: string | null;
  updated_at?: string | null;
}

export interface SubmissionReviewTeamMemberOut {
  user_id: number;
  name: string;
  role: string;
  avatar_url?: string | null;
}

export interface SubmissionReviewTeamOut {
  id: number;
  name: string;
  invite_code: string;
  track?: string | null;
  members: SubmissionReviewTeamMemberOut[];
}

export interface SubmissionReviewHackathonOut {
  id: number;
  title: string;
  slug: string;
  organization_name: string;
  mode: string;
  event_start?: string | null;
  event_end?: string | null;
  judging_end?: string | null;
  total_teams: number;
}

export interface SubmissionReviewDetailOut {
  submission_id: number;
  submission_code: string;
  project_title: string;
  tagline?: string | null;
  description?: string | null;
  github_url?: string | null;
  live_demo_url?: string | null;
  video_url?: string | null;
  presentation_url?: string | null;
  attachment_url?: string | null;
  submitted_at: string;
  version: number;
  hackathon: SubmissionReviewHackathonOut;
  team: SubmissionReviewTeamOut;
  rubric_criteria: RubricCriterionItem[];
  existing_evaluation?: ExistingEvaluationOut | null;
}

export interface EvaluationScoreInput {
  criterion_id: number;
  score: number;
}

export interface EvaluationSubmitPayload {
  scores: EvaluationScoreInput[];
  feedback?: string | null;
  status: "draft" | "submitted";
  is_flagged_for_review?: boolean;
  flag_reason?: string | null;
}

export interface EvaluationResultOut {
  evaluation_id: number;
  submission_id: number;
  judge_id: number;
  total_score: number;
  status: string;
  feedback?: string | null;
  is_flagged_for_review: boolean;
  flag_reason?: string | null;
  scores: EvaluationScoreItem[];
  updated_at: string;
  message: string;
}

export const judgeApi = {
  getDashboard: async (): Promise<JudgeDashboardOverviewOut> => {
    return apiFetch<JudgeDashboardOverviewOut>("/judge/dashboard");
  },

  getSubmissionsQueue: async (
    params: JudgeSubmissionsFilterParams = {}
  ): Promise<JudgeSubmissionQueueItemOut[]> => {
    const query = new URLSearchParams();
    if (params.hackathon_id !== undefined) query.set("hackathon_id", String(params.hackathon_id));
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return apiFetch<JudgeSubmissionQueueItemOut[]>(`/judge/submissions${qs ? `?${qs}` : ""}`);
  },

  getAssignedHackathons: async (): Promise<JudgeAssignedHackathonOut[]> => {
    return apiFetch<JudgeAssignedHackathonOut[]>("/judge/hackathons");
  },

  getSubmissionForReview: async (submissionId: number): Promise<SubmissionReviewDetailOut> => {
    return apiFetch<SubmissionReviewDetailOut>(`/judge/submissions/${submissionId}/review`);
  },

  submitEvaluation: async (
    submissionId: number,
    payload: EvaluationSubmitPayload
  ): Promise<EvaluationResultOut> => {
    return apiFetch<EvaluationResultOut>(`/judge/submissions/${submissionId}/evaluate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getEvaluation: async (evaluationId: number): Promise<EvaluationResultOut> => {
    return apiFetch<EvaluationResultOut>(`/judge/evaluations/${evaluationId}`);
  },

  getGuidelines: async (hackathonId?: number): Promise<JudgingGuidelinesOut> => {
    const qs = hackathonId ? `?hackathon_id=${hackathonId}` : "";
    return apiFetch<JudgingGuidelinesOut>(`/judge/guidelines${qs}`);
  },

  declareConflictOfInterest: async (
    payload: ConflictOfInterestPayload
  ): Promise<ConflictOfInterestOut> => {
    return apiFetch<ConflictOfInterestOut>("/judge/conflict-of-interest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getLeaderboard: async (
    hackathonId?: number,
    track?: string,
    filterMode?: string
  ): Promise<JudgeLeaderboardOverviewOut> => {
    const params = new URLSearchParams();
    if (hackathonId) params.append("hackathon_id", String(hackathonId));
    if (track && track !== "all") params.append("track", track);
    if (filterMode && filterMode !== "all") params.append("filter_mode", filterMode);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<JudgeLeaderboardOverviewOut>(`/judge/leaderboards${qs}`);
  },
};

export interface JudgingRuleItem {
  id: number;
  title: string;
  description: string;
}

export interface JudgingDosDonts {
  dos: string[];
  donts: string[];
}

export interface JudgingMilestoneDates {
  judging_start?: string | null;
  judging_end?: string | null;
  feedback_release?: string | null;
}

export interface JudgingGuidelinesOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  countdown_seconds: number;
  rubric_criteria: RubricCriterionItem[];
  total_max_score: number;
  rules: JudgingRuleItem[];
  dos_and_donts: JudgingDosDonts;
  important_dates: JudgingMilestoneDates;
  conflict_of_interest_policy: string;
}

export interface ConflictOfInterestPayload {
  hackathon_id: number;
  team_id?: number;
  reason: string;
  notes?: string;
}

export interface ConflictOfInterestOut {
  id: number;
  judge_id: number;
  hackathon_id: number;
  team_id?: number | null;
  status: string;
  message: string;
}

export interface ScoreDistributionBracket {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface JudgeImpactMetrics {
  evaluations_submitted: number;
  consistency_score: number;
  average_deviation: number;
  strictness_label: string;
  agreement_rate: number;
  evaluated_sub_ids: number[];
}

export interface LeaderboardRankItem {
  rank: number;
  team_id: number;
  team_name: string;
  team_code: string;
  submission_id: number;
  project_title: string;
  tagline?: string | null;
  track?: string | null;
  demo_url?: string | null;
  github_url?: string | null;
  evaluations_count: number;
  required_evaluations: number;
  average_score: number;
  innovation_score?: number | null;
  technical_score?: number | null;
  presentation_score?: number | null;
  is_flagged_for_review: boolean;
  flag_reason?: string | null;
  current_judge_evaluated: boolean;
  current_judge_score?: number | null;
  current_judge_deviation?: number | null;
  is_winner: boolean;
  winner_rank?: number | null;
  winner_title?: string | null;
}

export interface JudgeLeaderboardOverviewOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  total_teams: number;
  scores_published: number;
  in_progress_scores: number;
  pending_scores: number;
  days_remaining: number;
  judging_status: string;
  tracks: string[];
  rankings: LeaderboardRankItem[];
  score_distribution: ScoreDistributionBracket[];
  judge_impact: JudgeImpactMetrics;
}

export interface DailyTrendItem {
  date: string;
  participants: number;
  teams: number;
  submissions: number;
}

export interface RoleDistributionItem {
  role_name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopPerformingTeamItem {
  rank: number;
  team_id: number;
  team_name: string;
  team_code: string;
  project_title: string;
  track?: string | null;
  average_score: number;
  evaluations_count: number;
  submission_id?: number | null;
}

export interface ManagedHackathonRef {
  id: number;
  title: string;
  slug: string;
  status: string;
}

export interface OrganizerReportsOverviewOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  organization_name: string;
  total_participants: number;
  participants_growth_pct: number;
  total_teams: number;
  teams_growth_pct: number;
  total_submissions: number;
  submissions_growth_pct: number;
  evaluations_completed: number;
  judging_growth_pct: number;
  page_views: number;
  views_growth_pct: number;
  date_range_label: string;
  role_distribution: RoleDistributionItem[];
  daily_trends: DailyTrendItem[];
  top_teams: TopPerformingTeamItem[];
  managed_hackathons: ManagedHackathonRef[];
}

export const reportsApi = {
  getOrganizerReports: async (
    hackathonId?: number
  ): Promise<OrganizerReportsOverviewOut> => {
    const qs = hackathonId ? `?hackathon_id=${hackathonId}` : "";
    return apiFetch<OrganizerReportsOverviewOut>(`/reports/organizer${qs}`);
  },
};

export interface OrgMemberOut {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: "owner" | "admin" | "moderator" | "viewer" | string;
  joined_at: string;
  status: string;
}

export interface InviteMemberIn {
  email: string;
  full_name: string;
  role: "admin" | "moderator" | "viewer" | string;
}

export interface ActivityLogOut {
  id: number;
  organization_id: number;
  user_id?: number | null;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface ActivityLogsListOut {
  logs: ActivityLogOut[];
  total_count: number;
  page: number;
  page_size: number;
  available_actions: string[];
}

export interface TeamMembersOverviewOut {
  organization_id: number;
  organization_name: string;
  is_verified: boolean;
  members: OrgMemberOut[];
  total_members: number;
  roles_summary: {
    owner: number;
    admin: number;
    moderator: number;
    viewer: number;
    [key: string]: number;
  };
}

export const teamMembersApi = {
  getMyMembers: async (): Promise<TeamMembersOverviewOut> => {
    return apiFetch<TeamMembersOverviewOut>("/organizations/my/members");
  },

  inviteMember: async (payload: InviteMemberIn): Promise<OrgMemberOut> => {
    return apiFetch<OrgMemberOut>("/organizations/my/members/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateMemberRole: async (
    memberId: number,
    role: string
  ): Promise<OrgMemberOut> => {
    return apiFetch<OrgMemberOut>(`/organizations/my/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  removeMember: async (memberId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(
      `/organizations/my/members/${memberId}`,
      {
        method: "DELETE",
      }
    );
  },

  getActivityLogs: async (params?: {
    search?: string;
    action?: string;
    days?: number;
    page?: number;
    page_size?: number;
  }): Promise<ActivityLogsListOut> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.action && params.action.toLowerCase() !== "all" && params.action.toLowerCase() !== "all actions") {
      query.append("action", params.action);
    }
    if (params?.days) query.append("days", params.days.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.page_size) query.append("page_size", params.page_size.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<ActivityLogsListOut>(`/organizations/my/activity-logs${qs}`);
  },
};

export interface OrganizationBillingUsageOut {
  active_hackathons: number;
  max_hackathons: number;
  participants: number;
  max_participants: number;
  submissions: number;
  max_submissions: number;
  storage_used_gb: number;
  max_storage_gb: number;
  reset_date_label: string;
}

export interface PaymentMethodOut {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface InvoiceItemOut {
  invoice_id: string;
  date: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  download_url: string;
}

export interface OrganizationBillingOverviewOut {
  organization_id: number;
  organization_name: string;
  is_verified: boolean;
  plan_tier: string;
  plan_price: number;
  billing_cycle: string;
  next_billing_date?: string | null;
  next_billing_label: string;
  billing_email: string;
  billing_address: string;
  usage: OrganizationBillingUsageOut;
  payment_methods: PaymentMethodOut[];
  invoices: InvoiceItemOut[];
}

export interface UpdateBillingProfileIn {
  billing_email: string;
  billing_address: string;
}

export interface OrganizationSettingsProfileOut {
  id: number;
  name: string;
  slug: string;
  org_type: string;
  description?: string | null;
  website_url?: string | null;
  official_email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  is_verified: boolean;
  logo_url?: string | null;
  cover_url?: string | null;
}

export interface UpdateOrgProfileIn {
  name?: string;
  description?: string;
  website_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const orgSettingsApi = {
  getBillingOverview: async (): Promise<OrganizationBillingOverviewOut> => {
    return apiFetch<OrganizationBillingOverviewOut>("/organizations/my/billing");
  },

  updateBillingProfile: async (
    payload: UpdateBillingProfileIn
  ): Promise<OrganizationBillingOverviewOut> => {
    return apiFetch<OrganizationBillingOverviewOut>("/organizations/my/billing", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getProfile: async (): Promise<OrganizationSettingsProfileOut> => {
    return apiFetch<OrganizationSettingsProfileOut>("/organizations/my/profile");
  },

  updateProfile: async (
    payload: UpdateOrgProfileIn
  ): Promise<OrganizationSettingsProfileOut> => {
    return apiFetch<OrganizationSettingsProfileOut>("/organizations/my/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  downloadInvoice: async (invoiceId: string): Promise<any> => {
    return apiFetch(`/organizations/my/billing/invoices/${invoiceId}/download`, {
      method: "POST",
    });
  },
};

// ==========================================
// ORGANIZER TEAMS & COHORT DIRECTORY (SCREEN #56)
// ==========================================

export interface OrganizerTeamMemberItem {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
}

export interface OrganizerTeamItemOut {
  id: number;
  hackathon_id: number;
  hackathon_title: string;
  name: string;
  invite_code: string;
  track?: string | null;
  status: "registered" | "shortlisted" | "disqualified" | string;
  is_frozen: boolean;
  project_title?: string | null;
  project_tagline?: string | null;
  project_description?: string | null;
  submission_id?: number | null;
  has_submission: boolean;
  github_url?: string | null;
  live_demo_url?: string | null;
  members_count: number;
  members: OrganizerTeamMemberItem[];
  registered_at: string;
}

export interface ManagedHackathonRef {
  id: number;
  title: string;
  slug: string;
  status: string;
  teams_count: number;
}

export interface OrganizerTeamsOverviewOut {
  hackathon_id: number;
  hackathon_title: string;
  managed_hackathons: ManagedHackathonRef[];
  total_teams: number;
  registered_count: number;
  shortlisted_count: number;
  disqualified_count: number;
  teams: OrganizerTeamItemOut[];
}

export interface UpdateTeamStatusIn {
  status: "registered" | "shortlisted" | "disqualified" | string;
  reason?: string;
}

export interface BulkUpdateTeamStatusIn {
  team_ids: number[];
  status: "registered" | "shortlisted" | "disqualified" | string;
  reason?: string;
}

export const organizerTeamsApi = {
  getOverview: async (params?: {
    hackathon_id?: number;
    status?: string;
    search?: string;
  }): Promise<OrganizerTeamsOverviewOut> => {
    const query = new URLSearchParams();
    if (params?.hackathon_id) query.set("hackathon_id", params.hackathon_id.toString());
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/organizer/teams?${queryString}` : "/organizer/teams";
    return apiFetch<OrganizerTeamsOverviewOut>(endpoint);
  },

  updateStatus: async (
    teamId: number,
    payload: UpdateTeamStatusIn
  ): Promise<OrganizerTeamItemOut> => {
    return apiFetch<OrganizerTeamItemOut>(`/organizer/teams/${teamId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  bulkUpdateStatus: async (
    payload: BulkUpdateTeamStatusIn
  ): Promise<{ success: boolean; updated_count: number; status: string; team_ids: number[] }> => {
    return apiFetch("/organizer/teams/bulk-status", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ==========================================
// ORGANIZER PRIZE DISTRIBUTION & PODIUM (SCREEN #57)
// ==========================================

export interface PrizeTierItemOut {
  id: number;
  rank: number;
  place_title: string;
  amount_summary: string;
  amount_in_words?: string | null;
  prize_type: string;
  team_quantity: number;
  assigned_team_id?: number | null;
  assigned_team_name?: string | null;
  assigned_team_track?: string | null;
  team_members_count: number;
  team_members_names: string[];
  disbursement_status: "disbursed" | "pending" | "ready" | string;
  transaction_reference?: string | null;
  disbursed_at?: string | null;
  notes?: string | null;
}

export interface PrizePoolSummaryOut {
  total_prize_pool: string;
  total_cash_amount: number;
  currency_symbol: string;
  total_winners_count: number;
  first_place: string;
  second_place: string;
  third_place: string;
  special_mentions: string;
  prizes: PrizeTierItemOut[];
}

export interface EligibleTeamRef {
  id: number;
  name: string;
  track?: string | null;
  members_count: number;
}

export interface OrganizerWinnersPrizesOverviewOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  status: string;
  managed_hackathons: ManagedHackathonRef[];
  summary: PrizePoolSummaryOut;
  available_teams: EligibleTeamRef[];
}

export interface UpdatePrizeTierIn {
  place_title?: string;
  amount_summary?: string;
  amount_in_words?: string;
  prize_type?: string;
  team_quantity?: number;
  assigned_team_id?: number;
  notes?: string;
}

export interface DisbursePrizeIn {
  transaction_reference: string;
  notes?: string;
}

export interface CreatePrizeTierIn {
  place_title: string;
  amount_summary: string;
  amount_in_words?: string;
  prize_type?: string;
  team_quantity?: number;
  assigned_team_id?: number;
  notes?: string;
}

export const organizerPrizesApi = {
  getPrizesOverview: async (params?: {
    hackathon_id?: number;
    search?: string;
  }): Promise<OrganizerWinnersPrizesOverviewOut> => {
    const query = new URLSearchParams();
    if (params?.hackathon_id) query.set("hackathon_id", params.hackathon_id.toString());
    if (params?.search) query.set("search", params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/organizer/winners/prizes?${queryString}` : "/organizer/winners/prizes";
    return apiFetch<OrganizerWinnersPrizesOverviewOut>(endpoint);
  },

  updatePrizeTier: async (
    prizeId: number,
    payload: UpdatePrizeTierIn
  ): Promise<PrizeTierItemOut> => {
    return apiFetch<PrizeTierItemOut>(`/organizer/winners/prizes/${prizeId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  disbursePrize: async (
    prizeId: number,
    payload: DisbursePrizeIn
  ): Promise<PrizeTierItemOut> => {
    return apiFetch<PrizeTierItemOut>(`/organizer/winners/prizes/${prizeId}/disburse`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createPrizeTier: async (
    hackathonId: number,
    payload: CreatePrizeTierIn
  ): Promise<PrizeTierItemOut> => {
    return apiFetch<PrizeTierItemOut>(`/organizer/winners/prizes/tiers?hackathon_id=${hackathonId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ==========================================
// 17. ORGANIZER VERIFIABLE CERTIFICATES (SCREEN #53 & CHAPTER 24)
// ==========================================

export interface CertificateTemplateOut {
  id: number;
  hackathon_id: number;
  name: string;
  template_type: string;
  description: string;
  target_audience: string;
  title_text: string;
  subtitle_text?: string | null;
  issuer_name: string;
  signatory_name: string;
  signatory_title: string;
  badge_text: string;
  theme: string;
  is_default: boolean;
  is_active: boolean;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface CertificateTemplateCreate {
  hackathon_slug?: string;
  hackathon_id?: number;
  name: string;
  template_type?: string;
  description: string;
  target_audience?: string;
  title_text?: string;
  subtitle_text?: string;
  issuer_name?: string;
  signatory_name?: string;
  signatory_title?: string;
  badge_text?: string;
  theme?: string;
}

export interface CertificateTemplateUpdate {
  name?: string;
  template_type?: string;
  description?: string;
  target_audience?: string;
  title_text?: string;
  subtitle_text?: string;
  issuer_name?: string;
  signatory_name?: string;
  signatory_title?: string;
  badge_text?: string;
  theme?: string;
  is_active?: boolean;
}

export interface OrganizerCertificateItemOut {
  id: number;
  certificate_code: string;
  hackathon_id: number;
  hackathon_title: string;
  recipient_name: string;
  team_id?: number | null;
  team_name?: string | null;
  team_position?: string | null;
  member_count: number;
  certificate_type: string;
  title: string;
  status: string;
  issue_date: string;
  qr_verification_url: string;
  pdf_url?: string | null;
  is_valid: boolean;
  template_id?: number | null;
  template_name?: string | null;
}

export interface OrganizerCertificatesSummaryOut {
  total_certificates: number;
  issued_count: number;
  pending_count: number;
  issued_percentage: string;
}

export interface OrganizerCertificatesDashboardOut {
  hackathon_id: number;
  hackathon_title: string;
  hackathon_slug: string;
  summary: OrganizerCertificatesSummaryOut;
  templates: CertificateTemplateOut[];
  certificates: OrganizerCertificateItemOut[];
}

export interface BulkCertificateActionPayload {
  hackathon_slug?: string;
  hackathon_id?: number;
  target?: string;
  template_id?: number;
}

export interface BulkCertificateActionResult {
  success: boolean;
  issued_count: number;
  skipped_count: number;
  message: string;
}

export interface EmailCertificatesPayload {
  hackathon_slug?: string;
  hackathon_id?: number;
  subject?: string;
  custom_message?: string;
  certificate_ids?: number[];
}

export interface EmailCertificatesResult {
  success: boolean;
  sent_count: number;
  message: string;
}

export const organizerCertificatesApi = {
  getCertificatesDashboard: async (params?: {
    hackathon_slug?: string;
    hackathon_id?: number;
  }): Promise<OrganizerCertificatesDashboardOut> => {
    const query = new URLSearchParams();
    if (params?.hackathon_slug) query.set("hackathon_slug", params.hackathon_slug);
    if (params?.hackathon_id) query.set("hackathon_id", params.hackathon_id.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<OrganizerCertificatesDashboardOut>(`/organizer/certificates${qs}`);
  },

  createTemplate: async (payload: CertificateTemplateCreate): Promise<CertificateTemplateOut> => {
    return apiFetch<CertificateTemplateOut>("/organizer/certificates/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTemplate: async (
    templateId: number,
    payload: CertificateTemplateUpdate
  ): Promise<CertificateTemplateOut> => {
    return apiFetch<CertificateTemplateOut>(`/organizer/certificates/templates/${templateId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  reissueCertificate: async (certificateId: number): Promise<OrganizerCertificateItemOut> => {
    return apiFetch<OrganizerCertificateItemOut>(`/organizer/certificates/${certificateId}/reissue`, {
      method: "POST",
    });
  },

  bulkIssueCertificates: async (payload: BulkCertificateActionPayload): Promise<BulkCertificateActionResult> => {
    return apiFetch<BulkCertificateActionResult>("/organizer/certificates/bulk-issue", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  emailCertificates: async (payload: EmailCertificatesPayload): Promise<EmailCertificatesResult> => {
    return apiFetch<EmailCertificatesResult>("/organizer/certificates/email-dispatch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getDownloadManifestUrl: (params?: { hackathon_slug?: string; hackathon_id?: number }): string => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const query = new URLSearchParams();
    if (params?.hackathon_slug) query.set("hackathon_slug", params.hackathon_slug);
    if (params?.hackathon_id) query.set("hackathon_id", params.hackathon_id.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";
    return `${apiBase}/organizer/certificates/download-all${qs}`;
  },
};










