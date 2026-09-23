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

    // Standard management rating
    const managementOrder = ["Muy buena", "Buena", "Regular", "Mala", "Muy mala", "No sabe/No responde"];
    const rawManagement = groupBy("managementRating");
    const managementStats = managementOrder.map((rating) => {
      const found = rawManagement.find((m) => m.name.toLowerCase() === rating.toLowerCase());
      return {
        name: rating,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      };
    });

    // Standard city track
    const trackOrder = ["Buen camino", "Mal camino", "No sabe/No responde"];
    const rawTrack = groupBy("cityTrack");
    const cityTrackStats = trackOrder.map((track) => {
      const found = rawTrack.find((t) => t.name.toLowerCase() === track.toLowerCase());
      return {
        name: track,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      };
    });

    // Standard mayor candidates
    const allCandidates = [
      "Jorge Bolívar",
      "Harold Urrea",
      "Felipe Ferro",
      "Cristian Ávila",
      "Óscar Berbeo",
      "William Rosas",
      "Ninguno de ellos",
      "Votaría en blanco",
      "No sabe/No responde",
    ];
    const rawCandidates = groupBy("mayorCandidate");
    const seenCandidates = new Set<string>();
    const mayorCandidateStats: { name: string; count: number; percentage: number }[] = [];
    for (const c of allCandidates) {
      const found = rawCandidates.find((item) => item.name.toLowerCase() === c.toLowerCase());
      mayorCandidateStats.push({
        name: c,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      });
      seenCandidates.add(c.toLowerCase());
    }
    for (const item of rawCandidates) {
      if (!seenCandidates.has(item.name.toLowerCase())) {
        mayorCandidateStats.push(item);
      }
    }
    mayorCandidateStats.sort((a, b) => b.count - a.count);

    // Standard main problem
    const allProblems = [
      "Movilidad y transporte",
      "Seguridad",
      "Empleo",
      "Servicios públicos",
      "Corrupción",
      "Salud",
      "Educación",
      "Otro",
      "No sabe/No responde",
    ];
    const rawProblems = groupBy("mainProblem");
    const seenProblems = new Set<string>();
    const mainProblemStats: { name: string; count: number; percentage: number }[] = [];
    for (const p of allProblems) {
      const found = rawProblems.find((item) => item.name.toLowerCase() === p.toLowerCase());
      mainProblemStats.push({
        name: p,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      });
      seenProblems.add(p.toLowerCase());
    }
    for (const item of rawProblems) {
      if (!seenProblems.has(item.name.toLowerCase())) {
        mainProblemStats.push(item);
      }
    }
    mainProblemStats.sort((a, b) => b.count - a.count);

    // Standard gender
    const genderOrder = ["Hombre", "Mujer", "Otro"];
    const rawGender = groupBy("gender");
    const genderStats = genderOrder.map((g) => {
      const found = rawGender.find((item) => item.name.toLowerCase() === g.toLowerCase());
      return {
        name: g,
        count: found ? found.count : 0,
        percentage: found ? found.percentage : 0,
      };
    });

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
