interface InsightNarrativeProps {
  narrative: string;
}

export function InsightNarrative({ narrative }: InsightNarrativeProps) {
  // Parse the narrative and render with proper formatting
  const sections = narrative.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-6 text-stone-700">
      {sections.map((section, idx) => {
        // Check if this is a heading (starts with **)
        const headingMatch = section.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)/);

        if (headingMatch) {
          const [, heading, content] = headingMatch;
          return (
            <div key={idx} className="space-y-3">
              <h3 className="text-lg font-medium text-stone-900">{heading}</h3>
              {content && (
                <div className="space-y-2 pl-4 border-l-2 border-stone-200">
                  {formatContent(content)}
                </div>
              )}
            </div>
          );
        }

        // Regular paragraph
        return (
          <div key={idx} className="space-y-2">
            {formatContent(section)}
          </div>
        );
      })}
    </div>
  );
}

function formatContent(text: string) {
  // Split by newlines for bullet points and such
  const lines = text.split('\n').filter(Boolean);

  return lines.map((line, idx) => {
    // Check if it's a bullet point
    if (line.trim().startsWith('-')) {
      const bulletText = line.trim().substring(1).trim();
      return (
        <div key={idx} className="flex items-start gap-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 flex-shrink-0" />
          <p className="flex-1 leading-relaxed">{formatInlineStyles(bulletText)}</p>
        </div>
      );
    }

    // Regular line
    return (
      <p key={idx} className="leading-relaxed">
        {formatInlineStyles(line)}
      </p>
    );
  });
}

function formatInlineStyles(text: string) {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-stone-900">
          {boldText}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
