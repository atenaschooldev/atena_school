import { DictionaryEntry } from '@atena/api-types';

export interface DictionaryColumnDefinition {
  column: string;
  dbType: string;
  name: string;
  description: string;
  values: Record<string | number, DictionaryEntry>;
  codes: Record<string, string | number>;
}

export interface DictionaryTableDefinition {
  table: string;
  title: string;
  description: string;
  columns: Record<string, DictionaryColumnDefinition>;
  enums: Record<string, DictionaryColumnDefinition>;
}
