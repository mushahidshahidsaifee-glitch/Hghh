import React from 'react';

interface PreviewPanelProps {
    htmlContent: string;
}

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const PreviewPanel: React.FC<PreviewPanelProps> = ({ htmlContent }) => {
    return (
        <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-2xl h-full">
            <div className="bg-slate-700/50 px-4 py-2 rounded-t-lg border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-300">Live Preview</h2>
                </div>
            </div>
            <div className="flex-grow relative bg-white rounded-b-lg">
                <iframe
                    srcDoc={htmlContent}
                    title="Live HTML Preview"
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 rounded-b-lg"
                />
            </div>
        </div>
    );
};

export default PreviewPanel;