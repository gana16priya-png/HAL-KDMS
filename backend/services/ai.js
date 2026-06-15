const { Project, Decision, Issue, Document } = require('../models');

// Helper to tokenise and calculate basic similarity score
function calculateRelevance(text, queryTokens) {
  if (!text) return 0;
  const content = text.toLowerCase();
  let score = 0;
  queryTokens.forEach(token => {
    if (content.includes(token)) {
      score += 1;
      // Bonus if exact keyword matches as a distinct word
      const regex = new RegExp('\\b' + token + '\\b', 'g');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length * 0.5;
      }
    }
  });
  return score;
}

async function retrieveContext(query) {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) return { contextText: '', citations: [] };

  const decisions = await Decision.find({});
  const projects = await Project.find({});
  const issues = await Issue.find({});
  const documents = await Document.find({});

  const matches = [];

  // Score decisions
  decisions.forEach(d => {
    const textToMatch = `${d.title} ${d.projectName} ${d.department} ${d.description} ${d.reasoning} ${d.benefits} ${d.risks}`;
    const score = calculateRelevance(textToMatch, queryTokens);
    if (score > 0) {
      matches.push({
        type: 'Decision',
        title: d.title,
        id: d.id || d._id,
        details: `Decision: ${d.title}\nProject: ${d.projectName}\nDepartment: ${d.department}\nReasoning: ${d.reasoning}\nBenefits: ${d.benefits}\nRisks: ${d.risks}\nStatus: ${d.approvalStatus}\nDate: ${d.date}`,
        score: score * 1.5, // Boost decisions
        record: d
      });
    }
  });

  // Score projects
  projects.forEach(p => {
    const textToMatch = `${p.name} ${p.department} ${p.status} ${p.projectManager}`;
    const score = calculateRelevance(textToMatch, queryTokens);
    if (score > 0) {
      matches.push({
        type: 'Project',
        title: p.name,
        id: p.id || p._id,
        details: `Project: ${p.name}\nDepartment: ${p.department}\nStatus: ${p.status}\nProgress: ${p.progressPercentage}%\nTimeline: ${p.startDate} to ${p.endDate}\nManager: ${p.projectManager}`,
        score: score,
        record: p
      });
    }
  });

  // Score issues
  issues.forEach(i => {
    const textToMatch = `${i.title} ${i.description} ${i.department} ${i.priority} ${i.severity} ${i.rootCause} ${i.resolution}`;
    const score = calculateRelevance(textToMatch, queryTokens);
    if (score > 0) {
      matches.push({
        type: 'Issue',
        title: i.title,
        id: i.id || i._id,
        details: `Issue: ${i.title}\nDescription: ${i.description}\nDepartment: ${i.department}\nStatus: ${i.status}\nPriority: ${i.priority}\nRoot Cause: ${i.rootCause || 'N/A'}\nResolution: ${i.resolution || 'N/A'}`,
        score: score * 1.2, // Boost issues
        record: i
      });
    }
  });

  // Score documents
  documents.forEach(doc => {
    const textToMatch = `${doc.name} ${doc.tags.join(' ')}`;
    const score = calculateRelevance(textToMatch, queryTokens);
    if (score > 0) {
      matches.push({
        type: 'Document',
        title: doc.name,
        id: doc.id || doc._id,
        details: `Document: ${doc.name}\nTags: ${doc.tags.join(', ')}\nVersion: ${doc.version}\nUploaded by: ${doc.uploader}`,
        score: score * 0.8,
        record: doc
      });
    }
  });

  // Sort matches by relevance score descending
  matches.sort((a, b) => b.score - a.score);

  // Take top 4 matches
  const topMatches = matches.slice(0, 4);

  const contextText = topMatches.map(m => `[SOURCE: ${m.type} - ${m.title}]\n${m.details}`).join('\n\n');
  const citations = topMatches.map(m => ({
    id: m.id,
    type: m.type,
    title: m.title
  }));

  return { contextText, citations };
}

