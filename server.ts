import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Chat endpoint with financial context
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, financialContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY não configurada no servidor.",
        reply: "Para ativar o Assistente com IA, certifique-se de configurar sua chave de API nos Secrets do AI Studio.",
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Mensagens inválidas." });
    }

    const systemInstruction = `Você é o FinanSmart AI, um consultor financeiro pessoal experiente, empático e prático no Brasil.
Contexto financeiro atual do usuário:
${financialContext ? JSON.stringify(financialContext, null, 2) : "Nenhum dado informado ainda."}

Diretrizes:
- Responda sempre em português brasileiro de forma amigável, clara, encorajadora e altamente prática.
- Considere a moeda Real (R$).
- Se o usuário estiver no vermelho (saldo negativo ou gastos maiores que receitas), priorize dicas para estancar vazamentos, negociar dívidas e readequar hábitos de consumo.
- Destaque estratégias para a categoria em que o usuário mais gastou.
- Incentive a criação de reserva de emergência e investimentos graduais (Tesouro Direto, CDBs, etc.).
- Mantenha as respostas concisas e fáceis de ler, usando tópicos quando apropriado.`;

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "Não foi possível gerar uma resposta no momento.",
    });
  } catch (error: any) {
    console.error("Erro na rota /api/chat:", error);
    res.status(500).json({
      error: error?.message || "Erro ao processar conversa financeira com IA.",
    });
  }
});

// Receipt / Invoice analysis endpoint
app.post("/api/analyze-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY não configurada no servidor.",
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "Imagem não fornecida." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    const effectiveMimeType = mimeType || "image/jpeg";

    const prompt = `Analise este comprovante, cupom fiscal, fatura ou extrato financeiro.
Extraia os seguintes dados em formato JSON estrito:
{
  "merchant": "Nome do estabelecimento ou fonte do pagamento",
  "amount": 0.00, // número decimal positivo com o valor total
  "date": "YYYY-MM-DD", // data da transação ou a data atual se não encontrar
  "type": "expense", // "expense" para gasto/compra ou "income" se for comprovante de depósito/salário/pix recebido
  "category": "Alimentação", // escolha entre: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Contas & Serviços, Compras, Salário, Investimentos, Outros
  "description": "Breve descrição dos itens ou do comprovante",
  "confidence": "alta" // "alta", "media" ou "baixa"
}
Retorne estritamente o JSON sem markdown de código ou texto adicional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: effectiveMimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        temperature: 0.1,
      },
    });

    const rawText = (response.text || "").trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Formato de dados não reconhecido na leitura do comprovante.");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro na rota /api/analyze-receipt:", error);
    res.status(500).json({
      error: error?.message || "Erro ao analisar imagem do comprovante.",
    });
  }
});

// Dynamic financial saving advice endpoint
app.post("/api/financial-advice", async (req, res) => {
  try {
    const { summary } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return smart localized tips as fallback if API key is not present
      const isRed = summary ? summary.balance < 0 : false;
      return res.json({
        tips: [
          {
            title: isRed ? "Atenção: Orçamento no Vermelho" : "Meta de 20% para Poupança",
            description: isRed
              ? "Seus gastos ultrapassaram seus ganhos este mês. Tente aplicar a regra 50-30-20 e corte despesas não essenciais imediatamente."
              : "Excelente controle! Reserve pelo menos 20% das suas entradas diretamente para investimentos ou reserva de emergência antes de gastar.",
            badge: isRed ? "Urgente" : "Dica de Ouro",
            category: "Orçamento",
          },
          {
            title: "Auditoria de Assinaturas e Recorrências",
            description: "Revise serviços de streaming, planos de celular e mensalidades que você não usa com frequência. O cancelamento pode economizar até R$ 200/mês.",
            badge: "Economia",
            category: "Hábitos",
          },
          {
            title: "Regra das 48 Horas para Compras",
            description: "Antes de realizar compras de impulso superiores a R$ 100, espere 48 horas. Você perceberá que muitas vontades passageiras evaporam.",
            badge: "Comportamento",
            category: "Controle",
          },
        ],
      });
    }

    const prompt = `Com base neste resumo financeiro do mês:
${JSON.stringify(summary, null, 2)}

Gere 3 dicas de economia e otimização financeira personalizadas e práticas.
Retorne estritamente um array JSON de objetos:
[
  {
    "title": "Título direto e acionável",
    "description": "Explicação prática e direta com valores ou percentuais sugeridos",
    "badge": "Prioritário / Dica de Ouro / Economia / Atenção",
    "category": "Orçamento / Hábitos / Investimentos / Dívidas"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    const rawText = (response.text || "").trim();
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const tips = JSON.parse(jsonMatch[0]);
      return res.json({ tips });
    }

    res.json({ tips: [] });
  } catch (error: any) {
    console.error("Erro na rota /api/financial-advice:", error);
    res.status(500).json({ error: error?.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), "dist");
    const distPath = fs.existsSync(path.join(cwdDist, "index.html")) ? cwdDist : process.cwd();
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinanSmart Server running on http://localhost:${PORT}`);
  });
}

startServer();
