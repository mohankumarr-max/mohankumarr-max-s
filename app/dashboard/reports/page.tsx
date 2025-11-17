
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
// Note: In a real project, install these libraries. For this setup, we assume they are loaded via CDN.
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';

const ReportsPage: React.FC = () => {

    // Mock data
    const trendData = [
        { name: 'Jan', score: 92 }, { name: 'Feb', score: 94 }, { name: 'Mar', score: 93 },
        { name: 'Apr', score: 95 }, { name: 'May', score: 97 }, { name: 'Jun', score: 96 }
    ];
    const issueTypeData = [{ name: 'Critical', value: 25 }, { name: 'Non-critical', value: 75 }];
    const errorConcentrationData = [
        { rule: 'R-001', errors: 15 }, { rule: 'C-001', errors: 8 },
        { rule: 'R-002', errors: 22 }, { rule: 'C-002', errors: 5 }
    ];
    const COLORS = ['#FF8042', '#0088FE'];

    const exportToPDF = () => {
        alert("PDF export functionality would be implemented here using jsPDF.");
        // Example using jsPDF (if loaded)
        // const doc = new jsPDF();
        // doc.text("QA Report", 10, 10);
        // doc.autoTable({ html: '#qa-report-table' }); // Assuming a table with this id exists
        // doc.save('qa-report.pdf');
    };

    const exportToExcel = () => {
        alert("Excel export functionality would be implemented here using xlsx library.");
        // Example using XLSX (if loaded)
        // const ws = XLSX.utils.json_to_sheet(trendData);
        // const wb = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(wb, ws, "Reports");
        // XLSX.writeFile(wb, "qa-report.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold">Reports</h1>
                <div className="flex gap-2">
                    <button onClick={exportToPDF} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">Export to PDF</button>
                    <button onClick={exportToExcel} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Export to Excel</button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Trend Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Critical vs Non-critical Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={issueTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {issueTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Error Concentration by Rule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={errorConcentrationData}>
                                <XAxis dataKey="rule" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="errors" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;
