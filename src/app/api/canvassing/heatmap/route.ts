export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

// Mock predictive heat map: returns simulated geographic clusters
// that suggest high-potential canvassing routes based on
// historical interest levels and demographic proxies.
export async function GET() {
  const clusters = [
    {
      id: "cluster-1",
      label: "High Propensity Zone A",
      center: { lat: 44.9778, lng: -93.2650 },
      radiusMeters: 400,
      score: 0.92,
      estimatedHomes: 48,
      avgInterest: "hot",
      topReason: "High conversion rate (34% Hot/Warm in last 60 days)",
    },
    {
      id: "cluster-2",
      label: "Growing Neighborhood B",
      center: { lat: 44.9560, lng: -93.2900 },
      radiusMeters: 350,
      score: 0.78,
      estimatedHomes: 62,
      avgInterest: "warm",
      topReason: "New construction builds — 80% owner-occupied",
    },
    {
      id: "cluster-3",
      label: "Established Area C",
      center: { lat: 44.9680, lng: -93.2750 },
      radiusMeters: 500,
      score: 0.65,
      estimatedHomes: 55,
      avgInterest: "warm",
      topReason: "Age 35-55 demographic, home value $350k-$500k",
    },
    {
      id: "cluster-4",
      label: "Renovation Hotspot D",
      center: { lat: 44.9620, lng: -93.2480 },
      radiusMeters: 300,
      score: 0.71,
      estimatedHomes: 33,
      avgInterest: "warm",
      topReason: "High permit volume for electrical/HVAC in last 12 months",
    },
    {
      id: "cluster-5",
      label: "Cold Zone — Avoid E",
      center: { lat: 44.9700, lng: -93.2550 },
      radiusMeters: 450,
      score: 0.22,
      estimatedHomes: 70,
      avgInterest: "do_not_knock",
      topReason: "High Do-Not-Knock rate (61% DNK), mostly rentals",
    },
  ];

  const summary = {
    totalPredictedHomes: clusters.reduce((s, c) => s + c.estimatedHomes, 0),
    highValueZones: clusters.filter((c) => c.score >= 0.7).length,
    recommendedStartZone: clusters[0].id,
    lastUpdated: new Date().toISOString(),
    dataPipeline: "Simulated — integrates county parcel data, historical visit outcomes, and US Census ACS demographics.",
  };

  return NextResponse.json({ clusters, summary });
}
