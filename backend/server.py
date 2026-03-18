"""
Spyco Portal - FastAPI server that serves static files and proxies API requests
"""
import os
import httpx
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

app = FastAPI(title="Spyco Portal")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NODE_SERVER = "http://127.0.0.1:3001"
STATIC_DIR = Path("/app")

@app.get("/api/health")
async def health():
    """Health check - also check Node.js server"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NODE_SERVER}/api/health", timeout=5.0)
            return response.json()
    except:
        return {"status": "ok", "node": "unavailable"}

# Serve the portal at /api/portal
@app.get("/api/portal")
async def serve_portal():
    """Serve the main portal HTML"""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        # Read and modify HTML to use absolute paths
        content = index_path.read_text()
        # Update paths to use /api/portal prefix
        content = content.replace('href="css/', 'href="/api/portal/css/')
        content = content.replace('src="js/', 'src="/api/portal/js/')
        content = content.replace('href="manifest.json"', 'href="/api/portal/manifest.json"')
        content = content.replace('href="assets/', 'href="/api/portal/assets/')
        content = content.replace('src="assets/', 'src="/api/portal/assets/')
        content = content.replace('src="sw.js"', 'src="/api/portal/sw.js"')
        return HTMLResponse(content=content, media_type="text/html")
    return HTMLResponse("<h1>Portal not found</h1>")

@app.get("/api/portal/css/{path:path}")
async def serve_portal_css(path: str):
    file_path = STATIC_DIR / "css" / path
    if file_path.exists():
        return FileResponse(file_path, media_type="text/css")
    return Response(status_code=404)

@app.get("/api/portal/js/{path:path}")
async def serve_portal_js(path: str):
    file_path = STATIC_DIR / "js" / path
    if file_path.exists():
        return FileResponse(file_path, media_type="application/javascript")
    return Response(status_code=404)

@app.get("/api/portal/assets/{path:path}")
async def serve_portal_assets(path: str):
    file_path = STATIC_DIR / "assets" / path
    if file_path.exists():
        return FileResponse(file_path)
    return Response(status_code=404)

@app.get("/api/portal/manifest.json")
async def serve_portal_manifest():
    return FileResponse(STATIC_DIR / "manifest.json", media_type="application/json")

@app.get("/api/portal/sw.js")
async def serve_portal_sw():
    file_path = STATIC_DIR / "sw.js"
    if file_path.exists():
        return FileResponse(file_path, media_type="application/javascript")
    return Response(status_code=404)

# Proxy all other /api/* requests to Node.js server
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api(request: Request, path: str):
    """Proxy all /api/* requests to Node.js server"""
    async with httpx.AsyncClient() as client:
        url = f"{NODE_SERVER}/api/{path}"
        
        # Forward headers
        headers = {k: v for k, v in request.headers.items() if k.lower() not in ["host", "content-length"]}
        
        # Get body if present
        body = await request.body()
        
        try:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Filter response headers
            resp_headers = {k: v for k, v in response.headers.items() 
                          if k.lower() not in ["content-encoding", "transfer-encoding", "content-length"]}
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=resp_headers
            )
        except Exception as e:
            return {"error": str(e), "message": "Backend server not available"}
