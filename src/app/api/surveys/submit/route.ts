import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      isAdultResident,
      gender,
      ageRange,
      stratum,
      neighborhood,
      cityTrack,
      mainProblem,
      mainProblemOther,
      managementRating,
      mayorCandidate,
      priorityTopics,
      firstChange,
    } = body;

    // Anonymous survey - fullName is optional, defaults to 'Anónimo'
    const respondentName = fullName?.trim() || "Anónimo";

    if (!isAdultResident) {
      return NextResponse.json(
        { error: "Debe indicar si es mayor de edad y reside en Ibagué" },
        { status: 400 }
      );
    }

    if (isAdultResident === "No") {
      return NextResponse.json(
        {
          error:
            "Este sondeo está dirigido exclusivamente a personas mayores de edad que residen actualmente en Ibagué.",
        },
        { status: 400 }
      );
    }

    if (
      !gender ||
      !ageRange ||
      !stratum ||
      !neighborhood?.trim() ||
      !cityTrack ||
      !mainProblem ||
      !managementRating ||
      !mayorCandidate
    ) {
      return NextResponse.json(
        { error: "Por favor complete todas las preguntas obligatorias." },
        { status: 400 }
      );
    }

    // Validate priorityTopics (max 2)
    const topics = Array.isArray(priorityTopics) ? priorityTopics : [];
    if (topics.length === 0 || topics.length > 2) {
      return NextResponse.json(
        { error: "Debe seleccionar hasta 2 temas prioritarios." },
        { status: 400 }
      );
    }

    // Obtain IP and User Agent
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const response = await db.surveyResponse.create({
      data: {
        surveyCode: "sondeo_ibague_1",
        fullName: respondentName,
        isAdultResident,
        gender,
        ageRange,
        stratum: String(stratum),
        neighborhood: neighborhood.trim(),
        cityTrack,
        mainProblem,
        mainProblemOther: mainProblem === "Otro" ? mainProblemOther?.trim() || null : null,
        managementRating,
        mayorCandidate,
        priorityTopics: JSON.stringify(topics),
        firstChange: firstChange?.trim() || null,
        ipAddress: ip,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Encuesta enviada exitosamente",
      id: response.id,
    });
  } catch (error) {
    console.error("Error al registrar encuesta:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar la respuesta. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
