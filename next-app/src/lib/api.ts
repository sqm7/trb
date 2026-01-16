
import { supabase } from './supabase';
import { API_ENDPOINTS, SUPABASE_ANON_KEY } from './config';
import { FilterState, PaginationState, AnalysisResult } from '@/types';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();

    return {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
    };
}

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.log('User not logged in, but allowing access.');
    }
}

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out failed:', error);
        throw error;
    }
}

export async function fetchData(filters: FilterState, pagination?: PaginationState) {
    const headers = await getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.QUERY_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ filters, pagination })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to parse server response' }));
        throw new Error(err.error || 'Fetch data failed');
    }
    return response.json();
}

export async function analyzeData(filters: FilterState): Promise<AnalysisResult> {
    const headers = await getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.RANKING_ANALYSIS, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ filters })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `Analysis request failed: ${response.status}` }));
        throw new Error(err.error || 'Analyze data failed');
    }
    return response.json();
}

export async function fetchSubData(id: string, type: string, county: string) {
    if (!id || !type || !county) {
        throw new Error(`Insufficient parameters: ${id}, ${type}, ${county}`);
    }
    const headers = await getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.SUB_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ id, type, county })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to fetch sub data' }));
        throw new Error(err.error || 'Fetch sub data failed');
    }
    return response.json();
}

export async function fetchProjectNameSuggestions(countyCode: string, query: string, districts: string[] = []) {
    const headers = await getAuthHeaders();

    const payload = { countyCode, query, districts, detailed: true };
    const response = await fetch(API_ENDPOINTS.PROJECT_NAMES, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}

export async function generateShareLink(payload: any) {
    const headers = await getAuthHeaders();

    const response = await fetch(API_ENDPOINTS.GENERATE_SHARE_LINK, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Generate share link failed' }));
        throw new Error(err.error);
    }
    return response.json();
}

export const api = {
    checkAuth,
    getUser,
    signOut,
    fetchData,
    analyzeData,
    analyzeProjectRanking: analyzeData, // Alias
    fetchSubData,
    fetchProjectNameSuggestions,
    generateShareLink
};
