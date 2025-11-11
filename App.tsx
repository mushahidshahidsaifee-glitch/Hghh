import React, { useState, useMemo, useRef, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import CodePanel from './components/CodePanel';
import CodeEditor from './components/CodeEditor';

const initialHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
    <style>
        body { font-family: sans-serif; padding: 1rem; }
        .container { max-width: 800px; margin: auto; padding: 20px; }
        .highlight { background-color: yellow; }
        button { border: 1px solid #ccc; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Live Preview!</h1>
        <p>This is a sample paragraph. You can search for any text, like "paragraph" or "container" to see the highlight feature in action.</p>
        <div id="main-content">
            <p>Your HTML and inline CSS will render here.</p>
            <button class="highlight" onclick="alert('JavaScript works too!')">A highlighted button</button>
        </div>
    </div>
</body>
</html>
`;

const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 15" />
    </svg>
);

const App: React.FC = () => {
    const [htmlCode, setHtmlCode] = useState<string>(() => {
        try {
            const savedCode = localStorage.getItem('html-highlighter-autosave');
            return savedCode !== null ? savedCode : initialHtmlCode;
        } catch (error)
 {
            console.error("Failed to read from localStorage", error);
            return initialHtmlCode;
        }
    });
    const [searchQuery, setSearchQuery] = useState<string>('highlight');
    const [tagFilter, setTagFilter] = useState<string>('');
    const [isInputEditing, setIsInputEditing] = useState<boolean>(true);
    const [isOutputEditing, setIsOutputEditing] = useState<boolean>(false);
    const [selectorError, setSelectorError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const outputCodeRef = useRef<HTMLElement>(null);
    const outputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSaveStatus('saving');
        const handler = setTimeout(() => {
            try {
                localStorage.setItem('html-highlighter-autosave', htmlCode);
                setSaveStatus('saved');
                const resetHandler = setTimeout(() => setSaveStatus('idle'), 2000);
                return () => clearTimeout(resetHandler);
            } catch (error) {
                console.error("Failed to save to localStorage", error);
            }
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [htmlCode]);
    
    useEffect(() => {
        const trimmedFilter = tagFilter.trim();
        if (!trimmedFilter) {
            setSelectorError(null);
            return;
        }

        try {
            // This is a simple check; it doesn't need to be perfect.
            document.createDocumentFragment().querySelector(trimmedFilter);
            setSelectorError(null);
        } catch (e) {
            setSelectorError('Invalid CSS selector.');
        }
    }, [tagFilter]);

    const highlightedHtml = useMemo(() => {
        // This version of escapeHtml is for display inside a <pre><code> block.
        const escapeHtml = (str: string) => 
            str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const processAndAddLineNumbers = (htmlString: string) => {
            return htmlString
                .split('\n')
                .map(line => `<span class="line">${line || ' '}</span>`)
                .join('');
        };

        const query = searchQuery.trim();
        // If there's no query, just escape and add line numbers.
        if (!query) {
            return processAndAddLineNumbers(escapeHtml(htmlCode));
        }

        const tagQuery = tagFilter.trim();
        const searchQueryRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const highlightReplacement = `<mark class="bg-cyan-500/30 text-cyan-300 px-0.5 rounded-sm">$1</mark>`;

        // If there's no tag filter or it's invalid, highlight the entire code as a single string.
        if (!tagQuery || selectorError) {
            const highlighted = escapeHtml(htmlCode).replace(searchQueryRegex, highlightReplacement);
            return processAndAddLineNumbers(highlighted);
        }

        try {
            // Use DOMParser to safely manipulate and query the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlCode, 'text/html');
            const elements = doc.querySelectorAll(tagQuery);

            if (elements.length === 0) {
                 return processAndAddLineNumbers(escapeHtml(htmlCode));
            }
            
            elements.forEach(el => {
                // Use TreeWalker to find all text nodes within the matched element
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                const textNodes: Text[] = [];
                let currentNode = walker.nextNode();
                while(currentNode) {
                    textNodes.push(currentNode as Text);
                    currentNode = walker.nextNode();
                }

                textNodes.forEach(textNode => {
                    const parent = textNode.parentNode;
                    // Ignore text inside scripts or styles
                    if (!parent || ['SCRIPT', 'STYLE'].includes(parent.nodeName)) return;

                    const textContent = textNode.textContent || '';
                    if (!textContent.match(searchQueryRegex)) return;

                    const newHtml = textContent.replace(searchQueryRegex, highlightReplacement);
                    
                    // Create a temporary element to parse the new HTML string
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newHtml;

                    // Replace the original text node with the new nodes (text and <mark>)
                    parent.replaceChild(document.createDocumentFragment().appendChild(tempDiv), textNode);
                });
            });
            
            // To safely escape the now-modified HTML while preserving our <mark> tags,
            // we use a placeholder technique.
            const marks: string[] = [];
            let modifiedHtml = doc.body.innerHTML.replace(/<mark class="[^"]*">.*?<\/mark>/g, (match) => {
                marks.push(match);
                return `__MARK_PLACEHOLDER_${marks.length - 1}__`;
            });
            
            // Now escape everything else
            let escaped = escapeHtml(modifiedHtml);

            // And finally, restore the <mark> tags
            escaped = escaped.replace(/__MARK_PLACEHOLDER_(\d+)__/g, (_, index) => {
                return marks[parseInt(index, 10)];
            });
            
            return processAndAddLineNumbers(escaped);

        } catch (error) {
            console.error("Error applying CSS selector:", error);
            // Fallback to simple highlighting on error
            const highlighted = escapeHtml(htmlCode).replace(searchQueryRegex, highlightReplacement);
            return processAndAddLineNumbers(highlighted);
        }
    }, [htmlCode, searchQuery, tagFilter, selectorError]);
    
    useEffect(() => {
        if (searchQuery.trim() && outputContainerRef.current) {
            const firstMatch = outputContainerRef.current.querySelector('mark');
            if (firstMatch) {
                firstMatch.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [highlightedHtml, searchQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleCopyToClipboard = async () => {
        const textToCopy = outputCodeRef.current?.innerText || htmlCode;
        await navigator.clipboard.writeText(textToCopy);
    };

    const handleDownloadCode = () => {
        const codeToDownload = outputCodeRef.current?.innerText || htmlCode;
        const blob = new Blob([codeToDownload], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'highlighted-code.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleToggleInputEdit = () => {
        setIsInputEditing(!isInputEditing);
    };

    const handleToggleOutputEdit = () => {
        setIsOutputEditing(!isOutputEditing);
    };

    const handleClearCode = () => {
        setHtmlCode('');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-6 animate-fade-in">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
                    HTML Code Highlighter
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Paste your code, type a query, and see the magic happen instantly.
                </p>
            </header>

            <main className="flex-grow flex flex-col gap-6">
                <div className="sticky top-4 z-10 animate-fade-in bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50 flex flex-col gap-3" style={{ animationDelay: '0.2s' }}>
                    <SearchBar 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={handleClearSearch}
                        placeholder="Type to search and highlight..."
                    />
                    <div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <TagIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="tag-filter"
                                type="text"
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                placeholder="Filter by CSS selector (e.g., p, div.container, #main)"
                                className={`w-full bg-slate-800 border text-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out shadow-lg ${selectorError ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-slate-700 focus:ring-cyan-500 focus:border-cyan-500'}`}
                                aria-label="Filter by CSS Selector"
                                aria-invalid={!!selectorError}
                                aria-describedby={selectorError ? 'selector-error' : undefined}
                            />
                        </div>
                        {selectorError && (
                            <p id="selector-error" className="text-red-400 text-xs mt-2 pl-1 animate-fade-in" role="alert">
                                {selectorError}
                            </p>
                        )}
                    </div>
                </div>


                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <CodePanel 
                        title="Paste HTML Code Here"
                        isEditing={isInputEditing}
                        onToggleEdit={handleToggleInputEdit}
                        onClear={handleClearCode}
                        saveStatus={saveStatus}
                    >
                        <CodeEditor
                            value={htmlCode}
                            onChange={(e) => setHtmlCode(e.target.value)}
                            readOnly={!isInputEditing}
                            placeholder="Paste your HTML code here..."
                        />
                    </CodePanel>

                    <CodePanel 
                        title="Highlighted Output" 
                        onCopy={handleCopyToClipboard}
                        onDownload={handleDownloadCode}
                        isEditing={isOutputEditing}
                        onToggleEdit={handleToggleOutputEdit}
                    >
                        {isOutputEditing ? (
                            <CodeEditor
                                value={htmlCode}
                                onChange={(e) => setHtmlCode(e.target.value)}
                                readOnly={!isOutputEditing}
                                highlightedValue={highlightedHtml}
                            />
                        ) : (
                            <div ref={outputContainerRef} className="w-full h-full text-slate-300 font-mono text-sm overflow-auto rounded-b-lg custom-scrollbar">
                               <pre className="whitespace-pre p-4">
                                    <code 
                                      ref={outputCodeRef} 
                                      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                                      className="outline-none code-output-container"
                                    />
                               </pre>
                            </div>
                        )}
                    </CodePanel>
                </div>
            </main>
        </div>
    );
};

export default App;