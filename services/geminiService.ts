
import { GoogleGenAI } from "@google/genai";
import { Student, FeeRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsights(students: Student[], fees: FeeRecord[]) {
  const pendingFees = fees.filter(f => f.paidAmount < f.totalAmount);
  const totalPending = pendingFees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
  
  const prompt = `
    Analyze this school fee data and provide 3-4 actionable financial insights for the administrator.
    Data Summary:
    - Total Students: ${students.length}
    - Total Pending Collections: Rs. ${totalPending}
    - Number of Pending Records: ${pendingFees.length}
    
    Pending Students Details:
    ${pendingFees.map(f => {
      const student = students.find(s => s.id === f.studentId);
      return `- ${student?.name} (${student?.grade}): Due Rs. ${f.totalAmount - f.paidAmount} for ${f.month}`;
    }).join('\n')}

    Format your response as a concise, professional list of recommendations. 
    Focus on collection strategies, communication with parents, and financial health in the context of a school in Pakistan.
    Keep it brief and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Could not generate insights at this time. Please check your collection reports manually.";
  }
}
