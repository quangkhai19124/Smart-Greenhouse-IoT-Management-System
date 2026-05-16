import { GoogleGenAI } from '@google/genai';

// ==========================
// Helpers
// ==========================

export const getRawTextFromResponse = (response) => {
  let raw = '';
  try {
    if (typeof response?.text === 'function') raw = response.text();
    else if (typeof response?.text === 'string') raw = response.text;
    else if (typeof response?.output_text === 'string') raw = response.output_text;
    else if (Array.isArray(response?.candidates)) {
      const pieces = [];
      for (const c of response.candidates) {
        const parts = c?.content?.parts || [];
        for (const p of parts) if (p?.text) pieces.push(String(p.text));
      }
      raw = pieces.join(' ').trim();
    }
  } catch (_) {}
  return raw;
};

export const classifyTelegramIntent = async (userText, devices = []) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const devicesJson = JSON.stringify(devices).slice(0, 4000);

    const prompt = [
      'You are an intent classifier for a smart greenhouse Telegram bot.',
      'You MUST answer with a single JSON object and nothing else.',
      'JSON schema:',
      '{',
      '  "intent": "SENSOR_DATA" | "DEVICE_CONTROL" | "OTHER",',
      '  "deviceId": number | null,',
      '  "desiredStatus": "ON" | "OFF" | null,',
      '  "desiredPower": number | null,  // 0–100, percentage or power level. If not specified, use null.',
      '  "reason": string',
      '}',
      '',
      'Rules:',
      '- If the user is asking about greenhouse sensor measurements, readings, weather, temperature, humidity, CO2, light, or environment → intent = "SENSOR_DATA".',
      '- If the user wants to turn ON/OFF a specific device from the provided list → intent = "DEVICE_CONTROL".',
      '  - Choose exactly one deviceId from the list, or null if you are not sure.',
      '  - desiredStatus must be "ON" or "OFF".',
      '  - If the user mentions a strength/percentage/level (e.g. 50%, 70, half power, etc.) infer desiredPower (0–100). Otherwise use null.',
      '- Otherwise → intent = "OTHER".',
      '',
      'User message:',
      String(userText || '').slice(0, 1000),
      '',
      'Devices JSON (array of devices, with at least id, deviceName, adaDevName, status):',
      devicesJson,
      '',
      'Answer with valid JSON only. Do NOT use markdown, backticks or extra text.',
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    console.log('Gemini classifyTelegramIntent result (raw):', response);

    const raw = getRawTextFromResponse(response);
    console.log('Gemini classifyTelegramIntent text:', raw);

    const trimmed = String(raw || '').trim();
    let jsonText = trimmed;

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = trimmed.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonText);

    const intent = parsed.intent || 'OTHER';

    const deviceId =
      typeof parsed.deviceId === 'number'
        ? parsed.deviceId
        : parsed.deviceId === null
        ? null
        : null;

    const desiredStatus =
      parsed.desiredStatus === 'ON' || parsed.desiredStatus === 'OFF'
        ? parsed.desiredStatus
        : null;

    const rawPower = parsed.desiredPower;
    const desiredPower =
      typeof rawPower === 'number' && !Number.isNaN(rawPower)
        ? Math.max(0, Math.min(100, Math.round(rawPower)))
        : null;

    const reason = typeof parsed.reason === 'string' ? parsed.reason : '';

    return {
      intent,
      deviceId,
      desiredStatus,
      desiredPower,
      reason,
    };
  } catch (error) {
    console.error('Gemini classifyTelegramIntent failed:', error);
    return {
      intent: 'OTHER',
      deviceId: null,
      desiredStatus: null,
      reason: 'Fallback after error',
    };
  }
};

