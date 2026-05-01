<div align="center">

# 🔮 SecularAi

### 🪷 *Ancient wisdom, modern tech. Chat with the Bhagavad Gita.*

**[🚀 Try it live → secular-ai.vercel.app](https://secular-ai.vercel.app)**

</div>

---

<div align="center">

## 🎯 The Idea

</div>

<table>
<tr>
<td width="60%">

Ever wanted to ask the Gita a question without flipping through 700 verses?

This chatbot gets it. Type your question in plain English, and it pulls the most relevant verses, then explains them using **Retrieval-Augmented Generation**.

No hallucinations. No generic wisdom. Just grounded answers from the actual text.

</td>
<td width="40%">

```ascii
    🧘
   /|\    "What should
   / \     I do about fear?"
    
    ↓
    
   🤖 SecularAi
   
   ↓
   
  📖 "Chapter 2, Verse 56
     speaks about..."
```

</td>
</tr>
</table>

<br>

---

<br>

<div align="center">

## 💎 Features That Matter

</div>

<br>

<div align="center">

| | | |
|:---:|:---:|:---:|
| 🔍 | 💬 | 🎯 |
| **Semantic Search** | **Memory** | **Zero BS** |
| Natural language queries | Remembers conversation | Grounded in actual verses |
| ⚡ | 🎨 | 📱 |
| **Streaming** | **Clean UI** | **Responsive** |
| Real-time responses | No clutter | Works everywhere |

</div>

<br>

---

<br>

<div align="center">

## ⚡ Architecture

</div>

<br>

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  👤 YOU                                                          │
│  │  "What does Krishna say about dharma?"                       │
│  │                                                               │
│  ↓                                                               │
│  🧠 MISTRAL EMBEDDINGS                                           │
│  │  Query → Vector [0.234, 0.891, ...]                          │
│  │                                                               │
│  ↓                                                               │
│  🗄️  PINECONE                                                     │
│  │  Search 10,000+ pre-embedded Gita chunks                     │
│  │  Return top 5 most similar verses                            │
│  │                                                               │
│  ↓                                                               │
│  📦 CONTEXT BUILDER                                              │
│  │  Combine: Retrieved verses + Chat history + Your query       │
│  │                                                               │
│  ↓                                                               │
│  🤖 GROQ (LLAMA MODEL)                                           │
│  │  Generate answer grounded in retrieved context               │
│  │                                                               │
│  ↓                                                               │
│  💬 STREAM RESPONSE                                              │
│  │  "In Chapter 3, Krishna explains..."                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

<br>

<div align="center">

```diff
+ Gita PDF pre-chunked and embedded in vector DB
+ Query → Embed → Search → Retrieve → Generate → Stream
+ Context stays in chat memory for follow-up questions
- No hallucinations because answers are grounded in retrieved text
```

</div>

<br>

---

<br>

<div align="center">

## 🧰 Built With

</div>

<br>

<table align="center">
<tr>
<td align="center" width="33%">

### 🎨 Frontend

**Next.js 14**  
App Router + React Server Components

**TailwindCSS**  
Utility-first styling

**Vercel AI SDK**  
Streaming chat UI primitives

</td>
<td align="center" width="33%">

### ⚙️ Backend

**FastAPI**  
Python async API framework

**LangChain**  
RAG orchestration & memory

**Uvicorn**  
Lightning-fast ASGI server

</td>
<td align="center" width="33%">

### 🤖 AI Stack

**Groq API**  
Llama model for generation

**Mistral Embeddings**  
Vector representations

**Pinecone**  
Managed vector database

</td>
</tr>
</table>

<br>

---

<br>

<div align="center">

## 🚀 Run It Locally

</div>

<br>

<table>
<tr>
<td width="50%">

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

**Server runs on:** `http://localhost:8000`

</td>
<td width="50%">

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

**App runs on:** `http://localhost:3000`

</td>
</tr>
</table>

<br>

<details>
<summary>🔐 <b>Environment Variables</b> (click to expand)</summary>

<br>

**Backend** `.env`
```env
GROQ_API_KEY=your_groq_key_here
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=gitarag
MISTRAL_API_KEY=your_mistral_key_here
```

**Frontend** `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

</details>

<br>

---

<br>

<div align="center">

## 🤝 Contributing

Want to improve this? PRs are welcome.  
Keep code clean, follow existing patterns.

<br>

---

<br>

> **📝 Note:** Open for educational use only.

<br>

---

<br>

**Built with modern AI tools to make ancient philosophy more accessible** ✨

*Bhagavad Gita text is in public domain*

</div>
