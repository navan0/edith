import uvicorn
from config import PORT, MODE

if __name__ == "__main__":
    uvicorn.run("edith:app",
                port=int(PORT), reload=MODE, debug=MODE, workers=1)
