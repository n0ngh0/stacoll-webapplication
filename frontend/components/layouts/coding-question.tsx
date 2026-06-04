"use client";
import { useState, memo } from "react";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Play, Terminal, ChevronRight, ChevronLeft, SendHorizontal, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { apiFetch } from "@/lib/api/client";

interface CodingProps {
  title: string;
  description: React.ReactNode;
  code: string;
  language: string;
  languageId: number;
  testCases: any[];
  problemId: string;
  skillId: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const CodingQuestion = memo(function CodingQuestion({
  title,
  description,
  code,
  language,
  languageId,
  testCases,
  problemId,
  skillId,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}: CodingProps) {

  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [isCompiling, setIsCompiling] = useState(false);

  const handleRun = async () => {
    setIsCompiling(true);
    setOutput("Executing code...");
    try {
      // Let's test against the first public test case
      const publicTestCase = testCases?.find(tc => !tc.isHidden);
      const stdin = publicTestCase ? publicTestCase.input : "";

      const res = await apiFetch("/assessment/execute", {
        auth: false,
        method: "POST",
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: stdin,
        }),
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const jd0 = data.data;
        if (jd0.status?.id === 3) {
          setOutput(`Status: Accepted\n\nOutput:\n${jd0.stdout || ""}`);
        } else {
          setOutput(`Status: ${jd0.status?.description}\n\nError/Output:\n${jd0.compile_output || jd0.stderr || jd0.stdout || ""}`);
        }
      } else {
        setOutput(`Failed to execute code on server.\nReason: ${data.message || "Unknown Error"}\nDetails: ${data.error || JSON.stringify(data.data || {})}`);
      }
    } catch (err: any) {
      setOutput(`Network Error or Server Crash: ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    setOutput("Verifying against all test cases (including hidden)...");
    setIsVerified(false);
    try {
      const res = await apiFetch(`/assessment/${skillId}/verify-problem/${problemId}`, {
        method: "POST",
        body: JSON.stringify({
          source_code: code,
        })
      });
      const data = await res.json();
      
      if (data.success) {
        let outStr = `Verification Results: ${data.passed ? "✅ All Tests Passed!" : "❌ Some Tests Failed."}\n\n`;
        data.results?.forEach((r: any) => {
          outStr += `Test Case ${r.testCaseIndex} [${r.isHidden ? 'HIDDEN' : 'PUBLIC'}]: ${r.passed ? '✅ Passed' : '❌ Failed'}\n`;
          if (!r.passed && !r.isHidden) {
            outStr += `  Input: ${r.input}\n  Expected: ${r.expectedOutput}\n  Actual: ${r.actualOutput}\n`;
          } else if (!r.passed && r.isHidden) {
            outStr += `  (Hidden test cases do not reveal inputs/outputs)\n`;
          }
        });
        setOutput(outStr);
        if (data.passed) setIsVerified(true);
      } else {
        setOutput(`Verification failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      setOutput("Network Error during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Group orientation="horizontal">
          
          {/* Problem Description Area (Left Panel) */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full bg-canvas border-r border-border-subtle flex flex-col overflow-y-auto custom-scrollbar">
              <div className="p-8 pb-10 flex-1">
                <div className="mb-8">
                  <h2 className="text-sm font-black tracking-widest text-brand-secondary uppercase mb-2">Question Description</h2>
                  <h3 className="text-2xl font-bold text-text-main leading-snug">{title}</h3>
                </div>

                <div className="prose prose-invert max-w-none prose-p:text-text-muted prose-headings:text-text-main prose-strong:text-text-main prose-code:bg-surface-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-hover prose-pre:border prose-pre:border-border-subtle">
                  {typeof description === 'string' ? <SafeMarkdown>{description}</SafeMarkdown> : description}
                </div>

                {/* Optional: Show public test cases here if needed */}
                {testCases && testCases.filter(tc => !tc.isHidden).length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider">Example Test Cases</h4>
                    <div className="space-y-4">
                      {testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                        <div key={idx} className="bg-surface border border-border-subtle rounded-xl p-4">
                          <div className="text-xs font-bold text-text-muted mb-1">Input:</div>
                          <pre className="text-sm text-text-main bg-canvas p-2 rounded-lg mb-3">{tc.input}</pre>
                          <div className="text-xs font-bold text-text-muted mb-1">Expected Output:</div>
                          <pre className="text-sm text-text-main bg-canvas p-2 rounded-lg">{tc.expectedOutput}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Resizer Handle */}
          <Separator className="w-1.5 bg-border-subtle hover:bg-brand-secondary active:bg-brand-secondary transition-colors cursor-col-resize z-10" />

          {/* Code Editor Area (Right Panel) */}
          <Panel defaultSize={75} minSize={30}>
            <div className="h-full flex flex-col bg-surface relative">
              <div className="flex-1 relative flex overflow-hidden shadow-inner">
                <Editor
                  height="100%"
                  language={language || "python"}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => onChange(val || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {/* Terminal Output Area */}
              <div className="h-[200px] bg-canvas border-t border-border-subtle flex flex-col shrink-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface/50">
                  <div className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-wider">
                    <Terminal size={14} className="text-brand-secondary" />
                    Console Output
                  </div>
                  <div className="flex items-center gap-3">
                  <button
                    onClick={handleRun}
                    disabled={isCompiling || isVerifying}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-text-main bg-surface hover:bg-surface-hover rounded-xl border border-border-subtle transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isCompiling ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                    {isCompiling ? "Running..." : "Run Code"}
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={isCompiling || isVerifying}
                    className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 ${isVerified ? "bg-emerald-500 hover:bg-emerald-600" : "bg-violet-600 hover:bg-violet-700"}`}
                  >
                    {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <SendHorizontal size={12} />}
                    {isVerifying ? "Verifying..." : (isVerified ? "Verified ✅" : "Submit & Verify")}
                  </button>
                </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm text-text-main bg-canvas">
                  {output ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
                  ) : (
                    <div className="text-text-muted/50 italic h-full flex items-center justify-center">
                      Run your code to see the output here...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </Group>

          {/* Footer Actions */}
          <div className="h-[80px] bg-surface border-t border-border-subtle flex items-center justify-between px-8">
            <div>
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 text-text-muted hover:text-text-main font-bold transition-colors px-4 py-3 rounded-xl hover:bg-surface-hover cursor-pointer"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
              )}
            </div>

            <button
              onClick={onNext}
              disabled={!isVerified}
              className={`flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-lg font-black transition-colors shadow-md ${!isVerified ? 'opacity-50 cursor-not-allowed bg-border-subtle text-text-muted' : (isLast
                  ? "bg-greenui text-text-main dark:text-[#1f2937] hover:brightness-105 cursor-pointer"
                  : "bg-brand-secondary text-white hover:brightness-95 cursor-pointer"
              )}`}
            >
              <span>{isLast ? "Finish Assessment" : "Next"}</span>
              {isLast ? <SendHorizontal size={18} className="ml-1" /> : <ChevronRight size={20} />}
            </button>
          </div>
    </div>
  );
});

export default CodingQuestion;