import { useState, useRef, KeyboardEvent, ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
  testIdPrefix?: string;
}

export function Tabs({ tabs, activeKey, defaultActiveKey, onChange, variant = 'underline', className = '', testIdPrefix = 'tab' }: TabsProps) {
  const [internalKey, setInternalKey] = useState(defaultActiveKey || tabs[0]?.key || '');
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const current = activeKey ?? internalKey;

  function select(key: string) {
    if (!activeKey) setInternalKey(key);
    onChange?.(key);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    tabsRef.current[next]?.focus();
    select(tabs[next].key);
  }

  const underlineStyles = {
    list: 'flex gap-0.5 border-b border-slate-200',
    tab: (active: boolean) =>
      `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-navy-500 text-navy-600' : 'border-transparent text-slate-400 hover:text-slate-600'
      }`,
  };

  const pillStyles = {
    list: 'flex gap-1 bg-slate-100 p-1 rounded-lg',
    tab: (active: boolean) =>
      `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`,
  };

  const styles = variant === 'pills' ? pillStyles : underlineStyles;

  return (
    <div role="tablist" aria-orientation="horizontal" className={`${styles.list} ${className}`}>
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          ref={(el) => { tabsRef.current[i] = el; }}
          role="tab"
          aria-selected={current === tab.key}
          tabIndex={current === tab.key ? 0 : -1}
          onClick={() => select(tab.key)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={styles.tab(current === tab.key)}
          data-testid={`${testIdPrefix}-${tab.key}`}
        >
          {tab.icon && <span className="mr-1.5 inline-flex">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
