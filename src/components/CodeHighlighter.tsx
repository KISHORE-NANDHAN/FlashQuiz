
import React from 'react';

interface CodeHighlighterProps {
  text: string;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ text }) => {
  const detectAndFormatCode = (text: string) => {
    // Check if text contains code blocks
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const lines = part.slice(3, -3).split('\n');
          const language = lines[0].trim();
          const code = lines.slice(1).join('\n');
          
          return (
            <div key={index} className="my-4">
              <div className="bg-gray-800 text-gray-100 rounded-t-lg px-4 py-2 text-xs font-mono">
                {language || 'Code'}
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto">
                <code className="text-sm font-mono whitespace-pre">
                  {highlightSyntax(code, language)}
                </code>
              </pre>
            </div>
          );
        } else {
          // Regular text with potential inline code
          return (
            <span key={index}>
              {formatInlineElements(part)}
            </span>
          );
        }
      });
    } else {
      // Check for inline code or regular formatting
      return formatInlineElements(text);
    }
  };

  const formatInlineElements = (text: string) => {
    // Handle inline code
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
    // Simple syntax highlighting for Java
    if (language === 'java') {
      return code.split('\n').map((line, lineIndex) => (
        <div key={lineIndex}>
          {highlightJavaLine(line)}
        </div>
      ));
    }
    
    return code;
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

    let highlightedLine = line;
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedLine = highlightedLine.replace(
        regex, 
        `<span class="text-blue-400">${keyword}</span>`
      );
    });

    // Highlight strings
    highlightedLine = highlightedLine.replace(
      /"([^"]*)"/g,
      '<span class="text-green-400">"$1"</span>'
    );

    // Highlight comments
    highlightedLine = highlightedLine.replace(
      /\/\/(.*)$/,
      '<span class="text-gray-400">//$1</span>'
    );

    // Highlight numbers
    highlightedLine = highlightedLine.replace(
      /\b\d+\b/g,
      '<span class="text-yellow-400">$&</span>'
    );

    return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {detectAndFormatCode(text)}
    </div>
  );
};

export default CodeHighlighter;
