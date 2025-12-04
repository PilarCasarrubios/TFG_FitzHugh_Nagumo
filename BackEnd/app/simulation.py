import numpy as np

def fhn_rhs(v, w, a, b, g, I): #SISTEMA PRINCIPAL
    dv = I - v*(v - a)*(v-1.0) - w
    dw = b*(v - g*w)
    return dv, dw

def simulate_fhn (a, b, g , I , v0 , w0 , t0 , tf , dt , stimulus = None): #Método de Runge-kutta 4 (RK4)
    n = int(np.ceil((tf - t0)/dt))+1 #Total de pasos hasta tf
    t = np.linspace(t0, tf, n) #Vector de tiempos entre t0 y tf
    
    #Creamos arrays vacios para v y w
    v = np.zeros(n) 
    w = np.zeros(n)
    #Valores iniciales
    v[0], w[0] = v0, w0
    
    for i in range(n-1):
        h = t[i+1] - t[i]
        k1v, k1w = fhn_rhs(v[i], w[i], a, b, g, I) #inicio paso
        k2v, k2w = fhn_rhs(v[i] + 0.5*h*k1v, w[i] + 0.5*h*k1w, a, b, g, I)
        k3v, k3w = fhn_rhs(v[i] + 0.5*h*k2v, w[i] + 0.5*h*k2w, a, b, g, I)
        k4v, k4w = fhn_rhs(v[i] + h*k3v, w[i] + h*k3w, a, b, g, I) #final paso
        
        #(1,2,2,1)
        v[i+1] = v[i] + (h/6.0)*(k1v + 2*k2v + 2*k3v + k4v)
        w[i+1] = w[i] + (h/6.0)*(k1w + 2*k2w + 2*k3w + k4w)
        
    return t.tolist(), v.tolist(), w.tolist()

 
# def puntos_equilibrio(a: float, b: float, g: float, I: float, tol: float = 1e-9):
#     if g == 0:
#         raise ValueError("b debe ser > 0 para definir en el equilibrio.") #no va a saltar nunca porque no se da la opcion de que metan 0 
    
#     coeffs = [1.0, -(1.0 + a), (a + 1.0/g), -I]
#     roots = np.roots(coeffs)
    
#     pts = []
#     for r in roots:
#         if abs(r.imag) < tol:
#             v_star = float(r.real)
#             w_star = v_star / g 
#             pts.append((v_star, w_star))
            
    
#     pts.sort(key = lambda t: t[0])
#     return pts


def puntos_equilibrio (a,b,g,I):
    # if g== 0:
    #     return[(-b, I+b*(-b-a)*(-b-1))] #quitar esto y poner si b = 1 a lo mejor 
    
    coeffs = [1.0, -(1.0 + a), (a + 1.0/g), -I]
    roots = np.roots(coeffs) #buscamos las raices (libreria numpy)
    
    #nos quedamos con las raices reales
    pts = []
    for r in roots:
        if abs(r.imag) < 1e-9:
            v = float (r.real)
            w = v/g
            pts.append((v,w))
            
    pts.sort(key = lambda t: t[0])  #se usa el primer valor de la tupla (v) como criterio de orden
    return pts

def analizar_equilibrio (v, w, a, b, g, tol_imag = 1e-8):
    
    #calculo jacobianos, autvalores y tipo de equilibrio
    
    J11 = -3.0 * v**2 + 2.0 * (1.0 + a) * v -a
    J12 = -1.0
    J21 = b
    J22 = -b*g
    
    J= np.array([[J11, J12],
                 [J21, J22]])
    
    #autovalores
    vals = np.linalg.eigvals(J)
    l1, l2 = vals[0], vals[1]
    
    def fmt(l):
        if abs(l.imag)<tol_imag:
            return f"{l.real:.6f}"
        else: 
            return f"{l.real:.3f} + {l.imag:.3f}i"
        
    lambda1 = fmt(l1)
    lambda2 = fmt(l2)
    
    re1, re2 = l1.real, l2.real
    im1, im2 = l1.imag, l2.imag
    
    if abs(im1)>tol_imag or abs(im2)>tol_imag:
        real_part = re1
        if real_part<0:
            tipo = "Localmente exponencialmente estable"
        elif real_part>0:
            tipo = "Localmente inestable"
        else:
            tipo = "Centro"
    else:
        if re1 * re2 < 0:
            tipo = "Punto de silla"
        elif re1<0 and re2<0:
            tipo = "Localmente estable"
        elif re1>0 and re2>0:
            tipo = "Localmente inestable"
        else:
            tipo = "Caso límite (autovalor nulo)"
    
    # tr = J11 + J22
    # det = J11 * J22 - J12 * J21
    # disc = tr**2 -4.0 * det
    
    # if disc >= 0:
    #     sqrtD = np.sqrt(disc)
    #     l1 = 0.5 * (tr +sqrtD)
    #     l2 = 0.5 * (tr -sqrtD)
    #     lambda1 = f"{l1:.3f}"
    #     lambda2 = f"{l2:.3f}"
        
    #     if det<0:
    #         tipo = "Punto de silla (inestable)"
    #     elif tr<0:
    #         tipo = "Nodo estable"
    #     elif tr>0:
    #         tipo = "Nodo inestable"
    #     else:
    #         tipo = "Caso limite (traza = 0)"
    # else:
    #     real = tr/2.0
    #     imag = np.sqrt(-disc) / 2.0
    #     lambda1 = f"{real:.3f} + {imag:.3f}i"
    #     lambda2 = f"{real:.3f} - {imag:.3f}i"
        
    #     if real < 0:
    #         tipo = "Foco / espiral estable"
    #     elif real > 0:
    #         tipo = "Foco / espiral inestable"
    #     else:
    #         tipo = "Centro (neutro)"
    
    tr = (l1+l2).real
    det = (l1*l2).real
    disc = tr**2 -4.0*det
    
    return{
        "lambda1": lambda1,
        "lambda2": lambda2,
        "tipo" : tipo,
        "traza": tr,
        "det": det,
        "discriminante": disc,
    }
    
    
def isoclinas(a, b, g, I, vmin = -3.0, vmax = 3.0, densidad = 200):
    vs = np.linspace(vmin, vmax, densidad)
    w_v0 = I-vs*(vs-a)*(vs-1.0)
    w_w0 = vs / g
    
    return vs.tolist(), w_v0.tolist(), w_w0.tolist()