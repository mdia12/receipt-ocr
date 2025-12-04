import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Server, Database, Code, Lock, Zap } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">API Documentation</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded-full">v1.0.0</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block col-span-1">
            <nav className="sticky top-24 space-y-1">
              <a href="#introduction" className="block px-3 py-2 text-sm font-medium text-slate-900 bg-slate-100 rounded-md">Introduction</a>
              <a href="#authentication" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">Authentication</a>
              <a href="#endpoints" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">Endpoints</a>
              <div className="pl-4 space-y-1">
                <a href="#ocr-ai" className="block px-3 py-2 text-sm text-slate-500 hover:text-slate-900">OCR & AI</a>
                <a href="#documents" className="block px-3 py-2 text-sm text-slate-500 hover:text-slate-900">Documents</a>
                <a href="#webhooks" className="block px-3 py-2 text-sm text-slate-500 hover:text-slate-900">Webhooks</a>
              </div>
              <a href="#workflows" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">Workflows</a>
              <a href="#data-models" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">Data Models</a>
              <a href="#sdks" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">SDK Examples</a>
              <a href="#security" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md">Security</a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3 space-y-12">
            
            {/* Introduction */}
            <section id="introduction" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Server className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Welcome to the NovaReceipt API documentation. Our platform provides a robust solution for extracting structured data from invoices, receipts, and financial documents using advanced OCR and AI technologies.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The system is built on a modern stack including <strong>Next.js 15+</strong>, <strong>Supabase</strong>, and <strong>FastAPI</strong>, leveraging <strong>Mistral AI</strong> for intelligent parsing.
              </p>
            </section>

            {/* Authentication */}
            <section id="authentication" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Lock className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Authentication & Security</h2>
              </div>
              <p className="text-slate-600">
                All API requests must be authenticated using Bearer tokens. We use Supabase Auth for user management and Row Level Security (RLS) to ensure data isolation.
              </p>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400">Authorization: Bearer YOUR_JWT_TOKEN</code>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Never expose your service role keys on the client side. Use public anon keys for client-side operations and strictly validate JWTs on the server.
                </p>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="space-y-8">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Endpoints</h2>
              </div>

              {/* OCR & AI Group */}
              <div id="ocr-ai" className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">FastAPI (OCR + AI)</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 font-mono text-sm font-bold rounded">POST</span>
                    <code className="text-slate-700 font-mono">/extract</code>
                  </div>
                  <p className="text-slate-600 text-sm">Extracts text and data from an uploaded document.</p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Request Body</h4>
                    <pre className="text-xs text-slate-700 font-mono overflow-x-auto">
{`{
  "file_url": "https://storage.googleapis.com/...",
  "document_type": "receipt" | "invoice"
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 font-mono text-sm font-bold rounded">POST</span>
                    <code className="text-slate-700 font-mono">/validate</code>
                  </div>
                  <p className="text-slate-600 text-sm">Validates extracted data against business rules using AI.</p>
                </div>
              </div>

              {/* Next.js API Group */}
              <div id="documents" className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Next.js API Routes</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-mono text-sm font-bold rounded">GET</span>
                    <code className="text-slate-700 font-mono">/api/documents</code>
                  </div>
                  <p className="text-slate-600 text-sm">Retrieves a list of user documents.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-100 text-red-700 font-mono text-sm font-bold rounded">DELETE</span>
                    <code className="text-slate-700 font-mono">/api/documents/{`{id}`}</code>
                  </div>
                  <p className="text-slate-600 text-sm">Permanently deletes a document and its associated data.</p>
                </div>
              </div>
            </section>

            {/* Workflows */}
            <section id="workflows" className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Code className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Workflows</h2>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">Processing Pipeline</h3>
                  <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-blue-300 font-mono">
{`graph LR
    A[User Upload] --> B[Next.js API]
    B --> C{File Type?}
    C -- PDF/Image --> D[FastAPI OCR]
    D --> E[Mistral AI Parsing]
    E --> F[Supabase DB]
    F --> G[Dashboard Update]`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">Authentication & RLS</h3>
                  <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-green-300 font-mono">
{`sequenceDiagram
    participant U as User
    participant S as Supabase Auth
    participant D as Database (RLS)
    
    U->>S: Login (Email/Pass)
    S-->>U: JWT Token
    U->>D: Request Data + JWT
    D->>D: Verify Token Signature
    D->>D: Check RLS Policy (uid == auth.uid())
    D-->>U: Return Protected Data`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Models */}
            <section id="data-models" className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Database className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Data Models</h2>
              </div>

              <div className="grid gap-6">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-mono text-sm font-bold text-slate-700">documents</div>
                  <div className="p-4 text-sm">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-100">
                          <th className="pb-2">Column</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-mono">id</td>
                          <td className="py-2 text-slate-500">uuid</td>
                          <td className="py-2">Primary Key</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-mono">user_id</td>
                          <td className="py-2 text-slate-500">uuid</td>
                          <td className="py-2">References auth.users</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-mono">status</td>
                          <td className="py-2 text-slate-500">enum</td>
                          <td className="py-2">'processing', 'completed', 'failed'</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono">metadata</td>
                          <td className="py-2 text-slate-500">jsonb</td>
                          <td className="py-2">Extracted fields (amount, date, etc.)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* SDK Examples */}
            <section id="sdks" className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Code className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">SDK Examples</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase">JavaScript (Fetch)</h3>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-blue-300 font-mono">
{`const response = await fetch('https://api.novareceipt.com/api/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ file_url: url })
});

const data = await response.json();`}
                  </pre>
                </div>

                <h3 className="text-sm font-bold text-slate-500 uppercase mt-6">Python (Requests)</h3>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-300 font-mono">
{`import requests

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.post(
    "https://api.novareceipt.com/api/documents",
    headers=headers,
    json={"file_url": url}
)

print(response.json())`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Versioning */}
            <section id="versioning" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Code className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Versioning</h2>
              </div>
              <p className="text-slate-600">
                The API is currently in version <strong>v1</strong>. All endpoints that might change in breaking ways will be versioned in the URL (e.g., <code>/api/v1/documents</code>).
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Changelog</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="font-mono text-slate-500">2025-12-04</span>
                    <span>Initial release of the API (v1.0.0)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Security</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li><strong>Rate Limiting:</strong> 100 requests per minute per IP.</li>
                <li><strong>CORS:</strong> Restricted to configured domains.</li>
                <li><strong>Secrets:</strong> Managed via environment variables, never committed to code.</li>
                <li><strong>Vulnerability Mitigation:</strong> We actively monitor and patch vulnerabilities like CVE-2025-55182 (React Server Components).</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
