import { ReactNode, useState } from 'react';
import { motion, Reorder } from 'framer-motion';

export interface KanbanCard {
  id: string;
  title: string;
  content?: ReactNode;
  metadata?: Record<string, any>;
  color?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  maxCards?: number;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
}

export function KanbanBoard({
  columns: initialColumns,
  onCardMove,
  onCardClick,
  className = '',
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);

  const handleDragEnd = (cardId: string, columnId: string) => {
    const fromColumn = columns.find(col =>
      col.cards.some(card => card.id === cardId)
    );

    if (fromColumn && fromColumn.id !== columnId) {
      const card = fromColumn.cards.find(c => c.id === cardId);
      if (!card) return;

      const toColumn = columns.find(col => col.id === columnId);
      if (!toColumn) return;

      // Check max cards limit
      if (toColumn.maxCards && toColumn.cards.length >= toColumn.maxCards) {
        return;
      }

      // Update columns
      setColumns(prev =>
        prev.map(col => {
          if (col.id === fromColumn.id) {
            return {
              ...col,
              cards: col.cards.filter(c => c.id !== cardId),
            };
          }
          if (col.id === columnId) {
            return {
              ...col,
              cards: [...col.cards, card],
            };
          }
          return col;
        })
      );

      onCardMove?.(cardId, fromColumn.id, columnId);
    }
  };

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-stone-50 rounded-lg p-4"
        >
          {/* Column header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {column.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
              )}
              <h3 className="font-semibold text-stone-900">{column.title}</h3>
              <span className="text-sm text-stone-500">
                ({column.cards.length}
                {column.maxCards && `/${column.maxCards}`})
              </span>
            </div>
          </div>

          {/* Cards */}
          <Reorder.Group
            axis="y"
            values={column.cards}
            onReorder={newCards => {
              setColumns(prev =>
                prev.map(col =>
                  col.id === column.id ? { ...col, cards: newCards } : col
                )
              );
            }}
            className="space-y-3 min-h-[200px]"
          >
            {column.cards.map(card => (
              <Reorder.Item
                key={card.id}
                value={card}
                dragListener={true}
                dragConstraints={{ top: 0, bottom: 0 }}
              >
                <motion.div
                  className={`bg-white rounded-lg border ${
                    card.color ? 'border-l-4' : 'border-stone-200'
                  } p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                  style={card.color ? { borderLeftColor: card.color } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCardClick?.(card)}
                  layout
                >
                  <h4 className="font-medium text-stone-900 mb-2">
                    {card.title}
                  </h4>

                  {card.content && (
                    <div className="text-sm text-stone-600">{card.content}</div>
                  )}

                  {card.metadata && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(card.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-stone-100 text-xs rounded text-stone-700"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add card button */}
          {(!column.maxCards || column.cards.length < column.maxCards) && (
            <button className="w-full mt-3 p-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-600 transition-colors">
              + Add card
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
