import { type StatsError } from '@rspack/core';

export type ErrorSeverity = 'error' | 'warning';

export type ErrorCategory =
    | 'typescript'
    | 'module'
    | 'css'
    | 'syntax'
    | 'module-federation'
    | 'configuration'
    | 'runtime'
    | 'unknown';

export interface ErrorLocation {
    file?: string;
    line?: number;
    column?: number;
}

export interface BuildErrorContext {
    moduleName?: string;
    modulePath?: string;
    line?: number;
    column?: number;
}

export interface ErrorSuggestion {
    type: 'install' | 'typo' | 'config' | 'syntax' | 'general';
    message: string;
    command?: string;
    docsUrl?: string;
}

export interface FormattedError {
    category: ErrorCategory;
    severity: ErrorSeverity;
    title: string;
    message: string;
    location?: {
        file: string;
        line?: number;
        column?: number;
    };
    suggestions: ErrorSuggestion[];
    originalError: Error | StatsError;
}

