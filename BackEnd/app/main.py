from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .schemas import SimRequest, SimResponse, Equilibrio, EquilibrioRequest, EquilibrioResponse, IsoclinasSeries
from .simulation import simulate_fhn, puntos_equilibrio, analizar_equilibrio, isoclinas
from .info import get_model_info


app = FastAPI(title = "FitzHugh-Nagumo API", version = "0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"], #Acepta peticiones desde cualquier sitio
    allow_credentials = False,
    allow_methods = ["*"],
    allow_headers = ["*"]
)


@app.get("/health") #¿vivo?
def health():
    return {"status" : "ok"}

@app.post("/simulate", response_model = SimResponse) #
def simulate(req: SimRequest):
    t, v, w = simulate_fhn( a = req.a, b = req.b, g = req.g, I = req.I, v0 = req.v0, w0 = req.w0, t0 = req.t0, tf = req.tf, dt = req.dt, stimulus = req.stimulus)
    return SimResponse(t = t, v= v, w=w)

@app.post("/equilibrio", response_model = EquilibrioResponse)
def equilibrio(req: EquilibrioRequest):
    pts = puntos_equilibrio(req.a, req.b, req.g, req.I)
    
    eq_points = []
    for v,w in pts:
        info = analizar_equilibrio(v, w, req.a, req.b, req.g)
        eq_points.append(
            Equilibrio(
                v = v,
                w = w,
                lambda1 = info["lambda1"],
                lambda2 = info["lambda2"],
                tipo = info["tipo"]
            )
        )
    
    x, y_v0, y_w0 = isoclinas(req.a, req.b, req.g, req.I)
    iso_data = {
        "v0": IsoclinasSeries(x=x, y=y_v0),
        "w0": IsoclinasSeries(x=x, y=y_w0),
    }
    return EquilibrioResponse(points = eq_points, isoclinas=iso_data)

@app.get("/info")
def info():
    return get_model_info()