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
  theme?: string | null;
  mode?: string;
  status?: string;
  visibility?: string;
  min_team_size?: number;
  max_team_size?: number;
  max_participants?: number | null;
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



