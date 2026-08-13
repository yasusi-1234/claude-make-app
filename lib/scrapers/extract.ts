import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

export interface ExtractedListing {
  found: boolean;
  name?: string;
  price?: number;
}

const SYSTEM_PROMPT = `あなたは中古買取・販売サイトの検索結果ページのテキストから、
指定されたJAN/バーコードに一致する商品の名称と価格(円、税込表記があれば税込を優先)を
抽出するアシスタントです。該当する商品が本文中に見当たらない場合は found を false に
してください。複数の候補がある場合は、最も価格情報が明確なものを1件だけ選んでください。`;

const REPORT_LISTING_TOOL: Anthropic.Tool = {
  name: "report_listing",
  description: "検索結果ページから抽出した商品情報を報告する",
  input_schema: {
    type: "object",
    properties: {
      found: { type: "boolean", description: "該当商品が見つかったかどうか" },
      name: { type: "string", description: "商品名" },
      price: { type: "number", description: "価格(円、税込)" },
    },
    required: ["found"],
  },
};

export async function extractListing(pageText: string, barcode: string): Promise<ExtractedListing> {
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `JANコード: ${barcode}\n\n検索結果ページの本文:\n${pageText}\n\nこのJANコードに対応する商品の名前と価格を報告してください。`,
      },
    ],
    tools: [REPORT_LISTING_TOOL],
    tool_choice: { type: "tool", name: "report_listing" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) return { found: false };

  return toolUse.input as ExtractedListing;
}
