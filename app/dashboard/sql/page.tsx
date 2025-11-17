
import React, { useState } from 'react';
import { supabase } from '../../../firebase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { toast } from '../../../components/ui/Toaster';

const SqlEditorPage: React.FC = () => {
    const [query, setQuery] = useState('SELECT * FROM employees LIMIT 10;');
    const [results, setResults] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunQuery = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            // IMPORTANT: This feature requires a custom PostgreSQL function in your Supabase database.
            // Please create this function in your Supabase SQL Editor for this page to work.
            //
            // -- Step 1: Create a read-only role
            // CREATE ROLE readonly_user;
            // -- Step 2: Grant SELECT access on the tables you want to query
            // GRANT SELECT ON public.profiles, public.employees, public.qa_entries, public.qa_records TO readonly_user;
            // -- To grant on all tables: GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
            //
            // -- Step 3: Create the function to execute queries safely
            // CREATE OR REPLACE FUNCTION execute_sql(query text)
            // RETURNS json
            // LANGUAGE plpgsql
            // AS $$
            // BEGIN
            //   -- Enforce read-only access for this function's execution context
            //   EXECUTE 'SET LOCAL ROLE readonly_user';
            //
            //   -- Basic validation: only allow SELECT statements
            //   IF lower(trim(query)) NOT LIKE 'select %' THEN
            //     RAISE EXCEPTION 'Only SELECT statements are allowed.';
            //   END IF;
            //
            //   -- Execute the query and return the result as aggregated JSON
            //   RETURN (SELECT json_agg(t) FROM (EXECUTE query) t);
            // END;
            // $$;
            //
            // -- Step 4: Allow the anonymous user role to call this function
            // GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;

            const { data, error: rpcError } = await supabase.rpc('execute_sql', { query });

            if (rpcError) {
                throw rpcError;
            }

            if (data === null) {
                // This can happen for valid queries that return no rows.
                setResults([]);
                toast('Query executed successfully, no rows returned.', 'success');
            } else if (Array.isArray(data)) {
                 setResults(data);
                 toast(`Query returned ${data.length} rows.`, 'success');
            } else {
                // Handle cases where the JSON is not an array, maybe a single object.
                // For simplicity, we'll wrap it in an array.
                // FIX: Add a null check as `data` can still be null here due to the `Json` type definition.
                setResults(data ? [data] : []);
                if (data) {
                    toast('Query returned 1 row.', 'success');
                } else {
                    toast('Query executed successfully, no rows returned.', 'success');
                }
            }

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            toast(e.message, 'error');
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const headers = results && results.length > 0 ? Object.keys(results[0]) : [];

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">SQL Editor</h1>
            <p className="text-muted-foreground">
                Run read-only <code>SELECT</code> queries against your database. Requires a one-time function setup in Supabase.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Query</CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SELECT * FROM profiles;"
                        className="w-full h-40 p-2 font-mono text-sm border rounded-md dark:bg-dark-input dark:border-dark-border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleRunQuery}
                        disabled={isLoading}
                        className="w-full mt-4 md:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                Running...
                            </>
                        ) : 'Run Query'}
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
                    <CardHeader>
                        <CardTitle className="text-red-700 dark:text-red-400">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-3 text-sm text-red-800 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-300 whitespace-pre-wrap">
                            {error}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results ({results.length} rows)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {results.length > 0 ? (
                            <div className="relative overflow-auto border rounded-md max-h-[600px]">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="sticky top-0 text-xs uppercase bg-secondary dark:bg-dark-secondary">
                                        <tr>
                                            {headers.map(header => (
                                                <th key={header} className="px-4 py-2 font-medium border-b whitespace-nowrap">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-b dark:border-dark-border last:border-b-0 hover:bg-accent dark:hover:bg-dark-accent">
                                                {headers.map(header => (
                                                    <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap">
                                                        {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : String(row[header])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Query executed successfully, but returned no results.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SqlEditorPage;