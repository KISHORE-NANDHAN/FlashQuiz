import React from 'react';

interface CodeHighlighterProps {
  text: string;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ text }) => {
  const detectAndFormatCode = (text: string) => {
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);

      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const language = lines[0].trim();
          const code = lines.slice(1).join('\n');

          return (
            <div key={index} className="my-4">
              <div className="bg-gray-800 text-gray-100 rounded-t-lg px-4 py-2 text-xs font-mono">
                {language || 'Code'}
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto max-h-96 text-sm font-mono">
                <code className="whitespace-pre">
                  {highlightSyntax(code, language)}
                </code>
              </pre>
            </div>
          );
        } else {
          return <span key={index}>{formatInlineElements(part)}</span>;
        }
      });
    } else {
      return formatInlineElements(text);
    }
  };

  const formatInlineElements = (text: string) => {
    if (text.includes('`')) {
      const parts = text.split(/(`[^`]+`)/g);
      return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index} className="whitespace-pre-wrap">{part}</span>;
      });
    }

    return <span className="whitespace-pre-wrap">{text}</span>;
  };

  const highlightSyntax = (code: string, language: string) => {
    if (language === 'java') {
      return code.split('\n').map((line, lineIndex) => (
        <div key={lineIndex}>
          {highlightJavaLine(line)}
        </div>
      ));
    }

    // Fallback for unsupported language
    return <pre className="whitespace-pre-wrap">{code}</pre>;
  };

  const highlightJavaLine = (line: string) => {
    const keywords = [
      'public', 'private', 'protected', 'static', 'final', 'class', 'interface',
      'extends', 'implements', 'import', 'package', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try',
      'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'null',
      'true', 'false', 'void', 'int', 'String', 'boolean', 'double', 'float',
      'long', 'short', 'byte', 'char'
    ];

    let highlightedLine = escapeHtml(line);

    // Highlight keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedLine = highlightedLine.replace(
        regex,
        `<span class="text-blue-400 font-semibold">${keyword}</span>`
      );
    });

    // Highlight strings (double quotes)
    highlightedLine = highlightedLine.replace(
      /"([^"]*)"/g,
      `<span class="text-green-400">"$1"</span>`
    );

    // Highlight single-line comments
    highlightedLine = highlightedLine.replace(
      /\/\/(.*)/g,
      `<span class="text-gray-400">//$1</span>`
    );

    // Highlight numbers
    highlightedLine = highlightedLine.replace(
      /\b\d+\b/g,
      `<span class="text-yellow-400">$&</span>`
    );

    return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {detectAndFormatCode(text)}
    </div>
  );
};

export default CodeHighlighter;
