import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as XLSX from "xlsx";

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

    const rows = responses.map((r, index) => {
      let parsedTopics = "";
      try {
        const topics = JSON.parse(r.priorityTopics || "[]");
        parsedTopics = Array.isArray(topics) ? topics.join(", ") : "";
      } catch {
        parsedTopics = r.priorityTopics;
      }

      const formattedDate = new Date(r.createdAt).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return {
        "N°": index + 1,
        "ID Respuesta": r.id,
        "Fecha y Hora": formattedDate,
        "Nombre Completo": r.fullName || "Sin nombre",
        "Mayor de edad y residente en Ibagué": r.isAdultResident,
        "Sexo": r.gender,
        "Rango de Edad": r.ageRange,
        "Estrato Socioeconómico": r.stratum === "No sabe" ? "No sabe" : `Estrato ${r.stratum}`,
        "Comuna / Barrio / Corregimiento": r.neighborhood,
        "Rumbo de Ibagué": r.cityTrack,
        "Principal problema de Ibagué": r.mainProblem,
        "Detalle Otro problema": r.mainProblemOther || "",
        "Calificación gestión Alcaldía": r.managementRating,
        "Intención de voto Alcalde": r.mayorCandidate,
        "Temas prioritarios próximo Alcalde": parsedTopics,
        "Lo primero que le gustaría cambiar (Abierta)": r.firstChange || "",
        "Dirección IP": r.ipAddress || "",
      };
    });

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const columnWidths = [
      { wch: 6 },  // N°
      { wch: 26 }, // ID
      { wch: 20 }, // Fecha
      { wch: 28 }, // Nombre Completo
      { wch: 22 }, // Mayor de edad
      { wch: 12 }, // Sexo
      { wch: 14 }, // Edad
      { wch: 16 }, // Estrato
      { wch: 30 }, // Barrio
      { wch: 18 }, // Rumbo
      { wch: 30 }, // Principal problema
      { wch: 25 }, // Detalle Otro
      { wch: 22 }, // Calificación
      { wch: 25 }, // Intención voto
      { wch: 45 }, // Temas prioritarios
      { wch: 50 }, // Abierta
      { wch: 16 }, // IP
    ];
    worksheet["!cols"] = columnWidths;

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Respuestas Sondeo");

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const nowStr = new Date().toISOString().split("T")[0];
    const filename = `Sondeo_Ibague_Respuestas_${nowStr}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting survey excel:", error);
    return NextResponse.json({ error: "Failed to export survey data" }, { status: 500 });
  }
}
