const knex = require('../../db/config/connection').getConnection();

const OLLAMA_URL        = process.env.OLLAMA_URL        || 'http://localhost:11434';
const OLLAMA_OCR_MODEL  = process.env.OLLAMA_OCR_MODEL  || 'deepseek-ocr';
const OLLAMA_TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || 'qwen2.5:1.5b';

const stripHtml = (html) =>
    html.replace(/<\|[^|]*\|>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const buildJsonPrompt = (ocrText) =>
`You are extracting data from an Arabic textile receipt. Read the text below and return ONLY a JSON object.
Use JSON null (not the string "null") for any field not clearly present in the text.

Receipt text:
"""
${ocrText}
"""

Return this JSON with values extracted from the text above (no invented values):
{"date":null,"document":null,"orderNumber":null,"manufacturerName":null,"fabricName":null,"quantity":null,"numberFabricPieces":null,"notes":null,"yarns":[]}`;

const cleanNulls = (obj) => {
    if (typeof obj === 'string' && obj.trim().toLowerCase() === 'null') return null;
    if (Array.isArray(obj)) return obj.map(cleanNulls).filter(
        item => item !== null && !(typeof item === 'object' && Object.values(item).every(v => v === null))
    );
    if (obj && typeof obj === 'object')
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cleanNulls(v)]));
    return obj;
};

const extractJson = (text) => {
    const clean = text.replace(/<\|[^|]*\|>/g, '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error(`No JSON found: ${clean.slice(0, 300)}`);
    return cleanNulls(JSON.parse(clean.slice(start, end + 1)));
};

const ollamaChat = async (model, messages, options = {}) => {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false, options: { temperature: 0.1, ...options } })
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text().catch(() => '')}`);
    return ((await res.json())?.message?.content || '').trim();
};

exports.scanReceipt = async (imageBase64, mimeType) => {
    // Step 1: deepseek-ocr يحوّل الصورة لنص
    const ocrRaw  = await ollamaChat(OLLAMA_OCR_MODEL, [
        { role: 'user', content: 'Extract all text from this document image.', images: [imageBase64] }
    ]);
    const ocrText = stripHtml(ocrRaw);
    console.log('[OCR text]', ocrText.slice(0, 400));
    if (!ocrText) throw new Error('deepseek-ocr returned empty content');

    // Step 2: qwen2.5:1.5b يحوّل النص لـ JSON
    const jsonRaw = await ollamaChat(OLLAMA_TEXT_MODEL, [
        { role: 'user', content: buildJsonPrompt(ocrText) }
    ], { num_predict: 300 });
    console.log('[JSON raw]', jsonRaw.slice(0, 400));
    return extractJson(jsonRaw);
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
