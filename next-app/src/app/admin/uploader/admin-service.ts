import { createClient } from '@supabase/supabase-js';

// Helper to create a dynamic client based on user input
function createDynamicClient(supabaseUrl: string, supabaseKey: string) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('請提供完整的 Supabase URL 和 Service Role Key');
    }
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
        },
    });
}

/**
 * 從 Supabase 查詢符合條件的資料
 */
export async function searchData(
    countyCode: string,
    transactionType: string,
    searchField: string,
    keyword: string,
    dbConfig: { url: string; key: string }
) {
    try {
        const supabase = createDynamicClient(dbConfig.url, dbConfig.key);

        const tableName = `${countyCode.toLowerCase()}_lvr_land_${transactionType}`;
        console.log(`[AdminService] Searching ${tableName} for ${searchField} like %${keyword}%`);

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .ilike(searchField, `%${keyword}%`)
            .limit(100); // Limit to 100 for performance in UI

        if (error) throw error;

        return { success: true, data, tableName };
    } catch (error: any) {
        console.error('Search error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 批次更新 Supabase 中的資料
 */
export async function batchUpdateData(
    tableName: string,
    ids: string[],
    fieldToUpdate: string,
    newValue: string,
    oldValue: string | null,
    district: string | null,
    city: string | null,
    dbConfig: { url: string; key: string }
) {
    try {
        const supabase = createDynamicClient(dbConfig.url, dbConfig.key);

        if (!ids || ids.length === 0) {
            throw new Error('沒有選擇任何要更新的資料');
        }

        const updateObject = {
            [fieldToUpdate]: newValue === '' ? null : newValue,
        };

        console.log(`[AdminService] Batch updating ${tableName}, Count: ${ids.length}, Field: ${fieldToUpdate}`);

        const { error } = await supabase
            .from(tableName)
            .update(updateObject)
            .in('編號', ids);

        if (error) throw error;

        // Check for Project Name Mapping Logic
        // Condition: Updating '建案名稱', old value exists, new value is different, AND old value has '?'
        const hasEncodingIssue = oldValue && oldValue.includes('?');
        if (
            fieldToUpdate === '建案名稱' &&
            oldValue &&
            newValue &&
            oldValue !== newValue &&
            hasEncodingIssue
        ) {
            console.log(`[AdminService] Detected encoding fix (old: ${oldValue}, new: ${newValue}). Saving mapping.`);
            await saveProjectNameMapping(oldValue, newValue, district, city, supabase);
        }

        return { success: true, count: ids.length };
    } catch (error: any) {
        console.error('Batch update error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 儲存建案名稱對應 (Internal Helper)
 */
async function saveProjectNameMapping(
    oldName: string,
    newName: string,
    district: string | null,
    city: string | null,
    supabase: any
) {
    try {
        const insertData: any = {
            old_name: oldName,
            new_name: newName,
            updated_at: new Date().toISOString(),
        };

        if (district) insertData.district = district;
        if (city) insertData.city = city;

        const { error } = await supabase
            .from('project_name_mappings')
            .upsert(insertData, {
                onConflict: 'old_name',
            });

        if (error) {
            console.error('Failed to save mapping:', error);
        }
    } catch (e) {
        console.error('Error saving mapping:', e);
    }
}
