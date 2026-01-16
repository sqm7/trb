// 檔案路徑: supabase/functions/_shared/unit-parser.ts

/**
 * @file 自適應戶別解析系統 (Adaptive Unit Parser System) - v12.6 (新增五個使用者定義規則)
 * @description 具備自動學習能力的戶別解析系統，能夠從數據中學習新的命名模式並適應各種建案的獨特規則
 * @final-logic 系統提供初步的、基於單筆上下文的解析，最終的風格一致性校正由主分析函式完成。
 */

// ===== 類型定義 =====

interface ParseResult {
    identifier: string;
    confidence: number;
    method: string;
    debug?: string;
}

interface PatternRule {
    id: string;
    name: string;
    regex: RegExp;
    extract: (match: RegExpMatchArray, context?: ParseContext) => string;
    confidence: number;
    priority: number;
    conditions?: RuleCondition[];
}

interface RuleCondition {
    type: 'floor_match' | 'building_match' | 'project_pattern';
    validator: (context: ParseContext) => boolean;
}

interface ParseContext {
    rawUnit: string;
    floor?: string;
    projectName?: string;
    buildingName?: string;
}

interface ProjectProfile {
    projectName: string;
    patterns: Map<string, PatternUsage>;
    unitMappings: Map<string, UnitInfo>;
    namingStyle: 'consistent' | 'mixed' | 'unknown';
    dominantPattern?: string;
}

interface PatternUsage {
    patternId: string;
    count: number;
    examples: string[];
    confidence: number;
}

interface UnitInfo {
    floors: Set<string>;
    rawVariations: Set<string>;
    resolvedIdentifier?: string;
}

// ===== 模式偵測器 =====

class PatternDetector {
    private knownPatterns: Map<string, PatternRule> = new Map();
    private patternFrequency: Map<string, number> = new Map();
    
    constructor() {
        this.initializeBasePatterns();
    }
    
