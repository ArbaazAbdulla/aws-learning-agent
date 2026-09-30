import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse markdown roughly into blocks: code blocks, headers, lists, paragraphs
  const renderFormatted = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, partIdx) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let language = 'text';
        let codeLines = lines;
        if (lines[0] && !lines[0].includes(' ') && lines[0].length < 20) {
          language = lines[0];
          codeLines = lines.slice(1);
        }
        const codeText = codeLines.join('\n');

        return (
          <div key={partIdx} className="my-3 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-300">
              <span className="font-mono text-amber-400 font-medium lowercase">{language}</span>
              <button
                onClick={() => copyToClipboard(codeText, partIdx)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded hover:bg-slate-700/50"
                title="Copy code"
              >
                {copiedIndex === partIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs md:text-sm font-mono overflow-x-auto text-emerald-300/90 leading-relaxed whitespace-pre">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Normal text with bold, inline code, bullets, headers
      const lines = part.split('\n');
      return (
        <div key={partIdx} className="space-y-2">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lineIdx} className="h-2" />;
            }

            // Headers
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={lineIdx} className="text-base font-semibold text-amber-400 pt-2 pb-0.5 border-b border-slate-800">
                  {formatInline(trimmed.replace('### ', ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={lineIdx} className="text-lg font-bold text-amber-300 pt-3 pb-1 border-b border-slate-800">
                  {formatInline(trimmed.replace('## ', ''))}
                </h2>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={lineIdx} className="text-xl font-extrabold text-amber-200 pt-3 pb-1">
                  {formatInline(trimmed.replace('# ', ''))}
                </h1>
              );
            }

            // Bullet list
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lineIdx} className="flex items-start gap-2 pl-2 text-slate-200 text-sm">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <div className="flex-1 leading-relaxed">
                    {formatInline(trimmed.substring(2))}
                  </div>
                </div>
              );
            }

            // Numbered list
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lineIdx} className="flex items-start gap-2 pl-2 text-slate-200 text-sm">
                  <span className="font-mono text-amber-500 font-semibold text-xs mt-0.5 bg-amber-500/10 px-1 rounded">{numMatch[1]}</span>
                  <div className="flex-1 leading-relaxed">
                    {formatInline(numMatch[2])}
                  </div>
                </div>
              );
            }

            // Standard paragraph
            return (
              <p key={lineIdx} className="text-slate-200 text-sm leading-relaxed">
                {formatInline(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInline = (str: string) => {
    // Process bold, inline code, highlights
    const segments = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return segments.map((seg, idx) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={idx} className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/60">
            {seg.slice(1, -1)}
          </code>
        );
      }
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-amber-200">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      return seg;
    });
  };

  return <div className="markdown-body space-y-1">{renderFormatted(content)}</div>;
};
