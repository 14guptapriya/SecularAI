from langchain_core.documents import Document
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from uuid import uuid4
import pandas as pd
import os

load_dotenv()

# Check keys
print("Mistral API:", os.environ.get("MISTRAL_API_KEY"))


# -------------------------------
# 1️⃣ Load Excel instead of PDF
# -------------------------------
file_path = "./data/bhagavad_gita.xlsx"
df = pd.read_excel(file_path)

documents = []

for _, row in df.iterrows():
    content = (
        f"Bhagavad Gita Chapter {row['chapter']} "
        f"Verse {row['verse_number']}: {row['verse_text']}"
    )

    metadata = {
        "religion": "Hindu",
        "book": "Bhagavad Gita",
        "chapter": str(row["chapter"]),
        "verse": str(row["verse_number"])
    }

    documents.append(
        Document(
            page_content=content,
            metadata=metadata
        )
    )

print(f"Total verses loaded: {len(documents)}")

# -------------------------------
# 2️⃣ Initialize Embeddings
# -------------------------------
embeddings = MistralAIEmbeddings(model="mistral-embed")

# -------------------------------
# 3️⃣ Initialize Pinecone
# -------------------------------
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))

index_name = "bhagavad-gita"

existing_indexes = [i["name"] for i in pc.list_indexes()]

if index_name not in existing_indexes:
    pc.create_index(
        name=index_name,
        dimension=1024,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    print("✅ Pinecone index created")

index = pc.Index(index_name)

vector_store = PineconeVectorStore(
    embedding=embeddings,
    index=index
)

# -------------------------------
# 4️⃣ Upload to Pinecone
# -------------------------------
uuids = [str(uuid4()) for _ in range(len(documents))]

vector_store.add_documents(
    documents=documents,
    ids=uuids
)

print("✅ Bhagavad Gita verses uploaded successfully using Excel dataset!")