import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, Circle, GripVertical } from 'lucide-react';

type Activity = {
  id: string;
  icon: string;
  name: string;
  time: string;
  done: boolean;
};

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: '1', icon: '🌅', name: 'Acordar', time: '07:00', done: false },
  { id: '2', icon: '🥣', name: 'Café da manhã', time: '07:30', done: false },
  { id: '3', icon: '🧩', name: 'Terapia', time: '09:00', done: false },
  { id: '4', icon: '🎒', name: 'Escola', time: '13:00', done: false },
  { id: '5', icon: '🍲', name: 'Almoço', time: '12:00', done: false },
  { id: '6', icon: '🎨', name: 'Atividade livre', time: '17:00', done: false },
  { id: '7', icon: '🍽️', name: 'Jantar', time: '19:00', done: false },
  { id: '8', icon: '😴', name: 'Dormir', time: '21:00', done: false },
];

function SortableItem({ act, toggle }: { act: Activity, toggle: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: act.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white/70 backdrop-blur-md rounded-2xl border min-h-[80px] flex items-center p-4 transition-all hover:bg-white/90 ${isDragging ? 'shadow-2xl border-[var(--rosa-forte)] opacity-80' : 'shadow-sm border-white/50 mb-3'}`}>
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--texto-claro)] hover:text-[var(--rosa-forte)] mr-4 active:cursor-grabbing">
        <GripVertical size={24} />
      </button>

      <div className="w-12 h-12 bg-[var(--ativo-bg)] rounded-xl flex items-center justify-center text-2xl mr-4 shadow-sm">
        {act.icon}
      </div>

      <div className="flex-1">
        <h3 className={`font-bold text-lg ${act.done ? 'text-[var(--texto-claro)] line-through' : 'text-[var(--texto-escuro)]'}`}>
          {act.name}
        </h3>
        <p className="text-sm text-[var(--texto-medio)] font-medium bg-white/50 w-fit px-2 py-0.5 rounded-md mt-1">
          {act.time}
        </p>
      </div>

      <button 
        onClick={() => toggle(act.id)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${act.done ? 'bg-[var(--rosa-forte)] text-white shadow-md' : 'bg-white border-2 border-[var(--texto-claro)] text-[var(--texto-claro)] hover:border-[var(--rosa-forte)] hover:text-[var(--rosa-forte)]'}`}
      >
        {act.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>
    </div>
  );
}

const RotinaDoDia = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rotina_atividades');
    if (saved) {
      setActivities(JSON.parse(saved));
    } else {
      setActivities(DEFAULT_ACTIVITIES);
    }
  }, []);

  const saveAct = (acts: Activity[]) => {
    setActivities(acts);
    localStorage.setItem('rotina_atividades', JSON.stringify(acts));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex(a => a.id === active.id);
      const newIndex = activities.findIndex(a => a.id === over.id);
      const newArray = arrayMove(activities, oldIndex, newIndex);
      saveAct(newArray);
    }
  };

  const toggleDone = (id: string) => {
    const acts = activities.map(a => a.id === id ? { ...a, done: !a.done } : a);
    saveAct(acts);
  };

  const resetRoutine = () => {
    const reset = activities.map(a => ({ ...a, done: false }));
    saveAct(reset);
  };

  const doneCount = activities.filter(a => a.done).length;
  const progress = activities.length ? Math.round((doneCount / activities.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-8 mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--texto-escuro)] mb-4 font-serif">
          Rotina Visual do Dia
        </h1>
        <p className="text-[var(--texto-medio)] max-w-lg mx-auto mb-8">
          Estruture o dia arrastando as atividades. Crianças atípicas se beneficiam imensamente da previsibilidade visual.
        </p>

        {/* Progress */}
        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 mb-2">
          <div className="flex justify-between items-center mb-2 font-bold text-[var(--texto-escuro)]">
            <span>Progresso do dia</span>
            <span className="text-[var(--rosa-forte)]">{progress}%</span>
          </div>
          <div className="w-full h-4 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center px-2">
        <h2 className="font-bold text-[var(--texto-escuro)] text-xl">Arraste para reordenar</h2>
        <button 
          onClick={resetRoutine}
          className="text-sm font-semibold text-[var(--texto-claro)] hover:text-[var(--rosa-forte)] transition-colors"
        >
          Zerar o dia
        </button>
      </div>

      {activities.length > 0 && (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={activities}
            strategy={verticalListSortingStrategy}
          >
            {activities.map((act) => (
              <SortableItem key={act.id} act={act} toggle={toggleDone} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default RotinaDoDia;
