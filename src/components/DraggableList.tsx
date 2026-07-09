import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, Plus, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DraggableList({ value, onChange, placeholder }: Props) {
  // Parse string into array of objects with unique IDs
  const [items, setItems] = useState<{ id: string; text: string }[]>(() => {
    const lines = value.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [{ id: crypto.randomUUID(), text: '' }];
    return lines.map(line => ({ id: crypto.randomUUID(), text: line }));
  });

  // Sync incoming value changes (e.g. from default data load)
  useEffect(() => {
    const lines = value.split('\n');
    // Simple check to prevent overwriting during active typing
    if (lines.join('\n') !== items.map(i => i.text).join('\n')) {
       const filteredLines = lines.filter(line => line.trim() !== '');
       if (filteredLines.length === 0) {
           setItems([{ id: crypto.randomUUID(), text: '' }]);
       } else {
           setItems(filteredLines.map(line => ({ id: crypto.randomUUID(), text: line })));
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateValue = (newItems: { id: string; text: string }[]) => {
    setItems(newItems);
    onChange(newItems.map(item => item.text).join('\n'));
  };

  const handleReorder = (newItems: { id: string; text: string }[]) => {
    updateValue(newItems);
  };

  const handleChange = (id: string, text: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, text } : item);
    updateValue(newItems);
  };

  const handleRemove = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    if (newItems.length === 0) {
      newItems.push({ id: crypto.randomUUID(), text: '' });
    }
    updateValue(newItems);
  };

  const handleAdd = () => {
    const newItems = [...items, { id: crypto.randomUUID(), text: '' }];
    updateValue(newItems);
  };

  return (
    <div className="space-y-2">
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((item) => (
          <DraggableItem 
            key={item.id} 
            item={item} 
            onChange={(text) => handleChange(item.id, text)}
            onRemove={() => handleRemove(item.id)}
            placeholder={placeholder}
          />
        ))}
      </Reorder.Group>
      <button 
        type="button" 
        onClick={handleAdd}
        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
}

function DraggableItem({ item, onChange, onRemove, placeholder }: { key?: React.Key, item: { id: string; text: string }, onChange: (t: string) => void, onRemove: () => void, placeholder?: string }) {
  const dragControls = useDragControls();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [item.text]);

  return (
    <Reorder.Item 
      value={item} 
      dragListener={false} 
      dragControls={dragControls}
      className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-2 rounded-lg relative group focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all"
    >
      <div 
        className="cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1 mt-1 shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical size={16} />
      </div>
      <textarea 
        ref={textareaRef}
        value={item.text} 
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none text-sm resize-none py-1 min-h-[30px] overflow-hidden dark:text-white"
      />
      <button 
        onClick={onRemove}
        className="text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-red-500 p-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <X size={16} />
      </button>
    </Reorder.Item>
  );
}
