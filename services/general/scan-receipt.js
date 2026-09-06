const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const knex = require('../../db/config/connection').getConnection();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5vl:7b';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATE_OLLAMA_MODELS = [
    ...new Set([
        process.env.OLLAMA_MODEL,
        'qwen2.5vl:7b',
        'qwen2.5vl:3b'
    ].filter(Boolean))
];

const CANDIDATE_GEMINI_MODELS = [
    ...new Set([
        process.env.GEMINI_MODEL,
        'gemini-3.7-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite'
    ].filter(Boolean))
];

const cleanNulls = (obj) => {
    if (typeof obj === 'string' && (obj.trim().toLowerCase() === 'null' || obj.trim() === '-' || obj.trim() === '')) return null;
    if (Array.isArray(obj)) return obj.map(cleanNulls).filter(
        item => item !== null && !(typeof item === 'object' && Object.values(item).every(v => v === null))
    );
    if (obj && typeof obj === 'object')
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cleanNulls(v)]));
    return obj;
};

const buildVisionReceiptPrompt = () =>
`أنت خبير فائق الدقة في قراءة وتحليل إيصالات وجداول مصانع النسيج والتريكو والغزل باللغة العربية.
اقرأ جدول الإيصال المكتوب بخط اليد بدقة شديدة واستخرج الحقول التالية وأرجع كائن JSON صالح فقط بدون أي شروح:

قواعد الاستخراج الدقيقة:
1. date: التاريخ من خانة "التاريخ" بأرقام إنجليزية YYYY-MM-DD (مثال: "2024-08-24").
2. document: نوع الإيصال أو السند المطبوع في الأعلى (مثال: "إيصال تسليم").
3. orderNumber: النص بجانب "طلبية" أو "رقم الطلبية" (مثال: "ستراوس 058 هـ").
4. manufacturerName: اسم العميل بجانب "اسم العميل" أو "المصنع" (مثال: "قطري مصر").
5. fabricName: اسم أو نوع القماش المكتوب تحت خانة "نوع البضاعة" (مثال: "فليس قطن عادي").
6. quantity: القيمة الرقمية للوزن الخامي المكتوبة تحت خانة "الوزن الخامي" (مثال: "1217.45").
7. numberFabricPieces: القيمة الرقمية لعدد الأثواب المكتوبة تحت خانة "عدد الأثواب" (مثال: "51").
8. notes: أي ملاحظات أو لون مكتوب (مثل "ليموني أحمر").
9. yarns: مصفوفة بالخيوط/الغزول المكتوبة في منتصف الجدول ومطابقتها لأعمدة الخيوط (خيط 1، خيط 2، خيط 3) مع نسبها المئوية بتنسيق:
   [
     { "yarnName": "1/30 مشط", "ratio": "49%" },
     { "yarnName": "70 بوليستر", "ratio": "15%" },
     { "yarnName": "1/16 مخلوط", "ratio": "38%" }
   ]

تنبيه هام: حوّل جميع الأرقام المشرقية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية (0123456789).

أرجع هذا الهيكل بدقة:
{"date":null,"document":null,"orderNumber":null,"manufacturerName":null,"fabricName":null,"quantity":null,"numberFabricPieces":null,"notes":null,"yarns":[]}`;

const extractJson = (text) => {
    let clean = text
        .replace(/<\|[^|]*\|>/g, '')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    clean = clean
        .replace(/:\s*None\b/g, ': null')
        .replace(/:\s*True\b/g, ': true')
        .replace(/:\s*False\b/g, ': false');

    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        let jsonStr = clean.slice(start, end + 1).replace(/,\s*([}\]])/g, '$1');
        const parsed = cleanNulls(JSON.parse(jsonStr));
        if (!Array.isArray(parsed.yarns)) parsed.yarns = [];
        return parsed;
    }
    throw new Error(`لم يتم العثور على كائن JSON في استجابة النموذج: ${clean.slice(0, 300)}`);
};

