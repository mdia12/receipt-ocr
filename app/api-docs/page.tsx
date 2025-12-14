"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Book, 
  Key, 
  Server, 
  Code, 
  AlertTriangle, 
  Zap, 
  Copy, 
  Check, 
  ChevronRight,
  Terminal,
  FileJson,
  Webhook
} from "lucide-react";

export default function ApiDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group rounded-lg overflow-hidden bg-slate-900 border border-slate-800 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-400 uppercase">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-slate-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copiedId === id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon?: any; children: React.ReactNode }) => (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        {Icon && <Icon className="w-6 h-6 text-blue-600" />}
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );

  const EndpointBadge = ({ method, path }: { method: string; path: string }) => (
    <div className="flex items-center gap-3 font-mono text-sm bg-slate-100 p-2 rounded-md border border-slate-200 inline-flex mb-4">
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
        method === 'POST' ? 'bg-green-100 text-green-700' : 
        method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {method}
      </span>
      <span className="text-slate-700">{path}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200 min-h-[calc(100vh-4rem)] py-8 pr-8 sticky top-0 self-start">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-blue-600" />
              API Docs
            </h1>
            <p className="text-sm text-slate-500 mt-2">v1.0.0</p>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: "intro", label: "Introduction", icon: Book },
              { id: "auth", label: "Authentication", icon: Key },
              { id: "endpoints", label: "Endpoints", icon: Server },
              { id: "errors", label: "Error Codes", icon: AlertTriangle },
              { id: "limits", label: "Rate Limits", icon: Zap },
              { id: "integration", label: "Integration", icon: Code },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 md:pl-12 max-w-4xl">
          
          {/* Introduction */}
          <Section id="intro" title="Introduction" icon={Book}>
            <p className="text-slate-600 leading-relaxed mb-6">
              Welcome to the NovaReceipt API. This API allows you to programmatically extract structured data from receipt images, invoices, and PDFs using our advanced AI models.
              Send a JPG/PNG/PDF → get back clean JSON containing merchant, date, total amount, currency, line items, categories, and confidence scores.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                API Access Restricted
              </h3>
              <p className="text-sm text-amber-800">
                The API is only available for paid plans. Free accounts can use the web interface to upload and analyze receipts, but do not have access to an API key and will receive a <code className="bg-amber-100 px-1 rounded">401 Unauthorized</code> error.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Example Response Object
              </h3>
              <pre className="text-xs font-mono text-blue-800 overflow-x-auto">
{`{
  "merchant": "Carrefour Market",
  "date": "2025-12-03",
  "amount": 23.70,
  "currency": "EUR",
  "category": "Groceries",
  "confidence": 0.98,
  "items": [
    { "description": "Apples", "amount": 3.50 },
    { "description": "Milk", "amount": 1.20 }
  ]
}`}
              </pre>
            </div>
          </Section>

          {/* Authentication */}
          <Section id="auth" title="Authentication" icon={Key}>
            <p className="text-slate-600 mb-4">
              NovaReceipt uses API keys to authenticate requests. You can generate and manage your API keys from your <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>.
            </p>
            <p className="text-slate-600 mb-4">
              Keep your API keys private and secure. Do not expose them in frontend code or GitHub.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Authorization Header Format</h3>
              <CodeBlock 
                id="auth-header"
                language="http"
                code="Authorization: Bearer YOUR_API_KEY"
              />
              <p className="text-sm text-slate-500 italic">
                If an invalid or free-plan key is provided, the API will return <code className="bg-slate-100 px-1 rounded">401 Unauthorized</code>.
              </p>
            </div>
          </Section>

          {/* Endpoints */}
          <Section id="endpoints" title="Endpoints" icon={Server}>
            
            {/* POST /ocr */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Extract Data from Receipt</h3>
              <EndpointBadge method="POST" path="/api/v1/ocr" />
              <p className="text-slate-600 mb-4">
                Upload a receipt image or PDF to extract structured data. The processing is asynchronous for large files, but typically returns immediately for standard images.
              </p>
              
              <h4 className="font-semibold text-slate-900 mt-6 mb-2">Parameters</h4>
              <ul className="list-disc list-inside text-slate-600 mb-6 space-y-1">
                <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">file</code> (required): The image or PDF file to process (multipart/form-data).</li>
                <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">webhook_url</code> (optional): A URL to receive a POST request when processing is complete.</li>
              </ul>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">cURL Request</h4>
                  <CodeBlock 
                    id="curl-ocr"
                    language="bash"
                    code={`curl -X POST https://api.novareceipt.com/api/v1/ocr \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/receipt.jpg"`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Python Request</h4>
                  <CodeBlock 
                    id="python-ocr"
                    language="python"
                    code={`import requests

url = "https://api.novareceipt.com/api/v1/ocr"
files = {"file": open("receipt.jpg", "rb")}
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.post(url, files=files, headers=headers)
print(response.json())`}
                  />
                </div>
              </div>
            </div>

            {/* GET /status */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Get Job Status</h3>
              <EndpointBadge method="GET" path="/api/v1/status/{id}" />
              <p className="text-slate-600 mb-4">
                Retrieve the status and result of a processing job. Use this if the initial OCR request returned a <code className="text-sm bg-slate-100 px-1">processing</code> status.
              </p>

              <h4 className="font-semibold text-slate-900 mt-6 mb-2">Path Parameters</h4>
              <ul className="list-disc list-inside text-slate-600 mb-6 space-y-1">
                <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">id</code> (required): The Job ID received from the OCR endpoint.</li>
              </ul>

              <CodeBlock 
                id="curl-status"
                language="bash"
                code={`curl -X GET https://api.novareceipt.com/api/v1/status/job_12345 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              />
            </div>
          </Section>

          {/* Error Codes */}
          <Section id="errors" title="Error Codes" icon={AlertTriangle}>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-900 font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-200">Code</th>
                    <th className="px-6 py-3 border-b border-slate-200">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-3 font-mono text-red-600">400</td>
                    <td className="px-6 py-3 text-slate-600">Invalid or missing file</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-red-600">401</td>
                    <td className="px-6 py-3 text-slate-600">Invalid API key or no API key (free plan)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-red-600">413</td>
                    <td className="px-6 py-3 text-slate-600">File too large (max 10MB)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-red-600">429</td>
                    <td className="px-6 py-3 text-slate-600">Rate limit exceeded</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 font-mono text-red-600">500</td>
                    <td className="px-6 py-3 text-slate-600">Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Rate Limits */}
          <Section id="limits" title="Rate Limits" icon={Zap}>
            <p className="text-slate-600 mb-6">
              Rate limits depend on your subscription plan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 opacity-75">
                <h4 className="font-bold text-slate-900 mb-1">Free Plan</h4>
                <p className="text-2xl font-bold text-slate-400 mb-2">0</p>
                <p className="text-xs text-red-500 font-medium">No API Access</p>
              </div>
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <h4 className="font-bold text-blue-900 mb-1">Pro Plan</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">1,000</p>
                <p className="text-xs text-blue-700">requests / month</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-1">Enterprise</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">Custom</p>
                <p className="text-xs text-slate-500">contact sales</p>
              </div>
            </div>
          </Section>

          {/* Integration */}
          <Section id="integration" title="Integration Examples" icon={Code}>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-600" />
                n8n Webhook Integration
              </h3>
              <p className="text-slate-600 mb-4">
                You can easily integrate NovaReceipt with n8n to automate your expense reporting workflow.
              </p>
              <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-4">
                <li>Create a new workflow in n8n.</li>
                <li>Add an <strong>HTTP Request</strong> node.</li>
                <li>Set Method to <strong>POST</strong> and URL to <code className="text-xs bg-slate-100 px-1">https://api.novareceipt.com/api/v1/ocr</code>.</li>
                <li>Under Authentication, select <strong>Header Auth</strong> and add your API Key.</li>
                <li>In the Body parameters, select <strong>Multipart-form</strong> and upload your file field.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Node.js / Axios</h3>
              <CodeBlock 
                id="node-example"
                language="javascript"
                code={`const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function scanReceipt() {
  const form = new FormData();
  form.append('file', fs.createReadStream('receipt.jpg'));

  try {
    const response = await axios.post('https://api.novareceipt.com/api/v1/ocr', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    console.log('Receipt Data:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

scanReceipt();`}
              />
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
