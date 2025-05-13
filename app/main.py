import uvicorn
from fastapi import FastAPI
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
)
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
from fastapi import Form, HTTPException, status  # Add necessary imports
from fastapi.responses import JSONResponse

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def get_base_dir():
    return os.path.dirname(os.path.abspath(__file__))


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")


@app.get("/apple-touch-icon.png", include_in_schema=False)
async def apple_touch_icon():
    return FileResponse("static/apple-touch-icon.png")


@app.get("/favicon-32x32.png", include_in_schema=False)
async def favicon_32():
    return FileResponse("static/favicon-32x32.png")


@app.get("/favicon-16x16.png", include_in_schema=False)
async def favicon_16():
    return FileResponse("static/favicon-16x16.png")


@app.get("/site.webmanifest", include_in_schema=False)
async def site_manifest():
    return FileResponse("static/site.webmanifest")


@app.get("/", response_class=HTMLResponse)
def get_index():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "index.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/login", response_class=HTMLResponse)
def get_login_fragment():
    """Serves the HTML fragment for the login form."""
    file_path = os.path.join(get_base_dir(), "templates", "login_fragment.html")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        # Log the error for debugging
        print(f"Error: Could not find login fragment at {file_path}")
        # Return an error response to the client
        return HTMLResponse(
            content="<p style='color:red;'>Error: Login form could not be loaded.</p>",
            status_code=500,  # Internal Server Error
        )
    except Exception as e:
        print(f"Error reading login fragment: {e}")
        return HTMLResponse(
            content="<p style='color:red;'>Error: Login form could not be loaded.</p>",
            status_code=500,
        )


# Add your user/auth logic here (e.g., using Depends for user data)


@app.post("/login")
async def post_login_api(username: str = Form(...), password: str = Form(...)):
    # --- Replace with your actual authentication logic ---
    print(f"Attempting login for user: {username}")  # Example logging
    if username == "testuser" and password == "password123":
        # In a real app, you'd create a session/token here
        print("Login successful (dummy check)")
        return JSONResponse(content={"message": "Login successful", "user": username})
    else:
        print("Login failed (dummy check)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},  # Or appropriate header
        )


# Add endpoints for other nav links returning HTML fragments
@app.get("/list", response_class=HTMLResponse)
async def get_list_fragment():
    return HTMLResponse(
        content="<h2>Cafe Collection</h2><p>List of cafes goes here...</p>"
    )


@app.get("/addgem", response_class=HTMLResponse)
async def get_addgem_fragment():
    # Example form
    return HTMLResponse(
        content="<h2>Add New GEM</h2><form><label>Name:</label><input type='text'><button type='submit'>Add</button></form>"
    )


@app.get("/about", response_class=HTMLResponse)
async def get_about_fragment():
    return HTMLResponse(content="<h2>About</h2><p>This is the about section...</p>")


# Example signup fragment endpoint
@app.get("/signup", response_class=HTMLResponse)
async def get_signup_fragment():
    # Example form
    return HTMLResponse(
        content="<h2>Sign Up</h2><form action='/signup' method='post'><label>Username:</label><input type='text' name='username'><label>Password:</label><input type='password' name='password'><button type='submit'>Sign Up</button></form>"
    )


# You'll also need a POST endpoint for /signup if you add that form
@app.post("/signup")
async def post_signup_api(username: str = Form(...), password: str = Form(...)):
    # --- Replace with your actual user creation logic ---
    print(f"Attempting signup for user: {username}")
    # Add user to database, etc.
    return JSONResponse(content={"message": "Signup successful", "user": username})


if __name__ == "__main__":
    uvicorn.run(app="app.main:app", host="0.0.0.0", port=8001, reload=True)
