from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SimRequest(BaseModel): #ponemos valores por defecto
    a: float = 0.15
    b: float = 0.5
    g: float = 1
    I: float = 0.4
    v0: float = 0.0
    w0: float = 0.0
    t0: float = 0.0 
    tf: float = 50.0
    dt: float = 0.01
    stimulus: Optional[Dict[str, Any]] = None
    

class SimResponse(BaseModel):
    t: List [float]
    v: List [float]
    w: List [float]


class EquilibrioRequest(BaseModel): #como dependen de los parámetros actuales no les damos valor inicial (no hace falta)
    a: float
    b: float
    g: float
    I: float
    
    
class Equilibrio(BaseModel):
    v: float
    w: float
    lambda1: str
    lambda2: str
    tipo: str
    
class IsoclinasSeries(BaseModel):
    x: List[float]
    y: List[float]
    
    
class EquilibrioResponse(BaseModel):
    points: List[Equilibrio]
    isoclinas: Dict[str, IsoclinasSeries]