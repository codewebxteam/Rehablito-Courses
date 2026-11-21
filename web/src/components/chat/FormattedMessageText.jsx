import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * FormattedMessageText:
 * Parses and formats markdown characters like **, ###, *, _, bullet lists, etc.
 * Converts raw markdown into beautiful, styled rich-text with proper headings,
 * bold weights, clean lists, and blockquotes.
 */
export const FormattedMessageText = ({ text, isUser = false, className = "" }) => {
  if (!text) return null;

  // Clean trailing spaces and ensure markdown linebreaks (2 spaces before single \n)
  const normalizedText = typeof text === "string"
    ? text.replace(/\r\n/g, "\n").replace(/\n(?!\n)/g, "  \n")
    : String(text);

  return (
    <div
      className={`formatted-chat-message text-xs sm:text-[13px] leading-relaxed break-words select-text ${
        isUser ? "text-white" : "text-slate-800"
      } ${className}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className={`text-sm sm:text-base font-extrabold mt-2 mb-1.5 leading-snug ${
                isUser ? "text-white" : "text-[#0F1B3D]"
              }`}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={`text-sm sm:text-base font-bold mt-2 mb-1 leading-snug ${
                isUser ? "text-white" : "text-[#0F1B3D]"
              }`}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={`text-xs sm:text-sm font-bold mt-2 mb-1 flex items-center gap-1.5 leading-snug ${
                isUser ? "text-white" : "text-[#0F1B3D]"
              }`}
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong
              className={`font-extrabold ${
                isUser ? "text-white underline-offset-2" : "text-slate-900"
              }`}
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em className="italic opacity-90" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-4 space-y-1 my-1.5" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-4 space-y-1 my-1.5" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`border-l-3 pl-2.5 py-1 my-2 text-xs rounded-r-md ${
                isUser
                  ? "border-white/50 bg-white/10 text-slate-100"
                  : "border-[#E6007E] bg-pink-50/70 text-slate-700 shadow-2xs"
              }`}
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className={`my-2.5 border-t ${
                isUser ? "border-white/20" : "border-slate-200"
              }`}
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                isUser
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-[#0F1B3D] border border-slate-200/60"
              }`}
              {...props}
            />
          ),
        }}
      >
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessageText;
