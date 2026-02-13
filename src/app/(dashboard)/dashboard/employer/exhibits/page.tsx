"use client";

import { useState, useEffect, useCallback } from "react";
import { ExhibitsClient, ExhibitPackage, PetitionCase } from "./exhibits-client";

export default function EmployerExhibitsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<ExhibitPackage[]>([]);
  const [cases, setCases] = useState<PetitionCase[]>([]);
  const [employerId, setEmployerId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exhibits/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed to load (${res.status})`);
      }
      const data = await res.json();
      setEmployerId(data.employerId || "");
      setCompanyName(data.companyName || "");
      setPackages(data.packages || []);
      setCases(data.cases || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-gray-500">Loading exhibits…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={fetchData} className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <ExhibitsClient
      packages={packages}
      cases={cases}
      employerId={employerId}
      companyName={companyName}
      onRefresh={fetchData}
    />
  );
}