const scanReceiptWithOllama = async (base64Data, prompt) => {
    let lastError = null;
    for (const model of CANDIDATE_OLLAMA_MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[Ollama/Qwen] Scanning receipt with model: ${model} (attempt ${attempt}/${2})...`);
                const res = await fetch(`${OLLAMA_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model,
                        messages: [
                            {
                                role: 'user',
                                content: prompt,
                                images: [base64Data]
                            }
                        ],
                        stream: false,
                        options: {
                            temperature: 0.1
                        }
                    })
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    console.warn(`[Ollama warning] Model ${model} returned HTTP ${res.status}: ${errText.slice(0, 250)}`);
                    lastError = new Error(`Ollama API error (${res.status}): ${errText}`);
                    if (attempt < 2) {
                        await sleep(1000 * attempt);
                        continue;
                    }
                    break;
                }

                const responseData = await res.json();
                const rawResponse = responseData?.message?.content || '';
                console.log(`[Ollama output (${model})]`, rawResponse.slice(0, 500));
                if (!rawResponse) throw new Error('لم يتم استلام أي رد من Ollama');

                const extracted = extractJson(rawResponse);
                console.log('[Extracted Receipt Data]', extracted);
                return extracted;
            } catch (err) {
                lastError = err;
                console.warn(`[Ollama error] Model ${model} failed on attempt ${attempt}:`, err.message);
                if (attempt < 2) {
                    await sleep(1000 * attempt);
                }
            }
        }
    }
    throw lastError || new Error('فشل معالجة الإيصال عبر Ollama');
};

