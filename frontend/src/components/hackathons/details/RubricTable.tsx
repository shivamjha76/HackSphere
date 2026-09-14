"use client";

import React from "react";
import { EvaluationCriterionBrief } from "@/lib/api";
import { Scale, Info, CheckCircle2 } from "lucide-react";

interface RubricTableProps {
  criteria: EvaluationCriterionBrief[];
}

export const RubricTable: React.FC<RubricTableProps> = ({ criteria }) => {
  const totalMarks = criteria.reduce((sum, c) => sum + c.max_score, 0);

  // Fallback sample criteria matching UI screen #55 if none provided
  const displayCriteria: EvaluationCriterionBrief[] =
    criteria.length > 0
      ? criteria
      : [
          {
            id: 1,
            name: "Problem Definition",
            description: "Clarity and relevance of the problem statement and its real-world significance.",
            max_score: 15,
            weight: 1.0,
          },
          {
            id: 2,
            name: "Innovation & Creativity",
            description: "Originality of the idea and creativity in technological or process approach.",
            max_score: 20,
            weight: 1.0,
          },
          {
            id: 3,
            name: "Solution & Functionality",
            description: "How well the prototype works, addresses the problem, and handles edge cases.",
            max_score: 25,
            weight: 1.0,
          },
          {
            id: 4,
            name: "Technical Complexity",
            description: "Code quality, modern architecture, depth of technology stack, and engineering rigor.",
            max_score: 20,
            weight: 1.0,
          },
          {
            id: 5,
            name: "Impact & Scalability",
            description: "Potential for real-world adoption, commercial viability, and system scalability.",
            max_score: 10,
            weight: 1.0,
          },
          {
            id: 6,
            name: "Presentation & Demo",
            description: "Quality of the pitch, demonstration video, slides clarity, and team communication.",
            max_score: 10,
            weight: 1.0,
          },
        ];

  const calculatedTotal = displayCriteria.reduce((sum, c) => sum + c.max_score, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-5 rounded-2xl border border-blue-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Official Evaluation Rubric
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            All submissions will be evaluated blind by verified industry judges against these standard criteria.
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-xs text-slate-500 font-medium block">Total Marks</span>
          <span className="text-2xl font-extrabold text-blue-600 font-mono">
            {calculatedTotal} <span className="text-xs font-semibold text-slate-500">Pts</span>
          </span>
        </div>
      </div>

      {/* Criteria Breakdown Cards / Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Criteria Parameter</th>
                <th className="py-3.5 px-4 sm:px-6 hidden md:table-cell">Evaluation Description</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Max Score</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Weightage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayCriteria.map((c, index) => {
                const percentage = calculatedTotal > 0 ? Math.round((c.max_score / calculatedTotal) * 100) : 0;
                return (
                  <tr key={c.id || index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-mono font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span>{c.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 md:hidden">
                        {c.description}
                      </p>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 hidden md:table-cell leading-relaxed">
                      {c.description || "Evaluation criteria for project scoring."}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100">
                        {c.max_score} pts
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {percentage}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Judging Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Anomaly Detection & Bias Protection:</strong> HackSphere employs automated score variance analysis (Chapter 21) to detect scoring outliers among judges and ensure completely fair, objective evaluations for all participants.
        </p>
      </div>
    </div>
  );
};
