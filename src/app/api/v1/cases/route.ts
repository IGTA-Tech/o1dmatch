import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.XOP_API_BASE || "https://www.xtraordinarypetitions.com";
const API_KEY = `Bearer ${process.env.XOP_KEY}`;
console.log("route.ts => ",API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.beneficiaryName?.trim()) {
      return NextResponse.json(
        { error: "beneficiaryName is required" },
        { status: 400 }
      );
    }

    const validVisaTypes = ["O-1A", "O-1B", "EB-1A", "EB-2 NIW"];
    if (!body.visaType || !validVisaTypes.includes(body.visaType)) {
      return NextResponse.json(
        { error: `visaType must be one of: ${validVisaTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/api/v1/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify({
        beneficiaryName: body.beneficiaryName.trim(),
        visaType: body.visaType,
        ...(body.fieldOfWork?.trim() && { fieldOfWork: body.fieldOfWork.trim() }),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? data?.error ?? "Failed to create case" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/cases error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}