'use client';

import { ModalList } from '@/components/ui/ModalList';
import { Accommodation } from '@/types';

interface ModalListWrapperProps {
  items: Accommodation[];
}

export function ModalListWrapper({ items }: ModalListWrapperProps) {
  const handleItemClick = (item: Accommodation) => {
    window.location.href = `/accommodation/${item.slug}`;
  };

  return <ModalList items={items} onItemClick={handleItemClick} />;
}
