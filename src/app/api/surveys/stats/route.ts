import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const responses = await db.surveyResponse.findMany({
      orderBy: { createdAt: "desc" },
    });

    const totalResponses = responses.length;

    // Today's responses
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayResponses = responses.filter((r) => new Date(r.createdAt) >= startOfToday).length;

    // Helper to group by single field
    const groupBy = (field: keyof (typeof responses)[0]) => {
      const counts: Record<string, number> = {};
      for (const r of responses) {
        const val = String(r[field] || "No especificado");
        counts[val] = (counts[val] || 0) + 1;
      }
      return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        percentage: totalResponses > 0 ? Number(((count / totalResponses) * 100).toFixed(1)) : 0,
      }));
    };

    // Helper for multi-select JSON topics
    const priorityTopicsCounts: Record<string, number> = {};
    for (const r of responses) {
      try {
        const topics = JSON.parse(r.priorityTopics || "[]") as string[];
        for (const t of topics) {
          priorityTopicsCounts[t] = (priorityTopicsCounts[t] || 0) + 1;
        }
      } catch {}
    }
    const priorityTopicsStats = Object.entries(priorityTopicsCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalResponses > 0 ? Number(((count / totalResponses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Grouping by standard order or descending
    const cityTrackStats = groupBy("cityTrack");
    const managementStats = groupBy("managementRating");
    const mayorCandidateStats = groupBy("mayorCandidate").sort((a, b) => b.count - a.count);
    const mainProblemStats = groupBy("mainProblem").sort((a, b) => b.count - a.count);
    const genderStats = groupBy("gender");

    // Standard age ordering
    const ageOrder = ["18-25", "26-35", "36-45", "46-55", "56-65", "66 o más"];
    const ageCounts = groupBy("ageRange");
    const ageRangeStats = ageOrder.map((range) => {
      const found = ageCounts.find((a) => a.name === range);
      return {
        name: range,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      };
    });

    // Standard stratum ordering
    const stratumOrder = ["1", "2", "3", "4", "5", "6", "No sabe"];
    const stratumCounts = groupBy("stratum");
    const stratumStats = stratumOrder.map((st) => {
      const found = stratumCounts.find((s) => s.name === st);
      return {
        name: st === "No sabe" ? "No sabe" : `Estrato ${st}`,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      };
    });

    // Neighborhoods frequency
    const neighborhoodCounts: Record<string, number> = {};
    for (const r of responses) {
      const val = r.neighborhood.trim();
      if (val) {
        neighborhoodCounts[val] = (neighborhoodCounts[val] || 0) + 1;
      }
    }
    const topNeighborhoods = Object.entries(neighborhoodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Open answers
    const openAnswers = responses
      .filter((r) => r.firstChange && r.firstChange.trim().length > 0)
      .map((r) => ({
        id: r.id,
        fullName: r.fullName || "Ciudadano",
        answer: r.firstChange!,
        neighborhood: r.neighborhood,
        ageRange: r.ageRange,
        gender: r.gender,
        createdAt: r.createdAt,
      }));

    // Daily responses trend (last 14 days)
    const dailyTrendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("es-CO", { month: "short", day: "numeric" });
      dailyTrendMap[key] = 0;
    }
    for (const r of responses) {
      const d = new Date(r.createdAt);
      const key = d.toLocaleDateString("es-CO", { month: "short", day: "numeric" });
      if (dailyTrendMap[key] !== undefined) {
        dailyTrendMap[key]++;
      }
    }
    const dailyTrend = Object.entries(dailyTrendMap).map(([date, count]) => ({
      date,
      respuestas: count,
    }));

    return NextResponse.json({
      totalResponses,
      todayResponses,
      cityTrackStats,
      managementStats,
      mayorCandidateStats,
      mainProblemStats,
      priorityTopicsStats,
      genderStats,
      ageRangeStats,
      stratumStats,
      topNeighborhoods,
      openAnswers,
      dailyTrend,
    });
  } catch (error) {
    console.error("Error fetching survey stats:", error);
    return NextResponse.json({ error: "Failed to fetch survey stats" }, { status: 500 });
  }
}