const scanReceiptWithGemini = async (base64Data, mimeType, prompt) => {
    const apiKey = GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('يرجى ضبط متغير البيئة GEMINI_API_KEY أو GOOGLE_API_KEY للاستخدام كـ fallback.');
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: mimeType || 'image/jpeg',
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1
        }
    };

    let lastError = null;

    for (const model of CANDIDATE_GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[Gemini Fallback] Scanning receipt with model: ${model} (attempt ${attempt}/${2})...`);
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    const isRetryable = [429, 500, 502, 503, 504].includes(res.status);
                    console.warn(`[Gemini warning] Model ${model} returned HTTP ${res.status}: ${errText.slice(0, 250)}`);
                    
                    lastError = new Error(`Gemini API error (${res.status}): ${errText}`);
                    if (isRetryable && attempt < 2) {
                        await sleep(1000 * attempt);
                        continue;
                    }
                    break;
                }

                const responseData = await res.json();
                const rawResponse = responseData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').filter(Boolean).join('') || '';
                console.log(`[Gemini output (${model})]`, rawResponse.slice(0, 500));
                if (!rawResponse) throw new Error('لم يتم استلام أي رد من Gemini');

                const extracted = extractJson(rawResponse);
                console.log('[Extracted Receipt Data]', extracted);
                return extracted;
            } catch (err) {
                lastError = err;
                console.warn(`[Gemini error] Model ${model} failed on attempt ${attempt}:`, err.message);
                if (attempt < 2) {
                    await sleep(1000 * attempt);
                }
            }
        }
    }

    throw lastError || new Error('فشل في معالجة الإيصال عبر Gemini');
};

exports.scanReceipt = async (imageBase64, mimeType = 'image/jpeg') => {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const prompt = buildVisionReceiptPrompt();

    try {
        return await scanReceiptWithOllama(base64Data, prompt);
    } catch (ollamaErr) {
        console.warn('⚠️ Ollama scan failed, attempting Gemini fallback...', ollamaErr.message);
        if (GEMINI_API_KEY) {
            return await scanReceiptWithGemini(base64Data, mimeType, prompt);
        }
        throw ollamaErr;
    }
};

exports.enrichScanData = async ({ manufacturerName, fabricName, orderNumber }) => {
    console.log('enrichScanData:', { manufacturerName, fabricName, orderNumber });

    const searchByWords = async (table, columns, searchText) => {
        if (!searchText) return [];
        const words = searchText.trim().split(/\s+/).filter(w => w.length >= 2);
        if (words.length === 0) return [];
        const fullMatch = await knex(table).select(columns)
            .whereRaw('LOWER(name) LIKE ?', [`%${searchText.toLowerCase()}%`]).limit(5);
        if (fullMatch.length > 0) return fullMatch;
        let query = knex(table).select(columns);
        words.forEach((word, i) => {
            if (i === 0) query = query.whereRaw('LOWER(name) LIKE ?', [`%${word.toLowerCase()}%`]);
            else query = query.orWhereRaw('LOWER(name) LIKE ?', [`%${word.toLowerCase()}%`]);
        });
        return query.limit(8);
    };

    const industryMatches = await searchByWords('bussiness_man', ['id', 'name'], manufacturerName);
    console.log('industryMatches:', industryMatches);

    const fabricMatches = await searchByWords('fabric', ['id', 'name', 'code'], fabricName);
    console.log('fabricMatches:', fabricMatches);

    let yarnOrderByNumber = null;
    if (orderNumber) {
        yarnOrderByNumber = await knex('wa_yarn_order_requisition as wayor')
            .select([
                'wayor.id',
                'wayor.number',
                'wayor.name',
                'wayor.orders_requisitions_id',
                'wbmr.industry_id',
                'bm.name as industry_name',
                'wbmo.fabric_id',
                'f.name as fabric_name',
                'f.code as fabric_code',
                'wbmo.manufacturing_fee',
                'wbmo.manufacturing_fee_dollar',
            ])
            .join('wb_manufacturing_input_output as wbmio', 'wbmio.wa_yarn_order_requisition_id', 'wayor.id')
            .join('wb_manufacturing_requisition as wbmr', 'wbmr.id', 'wbmio.wb_manufacturing_requisition_id')
            .join('wb_manufacturing_output as wbmo', 'wbmo.id', 'wbmio.wb_manufacturing_output_id')
            .join('bussiness_man as bm', 'bm.id', 'wbmr.industry_id')
            .join('fabric as f', 'f.id', 'wbmo.fabric_id')
            .where('wayor.number', orderNumber)
            .where('wbmr.is_deleted', 0)
            .orderBy('wbmr.created_at', 'desc')
            .first();
        console.log('yarnOrderByNumber:', yarnOrderByNumber);
    }

    let previousOrder = null;
    const bestIndustry = industryMatches[0];
    const bestFabric = fabricMatches[0];

    if (yarnOrderByNumber) {
        previousOrder = {
            yarnOrderId: yarnOrderByNumber.id,
            yarnOrderName: yarnOrderByNumber.name,
            yarnOrderNumber: yarnOrderByNumber.number,
            ordersRequisitionsId: yarnOrderByNumber.orders_requisitions_id,
            industryId: yarnOrderByNumber.industry_id,
            industryName: yarnOrderByNumber.industry_name,
            fabricId: yarnOrderByNumber.fabric_id,
            fabricName: yarnOrderByNumber.fabric_name,
            fabricCode: yarnOrderByNumber.fabric_code,
            manufacturingFee: yarnOrderByNumber.manufacturing_fee,
            manufacturingFeeDollar: yarnOrderByNumber.manufacturing_fee_dollar,
            yarns: [],
            foundByNumber: true,
        };
    } else if (bestIndustry && bestFabric) {
        const recentOrder = await knex('wb_manufacturing_requisition as wbmr')
            .select([
                'wbmr.id',
                'wbmio.wa_yarn_order_requisition_id as yarn_order_id',
                'wayor.name as yarn_order_name',
                'wbmo.manufacturing_fee',
                'wbmo.manufacturing_fee_dollar',
            ])
            .innerJoin('wb_manufacturing_input_output as wbmio', 'wbmio.wb_manufacturing_requisition_id', 'wbmr.id')
            .innerJoin('wb_manufacturing_output as wbmo', 'wbmo.id', 'wbmio.wb_manufacturing_output_id')
            .innerJoin('wa_yarn_order_requisition as wayor', 'wayor.id', 'wbmio.wa_yarn_order_requisition_id')
            .where('wbmr.industry_id', bestIndustry.id)
            .where('wbmo.fabric_id', bestFabric.id)
            .where('wbmr.is_deleted', 0)
            .where('wbmr.is_active', 1)
            .orderBy('wbmr.created_at', 'desc')
            .first();

        if (recentOrder) {
            const yarns = await knex('wb_manufacturing_input as wbmi')
                .select([
                    'wbmi.yarn_id',
                    'y.name as yarn_name',
                    'y.code as yarn_code',
                    'wbmi.quantity',
                    'wbmi.ratio',
                ])
                .innerJoin('wb_manufacturing_input_output as wbmio2', 'wbmio2.wb_manufacturing_input_id', 'wbmi.id')
                .innerJoin('yarn as y', 'y.id', 'wbmi.yarn_id')
                .where('wbmio2.wb_manufacturing_requisition_id', recentOrder.id)
                .where('wbmi.is_deleted', 0)
                .where('wbmi.is_active', 1);

            previousOrder = {
                yarnOrderId: recentOrder.yarn_order_id,
                yarnOrderName: recentOrder.yarn_order_name,
                manufacturingFee: recentOrder.manufacturing_fee,
                manufacturingFeeDollar: recentOrder.manufacturing_fee_dollar,
                yarns,
                foundByNumber: false,
            };
        }
    }

    return { industryMatches, fabricMatches, previousOrder };
};
