import React, { useState, useEffect } from 'react';
import { RTLIcon } from '../../components/RTLIcon';
import { CheckCircle, Circle, Info, Settings, Smartphone, Battery, Trash2, Activity, RefreshCw } from 'lucide-react';

const MAINTENANCE_STEPS = [
  {
    id: 'storage',
    title: 'مساحة التخزين',
    description: 'حافظ على 15% مساحة حرة على الأقل. انقل الصور إلى السحابة أو بطاقة SD.',
    icon: Smartphone,
  },
  {
    id: 'background_apps',
    title: 'التطبيقات الخلفية',
    description: 'أوقف التطبيقات التي تعمل في الخلفية ولا تحتاجها.',
    icon: Settings,
  },
  {
    id: 'animations',
    title: 'الرسوم المتحركة',
    description: 'قلل مدة الرسوم المتحركة إلى 0.5x من إعدادات المطور.',
    icon: Activity,
  },
  {
    id: 'battery',
    title: 'البطارية',
    description: 'حافظ على الشحن بين 20% و80% لإطالة عمر البطارية.',
    icon: Battery,
  },
  {
    id: 'cache',
    title: 'التخزين المؤقت',
    description: 'امسح ذاكرة التخزين المؤقت للتطبيقات الثقيلة (فيسبوك، تيك توك) شهريًا.',
    icon: Trash2,
  },
  {
    id: 'refresh_rate',
    title: 'معدل التحديث',
    description: 'إذا كان هاتفك يدعم 120Hz، جرّب تقليله إلى 60Hz لتوفير البطارية والأداء.',
    icon: Activity,
  },
  {
    id: 'reboot',
    title: 'إعادة التشغيل',
    description: 'أعد تشغيل الهاتف أسبوعيًا لتفريغ الذاكرة العشوائية.',
    icon: RefreshCw,
  },
];

export const MaintenanceGuide: React.FC = () => {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tb_maintenance_completed');
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, []);

  const toggleStep = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(s => s !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem('tb_maintenance_completed', JSON.stringify(newCompleted));
  };

  const progress = Math.round((completed.length / MAINTENANCE_STEPS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 rtl:space-x-reverse">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <RTLIcon icon={Settings} className="text-teal-500" />
          دليل صيانة الهاتف
        </h1>
        <p className="text-muted text-sm">
          خطوات تفاعلية لإطالة عمر هاتفك القديم وتحسين أدائه.
        </p>
      </header>

      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">مستوى التقدم</span>
          <span className="text-teal-400 font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {MAINTENANCE_STEPS.map((step) => {
          const isDone = completed.includes(step.id);
          return (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`w-full text-start flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                isDone ? 'bg-teal-500/10 border-teal-500/30' : 'bg-surface border-border hover:bg-border/50'
              }`}
            >
              <div className="mt-1 shrink-0">
                {isDone ? (
                  <RTLIcon icon={CheckCircle} className="text-teal-500" />
                ) : (
                  <RTLIcon icon={Circle} className="text-muted" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold mb-1 flex items-center gap-2 ${isDone ? 'text-teal-400' : 'text-text'}`}>
                  <RTLIcon icon={step.icon} className="w-4 h-4" />
                  {step.title}
                </h3>
                <p className="text-sm text-muted">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-2 bg-amber-500/10 text-amber-200 p-4 rounded-lg">
        <RTLIcon icon={Info} className="shrink-0" />
        <p className="text-xs leading-relaxed">
          هذه النصائح تساعد التطبيق على العمل بكفاءة أعلى على الهواتف التي تحتوي على ذاكرة عشوائية (RAM) 2 جيجابايت أو أقل.
          التطبيق يحترم خصوصيتك ولا يرسل أي بيانات حول جهازك لأي خادم.
        </p>
      </div>
    </div>
  );
};
