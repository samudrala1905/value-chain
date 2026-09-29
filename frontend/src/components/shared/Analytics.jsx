import React from "react";
import { useVC } from "@/context/ValueChainContext";
import { CHART_COLORS } from "@/lib/format";
import { SectionTitle } from "@/components/shared/primitives";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend as RLegend,
} from "recharts";

const box = "rounded-xl border border-slate-200 bg-white p-4";

function ChartCard({ title, children, onClick, hint }) {
  return (
    <div className={box}>
      <SectionTitle right={hint && <span className="text-[11px] text-slate-400">{hint}</span>}>{title}</SectionTitle>
      <div className="h-52 w-full cursor-pointer" onClick={onClick}>{children}</div>
    </div>
  );
}

export default function Analytics({ onFilter }) {
  const { suppliers, scope3, scope3ByMaterial, catalogue, invitations, declarations } = useVC();

  const bySupplier = scope3.rows.map((r) => ({ name: r.name.split(" ")[0], emissions: Math.round(r.emissions / 1000), full: r.name })).sort((a, b) => b.emissions - a.emissions);
  const byMaterial = scope3ByMaterial.map((m) => ({ name: m.name.split(" ")[0], emissions: Math.round(m.emissions / 1000) }));

  const primaryCount = catalogue.filter((c) => ["PRIMARY_VERIFIED", "PRIMARY_DECLARED"].includes(c.dataClass)).length;
  const primaryVsSecondary = [
    { name: "Primary", value: primaryCount },
    { name: "Secondary/Proxy", value: catalogue.length - primaryCount },
  ];

  const pcfCoverage = [
    { name: "Verified PCF", value: catalogue.filter((c) => c.verification === "Verified").length },
    { name: "Declared PCF", value: catalogue.filter((c) => c.verification === "Self-declared").length },
    { name: "No/Proxy PCF", value: catalogue.filter((c) => c.verification === "Not verified").length },
  ];

  const qualityDist = [
    { band: "90-100", count: suppliers.filter((s) => s.score >= 90).length },
    { band: "75-89", count: suppliers.filter((s) => s.score >= 75 && s.score < 90).length },
    { band: "60-74", count: suppliers.filter((s) => s.score >= 60 && s.score < 75).length },
    { band: "<60", count: suppliers.filter((s) => s.score < 60).length },
  ];

  const responseTrend = [
    { m: "Oct", rate: 68 }, { m: "Nov", rate: 71 }, { m: "Dec", rate: 74 },
    { m: "Jan", rate: 79 }, { m: "Feb", rate: 81 }, { m: "Mar", rate: 82 },
  ];

  const topIntensity = suppliers
    .filter((s) => s.volume > 1)
    .map((s) => ({ name: s.name.split(" ")[0], intensity: s.pcfIntensity }))
    .sort((a, b) => b.intensity - a.intensity).slice(0, 6);

  const topContributors = bySupplier.slice(0, 6);

  const expiring = [
    { m: "Apr", count: 2 }, { m: "May", count: 1 }, { m: "Jun", count: 3 },
    { m: "Jul", count: 0 }, { m: "Aug", count: 2 },
  ];

  const dataGaps = suppliers.map((s) => ({ name: s.name.split(" ")[0], gap: 100 - s.score })).sort((a, b) => b.gap - a.gap).slice(0, 6);

  const tt = { fontSize: 11 };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Scope 3 Emissions by Supplier" hint="tCO2e · click to filter" onClick={() => onFilter?.("suppliers")}>
        <ResponsiveContainer><BarChart data={bySupplier}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={tt} /><YAxis tick={tt} /><Tooltip /><Bar dataKey="emissions" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Scope 3 Emissions by Material" hint="tCO2e" onClick={() => onFilter?.("catalogue")}>
        <ResponsiveContainer><BarChart data={byMaterial} layout="vertical"><XAxis type="number" tick={tt} /><YAxis type="category" dataKey="name" tick={tt} width={70} /><Tooltip /><Bar dataKey="emissions" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Primary vs Secondary Data Coverage" onClick={() => onFilter?.("catalogue")}>
        <ResponsiveContainer><PieChart><Pie data={primaryVsSecondary} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>{primaryVsSecondary.map((e, i) => <Cell key={i} fill={i === 0 ? CHART_COLORS[0] : CHART_COLORS[2]} />)}</Pie><Tooltip /><RLegend wrapperStyle={tt} /></PieChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Supplier PCF Coverage" onClick={() => onFilter?.("catalogue")}>
        <ResponsiveContainer><PieChart><Pie data={pcfCoverage} dataKey="value" nameKey="name" outerRadius={70}>{pcfCoverage.map((e, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><Tooltip /><RLegend wrapperStyle={tt} /></PieChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Supplier Data Quality Distribution" onClick={() => onFilter?.("scorecards")}>
        <ResponsiveContainer><BarChart data={qualityDist}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="band" tick={tt} /><YAxis tick={tt} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Supplier Response Trend" hint="%" onClick={() => onFilter?.("invitations")}>
        <ResponsiveContainer><LineChart data={responseTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="m" tick={tt} /><YAxis tick={tt} domain={[50, 100]} /><Tooltip /><Line type="monotone" dataKey="rate" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Highest Carbon-Intensity Materials" hint="kgCO2e/kg" onClick={() => onFilter?.("scorecards")}>
        <ResponsiveContainer><BarChart data={topIntensity}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={tt} /><YAxis tick={tt} /><Tooltip /><Bar dataKey="intensity" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Largest Scope 3 Contributors" hint="tCO2e" onClick={() => onFilter?.("suppliers")}>
        <ResponsiveContainer><BarChart data={topContributors} layout="vertical"><XAxis type="number" tick={tt} /><YAxis type="category" dataKey="name" tick={tt} width={70} /><Tooltip /><Bar dataKey="emissions" fill={CHART_COLORS[6]} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Declarations Expiring" hint="next 5 months" onClick={() => onFilter?.("declarations")}>
        <ResponsiveContainer><BarChart data={expiring}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="m" tick={tt} /><YAxis tick={tt} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Supplier Data Gaps" hint="quality gap · click to filter" onClick={() => onFilter?.("scorecards")}>
        <ResponsiveContainer><BarChart data={dataGaps}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={tt} /><YAxis tick={tt} /><Tooltip /><Bar dataKey="gap" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export function ScorecardRadar({ scores }) {
  const data = [
    { k: "Primary Data", v: scores.primaryData },
    { k: "Evidence", v: scores.evidence },
    { k: "PCF Avail.", v: scores.pcfAvailability },
    { k: "Verification", v: scores.verification },
    { k: "Freshness", v: scores.freshness },
    { k: "Methodology", v: scores.methodology },
    { k: "Timeliness", v: scores.timeliness },
    { k: "Traceability", v: scores.traceability },
  ];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid /><PolarAngleAxis dataKey="k" tick={{ fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Radar dataKey="v" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
