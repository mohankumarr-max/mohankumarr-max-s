
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { GoogleGenAI } from '@google/genai';

const FeedbackPage: React.FC = () => {
    const [qaCase, setQaCase] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateFeedback = async () => {
        if (!qaCase.trim()) {
            setError('Please enter a QA case summary first.');
            setFeedback('');
            return;
        }
        setIsLoading(true);
        setFeedback('');
        setError('');

        try {
            // FIX: Use Gemini API to generate feedback
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: qaCase,
                config: {
                    systemInstruction: `You are an expert QA Analyst. Analyze the following QA case summary and provide constructive feedback. The feedback should include an overall analysis, specific suggestions for improvement with examples, and highlight both strengths and weaknesses. Format the response as HTML content with headings, paragraphs, and lists.
                    
                    Example response format:
                    <h3 class="text-lg font-semibold mb-2">Analysis of QA Case</h3>
                    <p class="mb-2">Overall summary of the interaction.</p>
                    <h4 class="font-semibold mt-4 mb-2">Strengths:</h4>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Strength 1.</li>
                        <li>Strength 2.</li>
                    </ul>
                    <h4 class="font-semibold mt-4 mb-2">Suggestions for Improvement:</h4>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Suggestion 1 with details.</li>
                        <li>Suggestion 2 with details.</li>
                    </ul>`,
                }
            });
            setFeedback(response.text);
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating feedback.');
            setFeedback('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">AI Feedback</h1>
            <p className="text-muted-foreground">Get smart suggestions and analysis for your QA cases.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Enter QA Case Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={qaCase}
                        onChange={(e) => setQaCase(e.target.value)}
                        placeholder="Paste or write a summary of the QA case here..."
                        className="w-full h-40 p-2 border rounded-md dark:bg-dark-input dark:border-dark-border"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerateFeedback}
                        disabled={isLoading}
                        className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {isLoading ? 'Generating...' : 'Generate AI Feedback'}
                    </button>
                </CardContent>
            </Card>

            {error && (
                <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900 dark:text-red-300 dark:border-red-600">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {(isLoading || feedback) && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI Generated Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: feedback }} />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default FeedbackPage;