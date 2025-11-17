import React, { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CsvRow {
  'Section Name'?: string;
  'QA User Name'?: string;
  'Date'?: string;
  'TOTAL Error Count'?: string;
  [key: string]: any;
}

// FIX: Define a more specific type for benchmark data to help TypeScript understand the shape of the data after calculations.
type CalculatedBenchmarkItem = {
    id: string;
    name: string;
    isHeader?: boolean;
    isSubHeader?: boolean;
    criticality?: string;
    customerRequired?: string;
    magnasoftQuality?: string;
    remarks?: string;
    errors?: number;
    quality?: string;
    accepted?: string;
};

const parseCsv = (text: string): CsvRow[] => {
  try {
    const lines = text.trim().replace(/\r/g, '').split('\n');
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const obj: Record<string, any> = {};
      header.forEach((key, i) => {
        let value: any = values[i] ? values[i].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/""/g, '"');
        obj[key] = value;
      });
      return obj;
    });
  } catch (error) {
    console.error("CSV parsing error:", error);
    return [];
  }
};

const unparseCsv = (data: CsvRow[]): string => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = String(row[header] ?? '');
                if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
                return value;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
};

const benchmarkTemplate = [
    { id: 'h-1', name: '(3.3). Completeness and correctness', isHeader: true },
    { id: 'sh-1', name: '1.a. 100% of the lines, symbols, indications and texts that are related to measurements are vectorized and categorized using cadastral classifications. If applicable one or more measurements can be disabled.', isSubHeader: true },
    { id: '1.a.1', name: 'Lines: all relevant point and lines correctly vectorized', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: '1.a.2', name: 'Text detect: all relevant textboxes marked', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.a.3', name: 'Text read: all relevant texts are correctly classified and vectorized', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: '1.a.4', name: 'Cadastral: all measurement lines and parallelisms have been correctly identified', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.a.5', name: 'Buildings: all buildings and semantic lines (like boundaries) correctly vectorized', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.a.6', name: 'Symbols: all symbols correctly vectorized', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: '1.a.7', name: 'GEN2 only: Coordinate list complete and correct', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.a.8', name: 'GEN3 only: TR-project correctly coupled', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: 'sh-2', name: '1.b. At least 95% of all possible links between field sketches and map information (BGT) has been made correctly.', isSubHeader: true },
    { id: '1.b.1', name: 'Point - point links between field sketches and BGT', criticality: 'Critical', customerRequired: '95%', magnasoftQuality: '95%' },
    { id: 'sh-3', name: '1.c. 100% of all the cadastral boundaries as depicted on the field sketch have been linked to the cadastral borders or the borders on the auxiliary map. Exceptions to this are cadastral borders for which, in the data delivered to the contractor, lines and points to either the cadastral map (BRK) or the auxiliary map are missing.', isSubHeader: true },
    { id: '1.c.1', name: 'Point - point links between field sketches and BRK', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.c.2', name: 'Point - line links between field sketches and BRK', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.c.3', name: 'Line - line links between field sketches and BRK', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: '1.c.4', name: 'Point - point links between field sketches and TR', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '98%' },
    { id: 'sh-4', name: '1.d. 100% of all links on numbered cadastral stones, iron poles and pickets between field sketches have been made.', isSubHeader: true },
    { id: '1.d.1', name: 'Kad Obj and Kad number correctly vectorized (Piket, Iron Pillar,Stone)', criticality: 'Critical', customerRequired: '', magnasoftQuality: '98%' },
    { id: 'sh-5', name: '1.e.1. At least 90% of all other links between field sketches within a section have been made correctly.', isSubHeader: true },
    { id: '1.e.1.1', name: 'All relevant neighbour sketches found', criticality: 'Non Critical', customerRequired: '90%', magnasoftQuality: '92%' },
    { id: '1.e.1.2', name: 'Point - point links between field sketches and neighbouring field sketches', criticality: 'Non Critical', customerRequired: '90%', magnasoftQuality: '92%' },
    { id: 'sh-6', name: '1.e.2. At least 90% of all other links between field sketches between sections have been made correctly.', isSubHeader: true },
    { id: '1.e.2.1', name: 'All relevant neighbour sketches found (Stiching)', criticality: 'Non Critical', customerRequired: '90%', magnasoftQuality: '92%' },
    { id: '1.e.2.2', name: 'Point - point links between field sketches and neighbouring field sketches (Stiching)', criticality: 'Non Critical', customerRequired: '90%', magnasoftQuality: '92%' },
    { id: 'h-2', name: '2 Adjustment checks', isHeader: true },
    { id: 'sh-7', name: '2.a. Are disabled observations disabled correctly', isSubHeader: true },
    { id: '2.a.1', name: 'Disabled measurements are rightfully disabled', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: 'h-3', name: '(3.5). Methodology', isHeader: true },
    { id: '3.5.a', name: 'Are adjustments delivered for each field sketch individually?', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: '3.5.b', name: 'Is an adjustment delivered for each flower', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: '3.5.c', name: 'Is each field sketch present in at least two cluster adjustments or are all field sketches of one section adjusted together in one adjustment', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: '3.5.d', name: 'Are exceptions to a, b or c validly explained?', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%' },
    { id: 'h-4', name: '(3.1). SA-profiles', isHeader: true },
    { id: '3.1.a', name: 'Has adjustment profile B only been used as few times as possible?', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: '3.1.c', name: 'Was any use of the B-profile sufficiently and acceptably explained?', criticality: 'Non Critical', customerRequired: '100%', magnasoftQuality: '96%' },
    { id: 'h-5', name: '(3.2). Adjustment and Testing', isHeader: true },
    { id: '3.2.a', name: 'F-tests < 1', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: 'sh-8', name: '3.2.b. W-tests: Are criteria met for individual field sketches?', isSubHeader: true },
    { id: '3.2.b.1', name: 'Adjustment of field sketch vectorization accepted', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: 'sh-9', name: '3.2.c. W-tests: Are criteria met for all flowers?', isSubHeader: true },
    { id: '3.2.c.1', name: 'Adjustment of linked sketches correct and accepted', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '100%', remarks: 'Entrance Check' },
    { id: 'sh-10', name: '3.2.d. W-tests: Are criteria met for all clusters?', isSubHeader: true },
    { id: '3.2.e', name: 'Are exceptions to a, b, c or d. sufficiently and acceptably explained?', criticality: 'Critical', customerRequired: '100%', magnasoftQuality: '96%' },
];

export default function QABenchmarkPage() {
  const [rawData, setRawData] = useState<CsvRow[]>([]);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if(text) {
            const data = parseCsv(text);
            setRawData(data);
            setSectionFilter("all");
            setUserFilter("all");
            setMonthFilter("all");
        }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sections = useMemo(() => ["all", ...Array.from(new Set(rawData.map((d) => d['Section Name']).filter(Boolean)))], [rawData]);
  const users = useMemo(() => ["all", ...Array.from(new Set(rawData.map((d) => d['QA User Name']).filter(Boolean)))], [rawData]);
  const months = useMemo(() => {
    const m = new Set<string>();
    rawData.forEach((d) => {
      if (d.Date && d.Date.length >= 7) m.add(d.Date.slice(0, 7));
    });
    return ["all", ...Array.from(m).sort()];
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.filter((row) => (
        (sectionFilter === "all" || row['Section Name'] === sectionFilter) &&
        (userFilter === "all" || row['QA User Name'] === userFilter) &&
        (monthFilter === "all" || row.Date?.slice(0, 7) === monthFilter)
    ));
  }, [rawData, sectionFilter, userFilter, monthFilter]);

  const totalFiles = filteredData.length;
  const totalErrorCount = filteredData.reduce((acc, r) => acc + (Number(r['TOTAL Error Count']) || 0), 0);
  const passCount = filteredData.filter(r => (Number(r['TOTAL Error Count']) || 0) === 0).length;
  const qualityPercentage = totalFiles ? ((passCount / totalFiles) * 100).toFixed(2) : '0.00';
  
  const calculatedBenchmarkData: CalculatedBenchmarkItem[] = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) {
        return benchmarkTemplate.map(item => ({...item, errors: 0, quality: '-', accepted: '-' }));
    }
    const csvHeaders = rawData.length > 0 ? Object.keys(rawData[0]) : [];

    return benchmarkTemplate.map(item => {
        if (item.isHeader || item.isSubHeader) return item;

        const matchingHeader = csvHeaders.find(h => h.trim() === item.name.trim());
        const errors = matchingHeader ? filteredData.reduce((acc, row) => acc + (Number(row[matchingHeader]) || 0), 0) : 0;
        const quality = total > 0 ? 100 * (1 - (errors / total)) : 100;
        
        let accepted = 'N/A';
        if (item.customerRequired) {
            const required = parseInt(item.customerRequired, 10);
            if (!isNaN(required)) accepted = quality >= required ? 'Yes' : 'No';
        } else {
            accepted = 'Yes';
        }

        return { ...item, errors, quality: quality.toFixed(0) + '%', accepted };
    });
  }, [filteredData, rawData]);

  const trendData = useMemo(() => {
    const map: { [key: string]: { month: string; files: number; errors: number } } = {};
    filteredData.forEach((row) => {
      const month = row.Date?.slice(0, 7) || "Unknown";
      if (!map[month]) map[month] = { month, files: 0, errors: 0 };
      map[month].files += 1;
      map[month].errors += Number(row['TOTAL Error Count']) || 0;
    });
    return Object.values(map).sort((a,b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const downloadCSV = () => {
    if (filteredData.length === 0) return;
    const csv = unparseCsv(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_qa_data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getQualityColor = (quality: string) => {
    const value = parseInt(quality, 10);
    if (isNaN(value)) return '';
    return value >= 95 ? 'text-green-600' : 'text-red-600';
  }

  const getAcceptedColor = (accepted: string) => {
      if (accepted === 'Yes') return 'text-green-600';
      if (accepted === 'No') return 'text-red-600';
      return '';
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader><CardTitle>QA Benchmark Dashboard</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700">
                <i data-lucide="upload" className="w-4 h-4 mr-2"></i>Upload CSV
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>
            <Button onClick={downloadCSV} disabled={filteredData.length === 0}>
                <i data-lucide="download" className="w-4 h-4 mr-2"></i>Export Filtered CSV
            </Button>
          </div>

          {rawData.length > 0 && (
            <div className="grid grid-cols-1 pt-4 border-t md:grid-cols-3 gap-4 border-border dark:border-dark-border">
              <Select onValueChange={setSectionFilter} value={sectionFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by Section" /></SelectTrigger>
                <SelectContent>{sections.map((sec) => (<SelectItem key={sec} value={sec}>{sec === 'all' ? 'All Sections' : sec}</SelectItem>))}</SelectContent>
              </Select>
              <Select onValueChange={setUserFilter} value={userFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by User" /></SelectTrigger>
                <SelectContent>{users.map((user) => (<SelectItem key={user} value={user}>{user === 'all' ? 'All Users' : user}</SelectItem>))}</SelectContent>
              </Select>
              <Select onValueChange={setMonthFilter} value={monthFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by Month" /></SelectTrigger>
                <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m === 'all' ? 'All Months' : m}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      {rawData.length === 0 && (
        <Card><CardContent className="pt-6 text-center text-muted-foreground">
            <p>Upload a CSV file to begin analysis.</p>
            <p className="text-xs">CSV headers must match the checklist items for calculations to work.</p>
        </CardContent></Card>
      )}

      {rawData.length > 0 && (
        <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle>Total Sketches</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalFiles}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Errors</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalErrorCount}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Pass %</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{qualityPercentage}%</p></CardContent></Card>
        </div>
        <Card>
            <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="files" name="Sketches" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" name="Errors" stroke="#ff4d4d" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>QA Benchmark Checklist</CardTitle></CardHeader>
            <CardContent>
                <div className="relative overflow-auto border rounded-md max-h-[600px]">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 text-xs uppercase bg-secondary dark:bg-dark-secondary">
                            <tr>
                                <th className="px-4 py-2 font-medium border-b w-2/5">Random sample checks</th>
                                <th className="px-4 py-2 font-medium border-b">Critical / Non Critical</th>
                                <th className="px-4 py-2 font-medium border-b">Customer Required Quality</th>
                                <th className="px-4 py-2 font-medium border-b">Magnasoft Quality</th>
                                <th className="px-4 py-2 font-medium border-b">Errors</th>
                                <th className="px-4 py-2 font-medium border-b">Quality %</th>
                                <th className="px-4 py-2 font-medium border-b">Accepted</th>
                                <th className="px-4 py-2 font-medium border-b">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                        {calculatedBenchmarkData.map((item) => {
                            if (item.isHeader) {
                                return (<tr key={item.id} className="font-bold bg-gray-100 dark:bg-gray-800"><td colSpan={8} className="p-2">{item.name}</td></tr>);
                            }
                            if (item.isSubHeader) {
                                return (<tr key={item.id} className="font-semibold bg-gray-50 dark:bg-gray-700"><td colSpan={8} className="p-2 pl-4">{item.name}</td></tr>);
                            }
                            return (
                                <tr key={item.id} className="border-b hover:bg-accent dark:hover:bg-dark-accent dark:border-dark-border last:border-b-0">
                                    <td className="px-4 py-2 pl-8">{item.name}</td>
                                    <td className="px-4 py-2">{item.criticality}</td>
                                    <td className="px-4 py-2">{item.customerRequired}</td>
                                    <td className="px-4 py-2">{item.magnasoftQuality}</td>
                                    <td className="px-4 py-2 font-semibold">{item.errors}</td>
                                    <td className={`px-4 py-2 font-semibold ${getQualityColor(item.quality ?? '')}`}>{item.quality}</td>
                                    <td className={`px-4 py-2 font-semibold ${getAcceptedColor(item.accepted ?? '')}`}>{item.accepted}</td>
                                    <td className="px-4 py-2">{item.remarks}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}