def get_model_info():
    return {
        "titulo": "Modelo de FitzHugh-Nagumo",
        "ecuaciones":[
            "dv/dt = I-v(v-a)(v-1)-w",
            "dw/dt = b (v-gw)",
        ],
        "descripcion":(
            "El modelo de FitzHugh-Nagumo es un sistema de dos variables que simplifica "
            "la dinámica del potencial de acción neuronal. Describe la interacción entre "
            "una variable de activación rápida (v) y una variable de recuperación lenta (w)."
        ),
        "extra": {
            "puntos_equilibrio": "Los puntos de equilibrio se obtienen resolviendo dv/dt = 0 y dw/dt = 0.",
            "estabilidad": "La estabilidad depende del Jacobiano y los autovalores. ",
            "isoclinas": {
                "dv/dt": "w = I - v(v-a)(v-1)",
                "dw/dt": "w = v/g"
            }
        }
    }