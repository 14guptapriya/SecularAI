from langchain_core.documents import Document
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from uuid import uuid4
import pandas as pd
import os

load_dotenv()

# 1️⃣ Load dataset
df = pd.read_csv(
    "./data/quran_english.csv",
    sep="|",
    header=None,
    names=["surah", "ayah", "english"],
    encoding="latin-1"
)
df = df.dropna()
df = df[df["english"].str.strip() != ""]

documents = []

for _, row in df.iterrows():
    content = (
        f"Quran Surah {row['surah']} "
        f"Ayah {row['ayah']}: {row['english']}"
    )

    metadata = {
        "religion": "Islam",
        "book": "Quran",
        "surah": str(row["surah"]),
        "ayah": str(row["ayah"]),
        "language": "english"
    }

    documents.append(
        Document(
            page_content=content,
            metadata=metadata
        )
    )

print(f"Total Quran ayahs loaded: {len(documents)}")

# 2️⃣ Embeddings
embeddings = MistralAIEmbeddings(model="mistral-embed")

# 3️⃣ Pinecone
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index_name = "quran-english"

if index_name not in [i["name"] for i in pc.list_indexes()]:
    pc.create_index(
        name=index_name,
        dimension=1024,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

index = pc.Index(index_name)

vector_store = PineconeVectorStore(
    index=index,
    embedding=embeddings
)

# 4️⃣ Upload
ids = [str(uuid4()) for _ in range(len(documents))]
BATCH_SIZE = 50

for i in range(0, len(documents), BATCH_SIZE):
    vector_store.add_documents(
        documents=documents[i:i+BATCH_SIZE],
        ids=ids[i:i+BATCH_SIZE]
    )
    print(f"Uploaded {min(i+BATCH_SIZE, len(documents))}/{len(documents)}")

print("✅ Quran (English) indexed successfully!")