    private initializeBasePatterns(): void {
        const basePatterns: PatternRule[] = [
            // ==========================================================
            //【使用者新增規則】
            // 案例: A2/9F號, 樓層為 9, 應解析為 "A2"
            {
                id: 'unit_slash_floorF_format',
                name: '戶號斜線樓層F格式',
                regex: /^([A-Z]\d+)\/(\d+)F[號号]?$/i,
                extract: (m, ctx) => {
                    const unitIdentifier = m[1]; // A2
                    const floorInUnit = m[2];   // 9
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 100,
                priority: 0.01 // 極高優先級
            },
            // 案例: C棟6-9號, 樓層為 9, 應解析為 "C6"
            {
                id: 'building_unit_floor_combined',
                name: '棟別戶號樓層合併格式',
                regex: /^([A-Z])棟(\d+)-(\d+)[號号]?$/i,
                extract: (m, ctx) => {
                    const buildingLetter = m[1]; // C
                    const unitPart = m[2];       // 6
                    const floorPart = m[3];      // 9
                    if (ctx?.floor && parseInt(floorPart, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitPart;
                    }
                    return buildingLetter + unitPart + floorPart;
                },
                confidence: 100,
                priority: 0.02 // 極高優先級
            },
            // 案例: B棟3-2F號, 樓層為 2, 應解析為 "B3"
            {
                id: 'building_unit_floorF_format_v2',
                name: '棟別戶號樓層F格式v2',
                regex: /^([A-Z])棟(\d+)-(\d+)F[號号]?$/i,
                extract: (m, ctx) => {
                    const buildingLetter = m[1]; // B
                    const unitPart = m[2];       // 3
                    const floorPart = m[3];      // 2
                    if (ctx?.floor && parseInt(floorPart, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitPart;
                    }
                    return buildingLetter + unitPart + floorPart;
                },
                confidence: 100,
                priority: 0.03 // 極高優先級
            },
            // 案例: C2棟0號, 樓層為 9, 應解析為 "C2"
            {
                id: 'unit_building_zero_format',
                name: '戶號棟別0號格式',
                regex: /^([A-Z]\d+)棟0[號号]?$/i,
                extract: (m) => m[1], // 直接回傳 C2
                confidence: 100,
                priority: 0.04 // 極高優先級
            },
            // 案例: A號, 應解析為 "A"
            {
                id: 'single_letter_unit',
                name: '單字母戶號格式',
                regex: /^([A-Z])[號号]$/i,
                extract: (m) => m[1], // 直接回傳 A
                confidence: 95,
                priority: 0.045 // 高優先級，處理最簡單的模式
            },
            // ==========================================================
            {
                id: 'building_floor_unit_letter_format',
                name: '棟別樓層數字戶型字母格式',
                regex: /^([A-Z])棟(\d+)([A-Z])[號号]?$/i,
                extract: (m, ctx) => {
                    const buildingLetter = m[1]; // e.g., 'A'
                    const floorInUnit = parseInt(m[2], 10); // e.g., 8
                    const unitLetter = m[3]; // e.g., 'A'

                    // 如果戶別中的樓層與上下文樓層相符，則回傳戶型字母
                    if (ctx?.floor && floorInUnit === parseInt(ctx.floor, 10)) {
                        return unitLetter; // 期望結果為 "A"
                    }
                    // 如果樓層不符或沒有上下文樓層，則回傳組合，以便於除錯或進一步判斷
                    return `${buildingLetter}${floorInUnit}${unitLetter}`;
                },
                confidence: 99,
                priority: 0.05 // 給予高優先級，以確保此特定模式能被優先匹配
            },
            {
                id: 'building_floor_unit_format',
                name: '棟別樓層戶號格式',
                regex: /^([A-Z])棟(\d{1,2})F-(\d+)[號号]?$/,
                extract: (m, ctx) => {
                    const buildingLetter = m[1];
                    const floorInUnit = m[2];
                    const unitNumber = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitNumber;
                    }
                    return buildingLetter + floorInUnit + unitNumber;
                },
                confidence: 99,
                priority: 0.1
            },
            {
                id: 'letter_number_floor_format',
                name: '字母數字-樓層F格式',
                regex: /^([A-Z])0*(\d+)-(\d{1,2})F[號号]?$/,
                extract: (m, ctx) => {
                    const buildingLetter = m[1];
                    const unitNumber = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitNumber;
                    }
                    return buildingLetter + unitNumber + floorInUnit;
                },
                confidence: 99,
                priority: 0.15
            },
            {
                id: 'identifier_building_floor_redundant',
                name: '識別碼棟與F樓層格式(贅余樓層)',
                // 案例: "A01棟F02號", 樓層為 2, 應解析為 "A1"
                // 【修正】: 將 "号" 改為 "[號号]" 以匹配兩種寫法
                regex: /^([A-Z]\d+)棟F(\d+)[號号]?$/i,
                extract: (m, ctx) => {
                    const identifier = m[1]; // "A01"
                    const floorInUnit = m[2]; // "02"

                    // 提取字母和數字部分，並去除數字開頭的0
                    const letterPart = identifier.match(/^[A-Z]+/)?.[0] || '';
                    const numberPart = parseInt(identifier.match(/\d+/)?.[0] || '0', 10);

                    // 組合成標準化ID ("A" + 1 -> "A1")
                    const cleanedIdentifier = `${letterPart}${numberPart}`;

                    // 如果戶別中的樓層與上下文樓層相符，則視為贅余資訊，只回傳標準化ID
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return cleanedIdentifier;
                    }
                    // 如果不符，則保留樓層資訊以供除錯
                    return cleanedIdentifier + 'F' + floorInUnit;
                },
                confidence: 98,
                priority: 0.18 // 優先級高，因為格式非常特定
            },
            {
                id: 'identifier_building_floorF_format',
                name: '識別碼棟與樓層F格式(贅余樓層)',
                // 案例: "A2棟5F號", 樓層為 5, 應解析為 "A2"
                // 【修正】: 將 "号" 改為 "[號号]" 以匹配兩種寫法
                regex: /^([A-Z]\d+)棟(\d{1,2})F[號号]?$/i,
                extract: (m, ctx) => {
                    const identifier = m[1]; // "A2"
                    const floorInUnit = m[2]; // "5"

                    // 如果戶別中的樓層與上下文樓層相符，則只回傳識別碼
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return identifier;
                    }
                    // 如果不符，則保留樓層資訊
                    return identifier + floorInUnit;
                },
                confidence: 98,
                priority: 0.19 // 優先級高，緊跟上一條規則
            },
            {
                id: 'unit_building_floor_format',
                name: '戶棟樓層格式',
                regex: /^([A-Z]\d+)戶棟(\d+)F[號号]?$/,
                extract: (m, ctx) => {
                    const unitIdentifier = m[1]; 
                    const floorInUnit = m[2];   
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 99,
                priority: 0.2
            },
            {
                id: 'building_sub_unit_floor_format',
                name: '棟別子戶號樓層格式',
                regex: /^([A-Z])棟(\d+)-(\d+)F[號号]?$/,
                extract: (m, ctx) => {
                    const buildingLetter = m[1]; 
                    const subUnitNumber = m[2];  
                    const floorInUnit = m[3];    

                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + subUnitNumber;
                    }
                    return buildingLetter + subUnitNumber + floorInUnit;
                },
                confidence: 99,
                priority: 0.3
            },
            {
                id: 'building_unit_floor_format',
                name: '棟別戶別樓層格式',
                regex: /^([A-Z])棟([A-Z])-(\d{1,2})F[號号]?$/,
                extract: (m, ctx) => {
                    const unitLetter = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 99,
                priority: 0.4
            },
            {
                id: 'building_self_unit_floor_format',
                name: '棟別自身戶號樓層格式',
                regex: /^([A-Z])棟\1-(\d+)[號号]?$/,
                extract: (m, ctx) => {
                    const unitLetter = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.45
            },
            {
                id: 'building_unit_letter_floor_number',
                name: '棟別戶號字母樓層數字格式',
                regex: /^([A-Z])棟([A-Z])(\d{1,2})[號号]?$/,
                extract: (m, ctx) => {
                    const unitLetter = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.46
            },
            {
                id: 'redundant_building_format',
                name: '重複棟別格式',
                regex: /^([A-Z])棟\1-(\d{1,2})F[號号]?$/, 
                extract: (m, ctx) => {
                    const buildingLetter = m[1]; 
                    const floorInUnit = m[2];    
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter; 
                    }
                    return buildingLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.5
            },
            {
                id: 'building_floor_letter_unit',
                name: '棟別樓層字母戶號格式',
                regex: /^[A-Z]棟(\d{1,2})F-([A-Z])[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[1];
                    const unitLetter = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.6
            },
            {
                id: 'letter_leading_zero_unit',
                name: '字母與0開頭數字戶號',
                regex: /^([A-Z])0+(\d+)[號号]?$/,
                extract: (m) => m[1] + m[2],
                confidence: 97,
                priority: 0.7
            },
            {
                id: 'floor_prefix_format',
                name: '樓層前綴格式',
                regex: /^(\d{1,2})([A-Z])[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[1];
                    const letterPart = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return letterPart;
                    }
                    return floorInUnit + letterPart;
                },
                confidence: 96,
                priority: 0.8
            },
            {
                id: 'floorF_building_unit_format',
                name: '樓層F棟戶號格式',
                regex: /^(\d{1,2})F棟([A-Z])[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[1];
                    const unitLetter = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return floorInUnit + unitLetter;
                },
                confidence: 98,
                priority: 0.85
            },
            {
                id: 'numericBuilding_floor_unit_format',
                name: '數字棟別樓層戶號格式',
                regex: /^(\d+)棟(\d{1,2})([A-Z])[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[2];
                    const unitLetter = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return floorInUnit + unitLetter;
                },
                confidence: 98,
                priority: 0.86
            },
            {
                id: 'floor_first_detailed',
                name: '樓層優先詳細格式',
                regex: /(\d{1,2})F-([A-Z])(\d{2})/,
                extract: (m) => m[2] + m[3],
                confidence: 95,
                priority: 1
            },
            {
                id: 'floor_prefix_complex_unit',
                name: '樓層前綴複合戶號',
                regex: /^(\d{1,2})F-([A-Z]\d+)[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[1];
                    const unitIdentifier = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return floorInUnit + unitIdentifier;
                },
                confidence: 94,
                priority: 1.2
            },
            {
                id: 'floor_first_simple_letter',
                name: '樓層優先簡單字母格式',
                regex: /^(\d{1,2})F-([A-Z])[號号]?$/,
                extract: (match: RegExpMatchArray, context?: ParseContext) => {
                    const floorInUnit = match[1];
                    const unitLetter = match[2];
                    if (context?.floor && parseInt(floorInUnit, 10) === parseInt(context.floor, 10)) {
                        return unitLetter;
                    } else {
                        return floorInUnit + unitLetter;
                    }
                },
                confidence: 90,
                priority: 1.5
            },
            {
                id: 'building_with_unit',
                name: '棟別完整戶號',
                regex: /([A-Z])棟([A-Z])(\d{1,2})(?:-(\d{1,2})F?[號号])?/,
                extract: (m) => m[2] + m[3],
                confidence: 90,
                priority: 2,
                conditions: [{
                    type: 'building_match',
                    validator: (ctx) => {
                        const match = ctx.rawUnit.match(/([A-Z])棟([A-Z])/);
                        return match ? match[1] === match[2] : false;
                    }
                }]
            },
            {
                id: 'building_simple_letter_unit',
                name: '棟別字母戶號格式',
                regex: /^[A-Z]棟([A-Z])[號号]?$/,
                extract: (m) => m[1],
                confidence: 92,
                priority: 2.5
            },
            {
                id: 'unit_floor_suffix',
                name: '戶號樓層後綴',
                regex: /([A-Z]\d{1,2})-(\d{1,2})F?[號号]?/,
                extract: (m) => m[1],
                confidence: 85,
                priority: 3
            },
            {
                id: 'building_floor_format',
                name: '棟別樓層格式',
                regex: /^([A-Z]\d{1,2})棟(\d{1,2})(?:F|樓)[號号]?$/,
                extract: (m, ctx) => {
                    const unitIdentifier = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 88,
                priority: 3.5
            },
            {
                id: 'building_complex_number',
                name: '複合棟別編號',
                regex: /^([A-Z]\d+)棟(\d+)[號号]$/,
                extract: (m, ctx) => {
                    const unitIdentifier = m[1]; 
                    const floorInUnit = m[2];   
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 86,
                priority: 3.8
            },
            {
                id: 'building_floor_F_format',
                name: '棟別樓層F格式',
                regex: /^([A-Z])棟(\d{1,2})F[號号]?$/,
                extract: (m, ctx) => {
                    const letterPart = m[1]; 
                    const floorInUnit = m[2]; 
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return letterPart;
                    }
                    return letterPart + floorInUnit;
                },
                confidence: 87,
                priority: 3.9
            },
            {
                id: 'building_zero_placeholder_unit',
                name: '棟別0號佔位符格式',
                regex: /^([A-Z])棟0[號号]?$/,
                extract: (m) => m[1],
                confidence: 95,
                priority: 3.95
            },
            {
                id: 'building_simple_number',
                name: '棟別簡單編號',
                regex: /([A-Z])棟(\d{1,2})[號号]/,
                extract: (match: RegExpMatchArray, context?: ParseContext) => {
                    const buildingLetter = match[1];
                    const unitNumber = match[2];
                    if (context?.floor && parseInt(unitNumber, 10) === parseInt(context.floor, 10)) {
                        return buildingLetter;
                    } else {
                        return buildingLetter + unitNumber;
                    }
                },
                confidence: 85,
                priority: 4
            },
            {
                id: 'unit_floor_concatenated',
                name: '複合戶號樓層格式',
                regex: /^([A-Z])(\d+)F[號号]?$/,
                extract: (m, ctx) => {
                    const letterPart = m[1];
                    const numberPart = m[2];
                    const floorStr = ctx?.floor;

                    if (floorStr) {
                        const floorInt = parseInt(floorStr, 10);
                        if (!isNaN(floorInt)) {
                            if (floorInt < 10) {
                                const paddedFloor = '0' + floorStr;
                                if (numberPart.endsWith(paddedFloor)) {
                                    const unitNumber = numberPart.substring(0, numberPart.length - 2);
                                    return letterPart + unitNumber;
                                 }
                            }
                            if (numberPart.endsWith(floorStr)) {
                                const unitNumber = numberPart.substring(0, numberPart.length - floorStr.length);
                                return letterPart + unitNumber;
                            }
                        }
                    }
                    return letterPart + numberPart;
                },
                confidence: 80,
                priority: 4.5
            },
            {
                id: 'letter_floor',
                name: '字母樓層格式',
                regex: /^([A-Z])-(\d{1,2})F?[號号]?$/,
                extract: (m, ctx) => {
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return m[1];
                    }
                    return m[1] + floorInUnit;
                },
                confidence: 70,
                priority: 5
            }
        ];
        
        basePatterns.forEach(pattern => {
            this.knownPatterns.set(pattern.id, pattern);
        });
    }
    
    public detectPattern(text: string, context?: ParseContext): { rule: PatternRule; match: RegExpMatchArray } | null {
        const normalizedText = this.normalizeText(text);
        let bestMatch: { rule: PatternRule; match: RegExpMatchArray } | null = null;
        
        const sortedPatterns = Array.from(this.knownPatterns.values())
            .sort((a, b) => a.priority - b.priority);
        
        for (const rule of sortedPatterns) {
            const match = normalizedText.match(rule.regex);
            if (match) {
                 if (rule.conditions && context) {
                    const allConditionsMet = rule.conditions.every(
                        condition => condition.validator(context)
                    );
                    if (!allConditionsMet) continue;
                }
                bestMatch = { rule, match };
                break; 
            }
        }
        
        if (bestMatch) {
            this.patternFrequency.set(
                bestMatch.rule.id,
                (this.patternFrequency.get(bestMatch.rule.id) || 0) + 1
            );
        }
        
        return bestMatch;
    }
    
    private normalizeText(text: string): string {
        if (!text) return '';
        return text
            .toUpperCase()
            .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
            .replace(/\s+/g, '');
    }
}

// ===== 建案分析器 =====

class ProjectAnalyzer {
    private projectProfiles: Map<string, ProjectProfile> = new Map();
    
    public analyzeProject(projectName: string, records: any[]): ProjectProfile {
        const profile: ProjectProfile = {
            projectName,
            patterns: new Map(),
            unitMappings: new Map(),
            namingStyle: 'unknown'
        };
        
        const detector = new PatternDetector();
        
        for (const record of records) {
            const rawUnit = record['戶別'];
            const floor = record['樓層'];
            
            if (!rawUnit) continue;
            
            const context: ParseContext = {
                rawUnit,
                floor: floor ? String(floor) : undefined,
                projectName
            };
            
            const detectionResult = detector.detectPattern(rawUnit, context);
            
            if (detectionResult) {
                const pattern = detectionResult.rule;
                if (!profile.patterns.has(pattern.id)) {
                    profile.patterns.set(pattern.id, {
                        patternId: pattern.id,
                        count: 0,
                        examples: [],
                        confidence: pattern.confidence
                    });
                }
                
                const usage = profile.patterns.get(pattern.id)!;
                usage.count++;
                if (usage.examples.length < 10) {
                    usage.examples.push(rawUnit);
                }
            }
            
            if (!profile.unitMappings.has(rawUnit)) {
                profile.unitMappings.set(rawUnit, {
                    floors: new Set(),
                    rawVariations: new Set([rawUnit])
                });
            }
            
            const unitInfo = profile.unitMappings.get(rawUnit)!;
            if (floor) unitInfo.floors.add(String(floor));
        }
        
        this.determineNamingStyle(profile);
        this.projectProfiles.set(projectName, profile);
        return profile;
    }
    
    private determineNamingStyle(profile: ProjectProfile): void {
        const patternCount = profile.patterns.size;
        const totalUsage = Array.from(profile.patterns.values())
            .reduce((sum, p) => sum + p.count, 0);
        
        if (patternCount === 0) {
            profile.namingStyle = 'unknown';
            return;
        }
        
        let dominantPattern: PatternUsage | null = null;
        let maxCount = 0;
        
        for (const pattern of profile.patterns.values()) {
            if (pattern.count > maxCount) {
                maxCount = pattern.count;
                dominantPattern = pattern;
            }
        }
        
        if (dominantPattern) {
            profile.dominantPattern = dominantPattern.patternId;
            if (dominantPattern.count / totalUsage > 0.8) {
                profile.namingStyle = 'consistent';
            } else {
                profile.namingStyle = 'mixed';
            }
        }
    }
    
    public getProjectProfile(projectName: string): ProjectProfile | undefined {
        return this.projectProfiles.get(projectName);
    }
    
    public isAmbiguousUnit(projectName: string, rawUnit: string): boolean {
        const profile = this.projectProfiles.get(projectName);
        if (!profile) return false;
        
        const unitInfo = profile.unitMappings.get(rawUnit);
        return unitInfo ? unitInfo.floors.size > 1 : false;
    }
}


// ===== 規則引擎 (RuleEngine) =====

class RuleEngine {
    private detector: PatternDetector;
    private customRules: Map<string, (context: ParseContext) => ParseResult | null> = new Map();
    
    constructor(detector: PatternDetector) {
        this.detector = detector;
        this.initializeCustomRules();
    }
    
    private initializeCustomRules(): void {
    }
    
    public applyRules(context: ParseContext): ParseResult | null {
        for (const [ruleName, ruleFunc] of this.customRules) {
            const result = ruleFunc(context);
            if (result) {
                return result;
            }
        }

        const detectionResult = this.detector.detectPattern(context.rawUnit, context);
        
        if (detectionResult) {
            const { rule, match } = detectionResult;
            return {
                identifier: rule.extract(match, context),
                confidence: rule.confidence,
                method: `pattern:${rule.id}`
            };
        }
        
        return {
            identifier: this.simpleFallback(context.rawUnit),
            confidence: 50,
            method: 'fallback'
        };
    }
    
    private simpleFallback(text: string): string {
        if (!text) return '';
        const normalized = text
            .toUpperCase()
            .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
            .replace(/\s+/g, '');
        return normalized.replace(/[棟樓F室號\-]/g, '');
    }
}

// ===== 自適應解析器（主類）與向後兼容介面 =====

export class AdaptiveUnitResolver {
    private detector: PatternDetector;
    public analyzer: ProjectAnalyzer;
    private ruleEngine: RuleEngine;
    private resolveCache: Map<string, ParseResult> = new Map();
    
    constructor(records: any[]) {
        console.log('[AdaptiveUnitResolver] 初始化，處理', records.length, '筆資料');
        
        this.detector = new PatternDetector();
        this.analyzer = new ProjectAnalyzer();
        this.ruleEngine = new RuleEngine(this.detector);
        
        this.buildKnowledgeBase(records);
    }
    
    private buildKnowledgeBase(records: any[]): void {
        const projectGroups = new Map<string, any[]>();
        
        for (const record of records) {
            const projectName = record['建案名稱'];
            if (!projectName) continue;
            
            if (!projectGroups.has(projectName)) {
                projectGroups.set(projectName, []);
            }
            projectGroups.get(projectName)!.push(record);
        }
        
        console.log('[AdaptiveUnitResolver] 分析', projectGroups.size, '個建案');
        
        for (const [projectName, projectRecords] of projectGroups) {
            this.analyzer.analyzeProject(projectName, projectRecords);
        }
    }
    
    public resolve(record: any): string {
        return this.resolveWithContext(record).identifier;
    }

    public resolveWithContext(record: any): ParseResult {
        let rawUnit = record['戶別'];
        
        if (rawUnit && typeof rawUnit === 'string') {
            rawUnit = rawUnit.trim();
        }

        const floor = record['樓層'];
        const projectName = record['建案名稱'];

        if (!rawUnit) return { identifier: '', confidence: 0, method: 'no_input' };
        
        const cacheKey = `${projectName}|${rawUnit}|${floor || ''}`;
        if (this.resolveCache.has(cacheKey)) {
            return this.resolveCache.get(cacheKey)!;
        }
        
        const context: ParseContext = {
            rawUnit,
            floor: floor ? String(floor) : undefined,
            projectName
        };
        
        const result = this.ruleEngine.applyRules(context);
        
        this.resolveCache.set(cacheKey, result);
        return result;
    }
}

export class UnitIdentifierResolver extends AdaptiveUnitResolver {}
export const getUnitIdentifier = (rawText: string | null, _buildingName: string | null, floor: string | null): string => {
    if (!rawText) return '';

    let cleanedText = rawText;
    cleanedText = cleanedText.trim();
    
    const detector = new PatternDetector();
    const ruleEngine = new RuleEngine(detector);
    return ruleEngine.applyRules({ rawUnit: cleanedText, floor: floor || undefined })?.identifier || '';
};