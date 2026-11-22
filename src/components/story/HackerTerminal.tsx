import React, { useState, useEffect, useRef } from 'react';
import { loadPyodide } from 'pyodide';
import { useAgeSliderStore, AgeGroup } from '../../store/useAgeSliderStore';
import { useWebSpeech } from '../../hooks/useWebSpeech';

export const HackerTerminal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { ageGroup, setAgeGroup } = useAgeSliderStore();
  const { speak } = useWebSpeech();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pyodide, setPyodide] = useState<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPy = async () => {
      try {
        const py = await loadPyodide({
          indexURL: "/pyodide/"
        });
        setPyodide(py);
        setIsLoading(false);
        setOutput([
          'SYSTEM READY.',
          'Initializing Language Assessment Engine v3.1...',
          'Detecting age group...',
          `Current Age Group: ${ageGroup}`,
          '',
          'Type "start" to begin the assessment, or type Python code to test the environment.'
        ]);
      } catch (err) {
        setOutput([
          '❌ فشل تحميل بيئة بايثون المحلية.',
          'Failed to load local Python runtime.',
          'تأكد من اتصالك بالإنترنت مرة واحدة لتحميل المحرك، ثم سيعمل بدون إنترنت.',
          'Connect once to download the runtime; it will then work offline.',
          String(err),
        ]);
        setIsLoading(false);
      }
    };
    initPy();
  }, [ageGroup]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommand = async (cmd: string) => {
    if (!pyodide) return;
    setOutput((prev) => [...prev, `> ${cmd}`]);

    if (cmd.toLowerCase() === 'start') {
      setOutput((prev) => [...prev, 'Starting assessment...']);
      speak('Starting assessment.', 'en-US');
      try {
        const result = await pyodide.runPythonAsync(`
import json

def assess_level():
    # Simulated logic based on age group
    age_groups = ['KG', 'Elementary', 'Middle', 'High', 'College', 'Adult']
    # In a real scenario, this would analyze user input and adjust the slider
    return json.dumps({"next_level": "Elementary", "message": "Level adjusted based on assessment."})

assess_level()
      `);
      const parsed = JSON.parse(result);
      setOutput((prev) => [...prev, parsed.message]);
      setAgeGroup(parsed.next_level as AgeGroup);
      speak(parsed.message, 'en-US');
    } catch (err) {
        setOutput((prev) => [...prev, `Assessment Error: ${String(err)}`]);
    }
    } else {
      try {
        const result = await pyodide.runPythonAsync(cmd);
        setOutput((prev) => [...prev, String(result)]);
      } catch (err) {
        setOutput((prev) => [...prev, `Python Error: ${String(err)}`]);
      }
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-green-500 font-mono p-4 pt-safe pb-safe flex flex-col" dir="ltr">
      <div className="flex justify-between items-center mb-4 border-b border-green-900 pb-2">
        <h1 className="text-xl font-bold tracking-widest text-green-400">THINKING BRIDGE :: TERMINAL</h1>
        <button onClick={onComplete} className="px-4 py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors font-bold rounded-sm uppercase tracking-wider text-sm">
          EXIT
        </button>
      </div>

      <div ref={terminalRef} className="flex-1 overflow-y-auto mb-4 space-y-1.5 p-2 bg-black/50 rounded">
        {isLoading && <div className="animate-pulse text-green-700">Loading Pyodide WebAssembly environment...</div>}
        {output.map((line, i) => (
          <div key={i} className={`
            ${line.startsWith('>') ? 'text-green-300 font-bold' : ''}
            ${line.startsWith('ERROR') || line.includes('Python Error') ? 'text-red-500' : ''}
            ${line.startsWith('SYSTEM READY') ? 'text-green-400 font-bold' : ''}
          `}>
            {line}
          </div>
        ))}
      </div>

      <div className="flex items-center border-t border-green-900 pt-3 bg-black">
        <span className="mr-3 font-bold text-green-400">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-900/50 font-mono text-lg"
          placeholder="Type 'start' or Python code..."
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
};
