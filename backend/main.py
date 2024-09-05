# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.data_validation import router as data_validation_router
from api.travel_article import router as travel_article_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_validation_router)
app.include_router(travel_article_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)