async function getSuggestions(query, queryTokens) {
  const decisions = await Decision.find({});
  const issues = await Issue.find({});
  const documents = await Document.find({});

  const relatedDecisions = decisions
    .map(d => ({
      id: d._id || d.id,
      title: d.title,
      score: calculateRelevance(d.title + ' ' + d.description, queryTokens)
    }))
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const relatedIssues = issues
    .map(i => ({
      id: i._id || i.id,
      title: i.title,
      score: calculateRelevance(i.title + ' ' + i.description, queryTokens)
    }))
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const relatedDocs = documents
    .map(doc => ({
      id: doc._id || doc.id,
      title: doc.name,
      score: calculateRelevance(doc.name + ' ' + doc.tags.join(' '), queryTokens)
    }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // General recommended actions based on keywords
  const recommendedActions = [];
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('supplier') || queryLower.includes('procurement') || queryLower.includes('replace')) {
    recommendedActions.push("Verify Supplier safety certifications logs", "Initiate milestone delay audit", "Review contractor transition plan");
  } else if (queryLower.includes('pressure') || queryLower.includes('leak') || queryLower.includes('gear') || queryLower.includes('hydraulic')) {
    recommendedActions.push("Perform pressure cycle tests on test jig 8", "Install 3-micron fluid filters", "Replace synthetic seals with fluoropolymer brackets");
  } else if (queryLower.includes('radar') || queryLower.includes('telemetry') || queryLower.includes('avionics') || queryLower.includes('target')) {
    recommendedActions.push("Recalibrate target tracking in thermal chamber", "Verify brackets expansion index", "Run flight computer RTOS interface diagnostics");
  } else {
    recommendedActions.push("Review division engineering guidelines", "Consult previous safety reviews of similar aircraft", "Log decision changes in HAL's BRAIN archive");
  }

  const previousCases = [];
  if (queryLower.includes('pressure') || queryLower.includes('leak')) {
    previousCases.push({ caseId: "HAL-REF-712", title: "Tejas hydraulic pipeline connector burst (2024)" });
  }
  if (queryLower.includes('supplier') || queryLower.includes('replace')) {
    previousCases.push({ caseId: "HAL-REF-109", title: "AeroSystems avionics software delivery audit delay (2025)" });
  }
  if (previousCases.length === 0) {
    previousCases.push({ caseId: "HAL-REF-034", title: "Standard aircraft component stress telemetry review" });
  }

  return {
    decisions: relatedDecisions,
    issues: relatedIssues,
    documents: relatedDocs,
    previousCases,
    recommendedActions
  };
}

function refineAnswerForMode(text, activeMode) {
  if (activeMode !== 'Beginner') return text;

  // Let's perform a list of regex-based replacements to simplify technical jargon!
  let simplified = text;

  const dictionary = [
    { regex: /fly-by-wire/gi, replace: "electronic cockpit control system (Fly-by-Wire)" },
    { regex: /procurement inefficiencies/gi, replace: "ordering delays and supplier issues" },
    { regex: /MIL-STD-178C certification safety timelines/gi, replace: "safety standards and testing deadlines" },
    { regex: /safety compliance certificates/gi, replace: "official safety approvals" },
    { regex: /Titanium Ti-6Al-4V \(Grade-5\)/gi, replace: "strong Titanium metal" },
    { regex: /thermography scans/gi, replace: "heat imaging scans" },
    { regex: /structural micro-cracks/gi, replace: "tiny cracks in the metal structure" },
    { regex: /nozzle mounting assembly/gi, replace: "engine exhaust nozzle mount" },
    { regex: /computational fluid dynamics \(CFD\)/gi, replace: "airflow simulation tests" },
    { regex: /supersonic engine stalls/gi, replace: "sudden engine shutdown during fast flights" },
    { regex: /elastomer seal erosion/gi, replace: "wearing out of the rubber seals" },
    { regex: /particulate contamination/gi, replace: "dirt and tiny metal pieces in the fluid" },
    { regex: /synthetic fluoropolymer/gi, replace: "durable synthetic rubber" },
    { regex: /azimuthal drift/gi, replace: "slight target tracking angle error" },
    { regex: /thermal expand coefficient/gi, replace: "how much metals expand when heated" },
    { regex: /Invar-36 alloy/gi, replace: "a special metal alloy that does not expand when hot" },
    { regex: /pressure pulsations/gi, replace: "unstable fuel pressure waves" },
    { regex: /military and reheat levels/gi, replace: "normal thrust and engine afterburner speeds" },
    { regex: /nozzle intake grid redesign/gi, replace: "changing the engine air intake design" },
    { regex: /re-angle stealth intake grid boundary layer diverters by negative 4\.5 degrees/gi, replace: "tilting the stealth air intake doors slightly downwards" },
    { regex: /boundary layer diverters/gi, replace: "air diverters" },
    { regex: /CFD tests/gi, replace: "computerized wind tunnel tests" }
  ];

  dictionary.forEach(entry => {
    simplified = simplified.replace(entry.regex, entry.replace);
  });

  // Let's add beginner instructions block
  let header = `### HAL's Brain Assistant (Simplified Beginner Mode)\n\n`;
  header += `*Here is a simplified explanation in easy English. Just like changing a worn-out bicycle tire to prevent a flat, we monitor and replace parts on aircraft to keep them flying safely. Here is a step-by-step review of what happened:*\n\n`;
  
  // Strip out headers
  simplified = simplified.replace("### HAL Knowledge Assistant (Local Retrieval Model)\n\n", "");
  simplified = simplified.replace("Based on the organizational records found in the HKDMS repository, here is the synthesis of information relevant to your inquiry:\n\n", "");
  simplified = simplified.replace("Based on the organizational records found in the HKDMS repository, here is the synthesis of information relevant to your inquiry:", "");

  return header + simplified;
}

async function askQuestion(query, mode = 'Professional') {
  const { contextText, citations } = await retrieveContext(query);
  const openAIKey = process.env.OPENAI_API_KEY;
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  let activeMode = mode;
  const queryLower = query.toLowerCase();
  if (queryLower.includes('explain simply') || 
      queryLower.includes("don't understand") || 
      queryLower.includes("i don't understand") ||
      queryLower.includes('easy english')) {
    activeMode = 'Beginner';
  }

  const suggestions = await getSuggestions(query, queryTokens);

  if (openAIKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are HAL's Brain Assistant, serving Hindustan Aeronautics Limited. Answer in ${activeMode} mode.
              
              - Beginner Mode: Simplify the answer, avoid complex technical terms, explain step-by-step, use bullet points, use real-world analogies, and explain like you are speaking to a non-technical person.
              - Professional Mode: Provide standard, concise, professional business-ready summaries suitable for managers.
              - Detailed Technical Mode: Provide full engineering details, quoting specifications and parameters.`
            },
            {
              role: 'user',
              content: `Context:\n${contextText || 'No matching organizational documents or decisions found.'}\n\nQuestion: ${query}`
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }

      const responseData = await response.json();
      const answer = responseData.choices[0].message.content;
      return { answer, citations, suggestions };
    } catch (err) {
      console.error('OpenAI call failed, falling back to local reasoning:', err);
    }
  }

  // --- LOCAL FALLBACK ---
  if (citations.length === 0) {
    return {
      answer: `I searched the HAL's BRAIN repository but could not find specific records addressing **"${query}"**. 

You can try:
1. Searching with different keywords (e.g., specific aircraft models like "LCA", "Tejas", "Su-30" or general categories like "Supplier", "Landing Gear").
2. Logging a Decision Record or raising a ticket in the Smart Issue Tracker to log new organizational knowledge.`,
      citations: [],
      suggestions
    };
  }

  let answerText = `### HAL's Brain Assistant (Local Retrieval Model)\n\n`;
  answerText += `Based on the organizational records found in the repository, here is the synthesis of information relevant to your inquiry:\n\n`;

  citations.forEach((citation, idx) => {
    const detailBlock = contextText.split('\n\n')[idx] || '';
    
    if (citation.type === 'Decision') {
      answerText += `**Decision Context: [${citation.title}](source-${citation.id})**\n`;
      if (detailBlock.includes('Reasoning:')) {
        const reasoning = detailBlock.split('Reasoning:')[1]?.split('\n')[0] || '';
        answerText += `- **Reasoning**: ${reasoning}\n`;
      }
      if (detailBlock.includes('Benefits:')) {
        const benefits = detailBlock.split('Benefits:')[1]?.split('\n')[0] || '';
        answerText += `- **Expected Benefits**: ${benefits}\n`;
      }
      if (detailBlock.includes('Risks:')) {
        const risks = detailBlock.split('Risks:')[1]?.split('\n')[0] || '';
        answerText += `- **Identified Risks**: ${risks}\n`;
      }
    } else if (citation.type === 'Issue') {
      answerText += `**Issue Ticket: [${citation.title}](source-${citation.id})**\n`;
      if (detailBlock.includes('Description:')) {
        const desc = detailBlock.split('Description:')[1]?.split('\n')[0] || '';
        answerText += `- **Summary**: ${desc}\n`;
      }
      if (detailBlock.includes('Root Cause:')) {
        const root = detailBlock.split('Root Cause:')[1]?.split('\n')[0] || '';
        if (root.trim() && root.trim() !== 'N/A') {
          answerText += `- **Root Cause**: ${root}\n`;
        }
      }
      if (detailBlock.includes('Resolution:')) {
        const res = detailBlock.split('Resolution:')[1]?.split('\n')[0] || '';
        if (res.trim() && res.trim() !== 'N/A') {
          answerText += `- **Resolution**: ${res}\n`;
        }
      }
    } else if (citation.type === 'Project') {
      answerText += `**Project Status: [${citation.title}](source-${citation.id})**\n`;
      if (detailBlock.includes('Status:')) {
        const status = detailBlock.split('Status:')[1]?.split('\n')[0] || '';
        const progress = detailBlock.split('Progress:')[1]?.split('\n')[0] || '';
        const manager = detailBlock.split('Manager:')[1]?.split('\n')[0] || '';
        answerText += `- **Status**: Currently classified as **${status.trim()}** (${progress.trim()} complete).\n`;
        answerText += `- **Project Lead**: Led by Project Manager **${manager.trim()}**.\n`;
      }
    } else if (citation.type === 'Document') {
      answerText += `**Technical Document: [${citation.title}](source-${citation.id})**\n`;
      if (detailBlock.includes('Tags:')) {
        const tags = detailBlock.split('Tags:')[1]?.split('\n')[0] || '';
        const uploader = detailBlock.split('Uploaded by:')[1]?.split('\n')[0] || '';
        answerText += `- **Tags**: Indexed under \`${tags.trim()}\`.\n`;
        answerText += `- **Uploader**: Maintained in database by ${uploader.trim()}.\n`;
      }
    }
    answerText += `\n`;
  });

  answerText += `*Please refer to the source links in the citations side-panel to review the complete records, associated attachments, or audit histories.*`;

  // Refine answer based on mode
  const finalAnswer = refineAnswerForMode(answerText, activeMode);

  return {
    answer: finalAnswer,
    citations,
    suggestions
  };
}

module.exports = {
  askQuestion,
  retrieveContext
};
