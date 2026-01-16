import Papa from 'papaparse';
import { columnMappings } from './uploader-config';
import { processRow } from './uploader-utils';

export interface FileInfo {
    handle: FileSystemFileHandle;
    name: string;
    fullPath: string;
    countyCode: string;
    tableType: string;
    isMain: boolean;
}

/**
 * 遞迴掃描指定目錄，找出所有 .csv 檔案
 */
export async function scanDirectory(dirHandle: FileSystemDirectoryHandle, path = ''): Promise<FileInfo[]> {
    let files: FileInfo[] = [];
    // @ts-ignore - FileSystemDirectoryHandle iteration types might be missing in older TS/DOM lib
    for await (const entry of dirHandle.values()) {
        const currentPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.csv')) {
            const fileRegex = /^([a-z])_lvr_land_([a-c](?:_build|_land|_park)?)\.csv$/i;
            const match = entry.name.match(fileRegex);

            if (match) {
                files.push({
                    handle: entry as FileSystemFileHandle,
                    name: entry.name,
                    fullPath: currentPath,
                    countyCode: match[1].toLowerCase(),
                    tableType: match[2].toLowerCase(),
                    isMain: !match[2].includes('_')
                });
            }

        } else if (entry.kind === 'directory') {
            files.push(...await scanDirectory(entry as FileSystemDirectoryHandle, currentPath));
        }
    }
    return files;
}

/**
 * 使用 PapaParse 解析單一 CSV 檔案的內容
 */
export async function parseFile(fileInfo: FileInfo, projectNameMappings?: Map<string, string>, onLog?: (msg: string, type: 'info' | 'warning' | 'error') => void): Promise<any[]> {
    const file = await fileInfo.handle.getFile();

    const parseResult = await new Promise<Papa.ParseResult<any>>((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(), // Ensure headers are trimmed
            complete: resolve
        });
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
        const nonCriticalErrorCodes = ['TooManyFields', 'TooFewFields', 'MissingQuotes'];
        const criticalErrors = parseResult.errors.filter(e => !nonCriticalErrorCodes.includes(e.code));

        if (criticalErrors.length > 0) {
            throw new Error(`CSV 嚴重解析錯誤: ${criticalErrors[0].message}`);
        }

        if (onLog) {
            parseResult.errors.forEach(warning => {
                onLog(`檔案 ${fileInfo.fullPath} 有解析警告 (已忽略): ${warning.message} (行: ${(warning.row || 0) + 2})`, 'warning');
            });
        }
    }

    if (!parseResult.data || parseResult.data.length === 0) {
        return [];
    }

    let dataRows = parseResult.data;
    // 移除 CSV 檔案中可能存在的英文標頭行
    if (dataRows[0]['編號']?.toLowerCase().includes('serial number')) {
        dataRows.shift();
    }

    const mapping = columnMappings[fileInfo.tableType];
    if (!mapping) {
        throw new Error(`檔案 ${fileInfo.name} 找不到對應的欄位規則。`);
    }

    // 遍歷每一行資料，並使用 processRow 進行格式轉換
    let processedData = dataRows.map(row => processRow(row, mapping));

    // 套用建案名稱自動替換對應
    if (projectNameMappings && projectNameMappings.size > 0) {
        let replacementCount = 0;
        processedData = processedData.map(row => {
            const originalName = row['建案名稱'];
            if (originalName && projectNameMappings.has(originalName)) {
                const newName = projectNameMappings.get(originalName);
                if (newName) {
                    row['建案名稱'] = newName;
                    replacementCount++;
                }
            }
            return row;
        });
        if (replacementCount > 0 && onLog) {
            onLog(`已自動替換 ${replacementCount} 筆建案名稱`, 'info');
        }
    }

    return processedData;
}
