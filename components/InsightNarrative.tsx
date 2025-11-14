interface InsightNarrativeProps {
  narrative: string;
}

export function InsightNarrative({ narrative }: InsightNarrativeProps) {
  // Parse the narrative and render with proper formatting
  const sections = narrative.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-7 text-stone-700 text-[15px]">
      {sections.map((section, idx) => {
        // Check if this is a heading (starts with **)
        const headingMatch = section.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)/);

        if (headingMatch) {
          const [, heading, content] = headingMatch;
          return (
            <div key={idx} className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{heading}</h3>
              {content && (
                <div className="space-y-3 pl-5 border-l-2 border-sage-300">
                  {formatContent(content)}
                </div>
              )}
            </div>
          );
        }

        // Regular paragraph
        return (
          <div key={idx} className="space-y-3">
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
        <div key={idx} className="flex items-start gap-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-sage-500 mt-[0.6em] flex-shrink-0" />
          <p className="flex-1 leading-[1.75]">{formatInlineStyles(bulletText)}</p>
        </div>
      );
    }

    // Regular line
    return (
      <p key={idx} className="leading-[1.75]">
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
