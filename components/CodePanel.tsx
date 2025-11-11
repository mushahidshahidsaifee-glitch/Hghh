import React, { useState, useMemo } from 'react';

interface CodePanelProps {
    title: string;
    children: React.ReactNode;
    onCopy?: () => Promise<void>;
    isEditing?: boolean;
    onToggleEdit?: () => void;
    onClear?: () => void;
    onDownload?: () => void;
    saveStatus?: 'idle' | 'saving' | 'saved';
}

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v11.25c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125V4.5c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5c0 1.25-1.012 2.25-2.25 2.25H6.75c-1.238 0-2.25-1.012-2.25-2.25V4.5c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


const CodePanel: React.FC<CodePanelProps> = ({ title, children, onCopy, isEditing, onToggleEdit, onClear, onDownload, saveStatus }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyClick = async () => {
        if (!onCopy) return;
        try {
            await onCopy();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const dynamicStylingClasses = useMemo(() => {
        if (saveStatus === 'saving') {
            return 'border-amber-500 ring-1 ring-amber-500/50 animate-pulse';
        }
        if (saveStatus === 'saved') {
            return 'border-green-500 ring-1 ring-green-500/50';
        }
        if (isEditing && onToggleEdit) {
            return 'border-cyan-500 ring-1 ring-cyan-500/50';
        }
        return '';
    }, [saveStatus, isEditing, onToggleEdit]);

    return (
        <div className={`flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-2xl min-h-[40vh] lg:min-h-0 transition-all duration-300 ${dynamicStylingClasses}`}>
            <div className="bg-slate-700/50 px-4 py-2 rounded-t-lg border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
                <div className="flex items-center gap-3">
                    {saveStatus && saveStatus !== 'idle' && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 italic transition-opacity duration-300 animate-fade-in">
                            {saveStatus === 'saved' && <CheckIcon className="h-4 w-4 text-green-400" />}
                            <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
                        </div>
                    )}
                    {onToggleEdit && (
                         <button
                            onClick={onToggleEdit}
                            aria-live="polite"
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-cyan-500 ${
                                isEditing
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                            }`}
                        >
                            {isEditing ? (
                                <>
                                    <CheckIcon className="h-4 w-4" />
                                    <span>Save</span>
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Edit</span>
                                </>
                            )}
                        </button>
                    )}
                    {onClear && (
                        <button
                            onClick={onClear}
                            disabled={!isEditing}
                            aria-label="Clear all code"
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-cyan-500 bg-red-500/10 text-red-400 hover:bg-red-500/20 ${
                                !isEditing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <TrashIcon className="h-4 w-4" />
                            <span>Clear All</span>
                        </button>
                    )}
                    {onCopy && (
                        <button
                            onClick={handleCopyClick}
                            disabled={copied || isEditing}
                            aria-live="polite"
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-cyan-500 ${
                                copied
                                    ? 'bg-green-500/20 text-green-400 cursor-default'
                                    : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                            } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="h-4 w-4" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ClipboardIcon className="h-4 w-4" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    )}
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            disabled={isEditing}
                            aria-label="Download code"
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-cyan-500 bg-slate-600/50 text-slate-400 hover:bg-slate-600 hover:text-slate-200 ${
                                isEditing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <DownloadIcon className="h-4 w-4" />
                            <span>Download</span>
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-grow relative">
                {children}
            </div>
        </div>
    );
};

export default CodePanel;