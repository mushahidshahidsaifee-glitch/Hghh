import React, { useMemo, useRef } from 'react';

interface CodeEditorProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    readOnly?: boolean;
    placeholder?: string;
    highlightedValue?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly, placeholder, highlightedValue }) => {
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);

    const lineCount = useMemo(() => {
        const count = value.split('\n').length;
        return count > 0 ? count : 1;
    }, [value]);

    const lineNumbers = useMemo(() => 
        Array.from({ length: lineCount }, (_, i) => i + 1), 
    [lineCount]);

    const handleScroll = () => {
        const scrollTop = textareaRef.current?.scrollTop || 0;
        const scrollLeft = textareaRef.current?.scrollLeft || 0;

        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = scrollTop;
        }
        if (highlightRef.current) {
            highlightRef.current.scrollTop = scrollTop;
            highlightRef.current.scrollLeft = scrollLeft;
        }
    };

    const sharedClasses = "w-full h-full p-4 resize-none custom-scrollbar whitespace-pre m-0 focus:outline-none";
    const sharedStyles: React.CSSProperties = { lineHeight: '1.5rem', outline: 'none' };

    return (
        <div className="w-full h-full flex font-mono text-sm bg-slate-800 rounded-b-lg overflow-hidden">
            <div 
                ref={lineNumbersRef}
                className="text-right text-slate-500 p-4 select-none overflow-y-hidden bg-slate-800"
                style={{ lineHeight: '1.5rem' }}
                aria-hidden="true"
            >
                {lineNumbers.map(n => <div key={n}>{n}</div>)}
            </div>
            <div className="relative flex-grow h-full">
                {highlightedValue && !readOnly ? (
                    <>
                        <pre
                            ref={highlightRef}
                            aria-hidden="true"
                            className={`${sharedClasses} absolute top-0 left-0 text-slate-300 overflow-auto bg-slate-800 pointer-events-none`}
                            style={sharedStyles}
                        >
                            <code dangerouslySetInnerHTML={{ __html: highlightedValue.replace(/<span class="line">/g, '<div>').replace(/<\/span>/g, '</div>') }} />
                        </pre>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={onChange}
                            onScroll={handleScroll}
                            readOnly={readOnly}
                            className={`${sharedClasses} absolute top-0 left-0 bg-transparent text-transparent caret-slate-200 z-10 selection:bg-cyan-500/30`}
                            placeholder={placeholder}
                            spellCheck="false"
                            style={sharedStyles}
                        />
                    </>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onScroll={handleScroll}
                        readOnly={readOnly}
                        className={`${sharedClasses} bg-slate-800 text-slate-300 ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                        placeholder={placeholder}
                        spellCheck="false"
                        style={sharedStyles}
                    />
                )}
            </div>
        </div>
    );
};

export default CodeEditor;