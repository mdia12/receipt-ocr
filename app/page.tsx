import Link from "next/link";
import { UploadCloud } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-12 text-center">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Turn your messy receipts into <span className="text-blue-500">clean accounting data</span>.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload receipts (images/PDF), we process them with AI, and you get a structured Excel or PDF export ready for your accountant.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Upload Area Placeholder */}
      <div className="w-full max-w-2xl p-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group">
        <div className="flex flex-col items-center justify-center space-y-4 text-slate-400 group-hover:text-blue-400">
          <div className="p-4 bg-slate-800 rounded-full group-hover:bg-slate-800/80">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-200">
              Drag & drop receipts here
            </p>
            <p className="text-sm">or click to upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
