import { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Location } from '../types';

interface LocationTreeProps {
  locations: Location[];
  onSelect: (location: Location) => void;
  selectedId?: string;
}

interface TreeNodeProps {
  location: Location;
  onSelect: (location: Location) => void;
  selectedId?: string;
  depth: number;
}

function TreeNode({ location, onSelect, selectedId, depth }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = location.children && location.children.length > 0;
  const isSelected = location.id === selectedId;

  return (
    <div data-testid={`tree-node-${location.id}`}>
      <button
        className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 ${
          isSelected ? 'bg-navy-50 text-navy-700 font-medium' : 'text-slate-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect(location);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        data-testid={`tree-node-button-${location.id}`}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
          )
        ) : (
          <MapPinIcon className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
        )}
        <span className="truncate">{location.name}</span>
        <span className="ml-auto text-xs text-slate-400">
          {location.occupied}/{location.capacity}
        </span>
      </button>
      {isExpanded && hasChildren && (
        <div>
          {location.children!.map((child) => (
            <TreeNode
              key={child.id}
              location={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LocationTree({ locations, onSelect, selectedId }: LocationTreeProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-2 bg-white overflow-y-auto max-h-96" data-testid="location-tree">
      {locations.map((location) => (
        <TreeNode
          key={location.id}
          location={location}
          onSelect={onSelect}
          selectedId={selectedId}
          depth={0}
        />
      ))}
    </div>
  );
}
