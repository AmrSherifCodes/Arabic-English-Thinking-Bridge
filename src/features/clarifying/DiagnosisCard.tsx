import React from 'react';

interface Props {
    diagnosis: {
        skill: string;
        estimated_level: string;
        strengths: string[];
        gaps: string[];
        next_practice: string;
    };
    onClose: () => void;
}

export const DiagnosisCard: React.FC<Props> = ({ diagnosis, onClose }) => {
    return (
        <div className="bg-surface border border-border p-6 rounded-2xl space-y-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-accent-teal">Skill Assessment Result</h2>
            <div>
                <p className="text-muted">Skill: <span className="text-text font-semibold capitalize">{diagnosis.skill}</span></p>
                <p className="text-muted">Estimated Level: <span className="text-secondary-amber font-bold text-xl">{diagnosis.estimated_level}</span></p>
            </div>

            <div>
                <h3 className="font-semibold text-text">Strengths:</h3>
                <ul className="list-disc list-inside text-muted">
                    {diagnosis.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-semibold text-text">Areas to Improve:</h3>
                <ul className="list-disc list-inside text-muted">
                    {diagnosis.gaps.map((g, i) => (
                        <li key={i}>{g}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-semibold text-text">Next Step:</h3>
                <p className="text-muted">{diagnosis.next_practice}</p>
            </div>

            <button
                onClick={onClose}
                className="w-full py-3 bg-accent-teal text-bg font-bold rounded-xl"
            >
                Done
            </button>
        </div>
    );
};
