"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { judgeApi } from "@/lib/api";

export default function JudgeEvaluationRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params?.id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluationId || isNaN(evaluationId)) {
      router.replace("/judge/submissions");
      return;
    }

    const loadAndRedirect = async () => {
      try {
        const evalData = await judgeApi.getEvaluation(evaluationId);
        if (evalData?.submission_id) {
          router.replace(`/judge/submissions/${evalData.submission_id}/review`);
        } else {
          router.replace("/judge/submissions");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load evaluation.");
      }
    };

    loadAndRedirect();
  }, [evaluationId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-sm text-rose-400 font-semibold mb-4">{error}</p>
        <button
          onClick={() => router.push("/judge/submissions")}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      <p className="text-xs text-slate-400">Loading evaluation workspace...</p>
    </div>
  );
}
