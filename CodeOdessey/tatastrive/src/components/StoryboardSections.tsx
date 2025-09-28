'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import StoryboardSection from './StoryboardSection';
import { StoryboardData, StoryboardSection as SectionType } from '@/types/storyboard';

interface StoryboardSectionsProps {
  storyboardData: StoryboardData;
  onSectionUpdate: (section: SectionType) => void;
  onSectionDelete: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function StoryboardSections({
  storyboardData,
  onSectionUpdate,
  onSectionDelete,
  onDragEnd,
}: StoryboardSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={storyboardData.sections.map(section => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {storyboardData.sections.map((section) => (
            <StoryboardSection
              key={section.id}
              section={section}
              onUpdate={onSectionUpdate}
              onDelete={onSectionDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
