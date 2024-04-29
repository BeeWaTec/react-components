import { CodeBracketIcon, EyeDropperIcon, EyeIcon, EyeSlashIcon, PencilIcon, TableCellsIcon } from "@heroicons/react/24/solid";
import React, { useState, forwardRef } from "react";
import ReactMarkdown from "react-markdown";

type ViewMode = "editor" | "preview" | "both";

interface FormatType {
    name: string,
    icon: React.ReactElement,
    format: string,
    example: string,
    separatorAfter?: boolean,
}
const formats: FormatType[] = [
    {
        name: "Bold",
        icon: <span className="fas fa-bold"></span>,
        format: "**{}**",
        example: "Bold text",
    },
    {
        name: "Italic",
        icon: <span className="fas fa-italic"></span>,
        format: "*{}*",
        example: "Italic text",
    },
    {
        name: "Strikethrough",
        icon: <span className="fas fa-strikethrough"></span>,
        format: "~~{}~~",
        example: "Strikethrough text",
        separatorAfter: true,
    },
    {
        name: "Link",
        icon: <span className="fas fa-link"></span>,
        format: "[{}](https://example.com)",
        example: "Link text | https://example.com",
    },
    {
        name: "Image",
        icon: <span className="fas fa-image"></span>,
        format: "![{}](https://example.com/image.png)",
        example: "Image alt",
    },
    {
        name: "Inline Code",
        icon: <span className="fas fa-code"></span>,
        format: "`{}`",
        example: "Code text",
    },
    {
        name: "Code Block",
        icon: <span className="fas fa-brackets-curly"></span>,
        format: "```\n{}\n```",
        example: "Code block text",
    },
    {
        name: "Blockquote",
        icon: <span className="fas fa-quote-right"></span>,
        format: `> {}`,
        example: "Blockquote text",
    },
    {
        name: "Horizontal rule",
        icon: <span className="fas fa-minus"></span>,
        format: `{}\n\n-------------------`,
        example: "",
    },
    {
        name: "Comment",
        icon: <span className="fas fa-comment"></span>,
        format: `<!-- {} -->`,
        example: "Comment text",
        separatorAfter: true,
    },
    {
        name: "Heading 1",
        icon: <span>H1</span>,
        format: "# {}",
        example: "Heading 1",
    },
    {
        name: "Heading 2",
        icon: <span>H2</span>,
        format: "## {}",
        example: "Heading 2",
    },
    {
        name: "Heading 3",
        icon: <span>H3</span>,
        format: "### {}",
        example: "Heading 3",
    },
    {
        name: "Heading 4",
        icon: <span>H4</span>,
        format: "#### {}",
        example: "Heading 4",
    },
    {
        name: "Heading 5",
        icon: <span>H5</span>,
        format: "##### {}",
        example: "Heading 5",
    },
    {
        name: "Heading 6",
        icon: <span>H6</span>,
        format: "###### {}",
        example: "Heading 6",
    },
]

interface MarkdownEditorProps {
    className?: string,
    value?: string,
    onChange?: (value: string) => void,
}
const MarkdownEditor = forwardRef(({ className, value, onChange, ...props }: MarkdownEditorProps, ref): React.ReactElement => {

    const [text, setText] = useState(value);
    const [viewMode, setViewMode] = useState<ViewMode>("both");

    const applyFormat = (format: string, example: string) => {
        const textarea = document.getElementById("markdown-input") as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText = textarea.value.substring(start, end);
        const newText = selectedText ? selectedText : example;
        const formattedText = format.replace("{}", newText);

        setText(textarea.value.slice(0, start) + formattedText + textarea.value.slice(end));
    };

    const toggleViewMode = () => {
        if (viewMode === "editor") {
            setViewMode("both");
        } else if (viewMode === "both") {
            setViewMode("preview");
        } else {
            setViewMode("editor");
        }
    };

    // Call the onChange if text changes
    React.useEffect(() => {
        if (typeof onChange !== 'undefined') {
            onChange(text || '');
        }
    }, [text, onChange]);

    return (
        <div className={`flex flex-col h-full border-gray-300 border-2 rounded-md ${typeof className !== 'undefined' ? className : ''}`} style={{ maxHeight: '500px' }} {...props}>
            <div className="flex p-2 space-x-2">
                {
                    formats.map((format) => (
                        <>
                            <button
                                key={format.name}
                                className="px-4 py-1 w-6 h-6 flex justify-center items-center"
                                onClick={() => applyFormat(format.format, format.example)}
                            >
                                {format.icon}
                            </button>
                            {format.separatorAfter && <div className="w-px h-6 bg-gray-300" />}
                        </>
                    ))
                }
                <div className="flex-grow" />
                <button className="p-1 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={toggleViewMode}>
                    {viewMode === "editor" ? (
                        <CodeBracketIcon className="w-5 h-5" />
                    ) : viewMode === "both" ? (
                        <TableCellsIcon className="w-5 h-5" />
                    ) : (
                        <EyeIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            <div className="w-full h-1 bg-gray-300"></div>
            <div
                className="flex flex-grow"
                style={{ maxHeight: 'calc(100% - 3rem)' }}
            >
                {(viewMode === "editor" || viewMode === "both") && (
                    <textarea
                        id="markdown-input"
                        className={`resize-none relative h-full p-2 overflow-y-auto ${viewMode === "both" ? "w-1/2" : "w-full"}`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                )}
                {viewMode === "both" &&
                    <div className="h-full w-1 bg-gray-300"></div>
                }
                {viewMode === "preview" || viewMode === "both" ? (
                    <div className={`relative h-full p-2 ${viewMode === "both" ? "w-1/2" : "w-full"} max-h-full`}>
                        <div className="prose overflow-y-auto h-full">
                            <ReactMarkdown>
                                {text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
});

// Set display name
MarkdownEditor.displayName = MarkdownEditor.name;

export default MarkdownEditor;
export type { MarkdownEditorProps };