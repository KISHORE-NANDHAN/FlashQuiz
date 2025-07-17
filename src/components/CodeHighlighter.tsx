
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
            <div key={index} className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 text-xs font-mono border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-medium">{language || 'Code'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Scroll to view more</span>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 max-h-80 overflow-auto">
                <pre className="p-4 text-sm font-mono text-gray-100 whitespace-pre">
                  <code>
                    {highlightSyntax(code, language)}
                  </code>
                </pre>
              </div>
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
              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
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
    if (language === 'java' || language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
      return code.split('\n').map((line, lineIndex) => (
        <div key={lineIndex} className="min-h-[1.25rem]">
          {highlightLine(line, language)}
        </div>
      ));
    }

    // Fallback for unsupported language
    return <div className="whitespace-pre-wrap text-gray-100">{code}</div>;
  };

  const highlightLine = (line: string, language: string) => {
    const javaKeywords = [
      'public', 'private', 'protected', 'static', 'final', 'class', 'interface',
      'extends', 'implements', 'import', 'package', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try',
      'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'null',
      'true', 'false', 'void', 'int', 'String', 'boolean', 'double', 'float',
      'long', 'short', 'byte', 'char', 'ArrayList', 'HashMap', 'Stack'
    ];

    const jsKeywords = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
      'finally', 'throw', 'new', 'this', 'null', 'undefined', 'true', 'false',
      'async', 'await', 'import', 'export', 'class', 'extends', 'super'
    ];

    const keywords = language === 'java' ? javaKeywords : jsKeywords;
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

    // Highlight strings (single quotes)
    highlightedLine = highlightedLine.replace(
      /'([^']*)'/g,
      `<span class="text-green-400">'$1'</span>`
    );

    // Highlight single-line comments
    highlightedLine = highlightedLine.replace(
      /\/\/(.*)/g,
      `<span class="text-gray-400 italic">//$1</span>`
    );

    // Highlight multi-line comments
    highlightedLine = highlightedLine.replace(
      /\/\*(.*?)\*\//g,
      `<span class="text-gray-400 italic">/*$1*/</span>`
    );

    // Highlight numbers
    highlightedLine = highlightedLine.replace(
      /\b\d+\b/g,
      `<span class="text-yellow-400">$&</span>`
    );

    // Highlight method calls
    highlightedLine = highlightedLine.replace(
      /(\w+)(\()/g,
      `<span class="text-purple-400">$1</span>$2`
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
