
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useCollection } from '../../firebase/useCollection'; // The hook now points to the mock DB

interface QaEntry {
    date: string | Date;
    score: number;
    agent: string;
}

interface Employee {
    name: string;
    submissions: number;
    score: number;
}

const DashboardPage: React.FC = () => {
    const { data: qaEntries, loading: loadingEntries } = useCollection<QaEntry>('qa_entries');
    const { data: employees, loading: loadingEmployees } = useCollection<Employee>('employees');

    const analytics = useMemo(() => {
        if (!qaEntries) return { averageScore: '0', totalSubmissions: 0, complianceRate: '0' };
        const totalSubmissions = qaEntries.length;
        if (totalSubmissions === 0) return { averageScore: '0', totalSubmissions: 0, complianceRate: '0' };

        const averageScore = qaEntries.reduce((acc, entry) => acc + Number(entry.score), 0) / totalSubmissions;
        const complianceRate = (qaEntries.filter((e) => e.score >= 90).length / totalSubmissions) * 100;
        return {
            averageScore: averageScore.toFixed(1),
            totalSubmissions,
            complianceRate: complianceRate.toFixed(1)
        };
    }, [qaEntries]);

    const qaTrendsData = useMemo(() => {
        if (!qaEntries) return [];
        // In a real app, you would aggregate data by week/month
        return qaEntries.map((e) => ({ name: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: e.score }));
    }, [qaEntries]);

    const topPerformers = useMemo(() => {
        if (!employees) return [];
        return [...employees].sort((a, b) => b.score - a.score).slice(0, 5);
    }, [employees]);

    if (loadingEntries || loadingEmployees) {
        return (
            <div className="space-y-4">
                 <div className="w-48 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                    <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                    <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                 </div>
                 <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Average QA Score</CardTitle>
                        <CardDescription>Overall quality performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{analytics.averageScore}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Submissions</CardTitle>
                        <CardDescription>This month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{analytics.totalSubmissions}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance Rate</CardTitle>
                        <CardDescription>Percentage of scores above 90%</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{analytics.complianceRate}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>QA Trends</CardTitle>
                        <CardDescription>Daily average score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={qaTrendsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Team Performance</CardTitle>
                        <CardDescription>Average score by agent</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={employees}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-secondary dark:bg-dark-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Agent</th>
                                    <th scope="col" className="px-6 py-3">Submissions</th>
                                    <th scope="col" className="px-6 py-3">Average Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPerformers.map((employee) => (
                                    <tr key={employee.name} className="border-b dark:border-dark-border">
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{employee.name}</td>
                                        <td className="px-6 py-4">{employee.submissions}</td>
                                        <td className="px-6 py-4">{employee.score.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;
