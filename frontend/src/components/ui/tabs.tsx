import React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className = '', children }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue} className={className}>
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <RadixTabs.List className={`flex border-b ${className}`}>
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={`px-4 py-2 -mb-px border-b-2 border-transparent hover:border-primary ${className}`}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <RadixTabs.Content value={value} className={className}>
      {children}
    </RadixTabs.Content>
  );
}
