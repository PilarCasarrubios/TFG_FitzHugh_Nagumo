import React, {useEffect, useState} from "react";

export default function Resumen({api, eq}){
    const[info, setInfo] = useState(null);

    useEffect(() => {
        fetch(`${api}/info`)
            .then(res=>res.json())
            .then(setInfo)
            .catch(err=>console.error("Error cargando info: ", err));
    }, [api]);


    if(!info) return <section className = "panel resumen"><p> Cargando... </p></section>;

    return (
        <section className = "panel resumen">
            <div className="resumen-content">
                <header className="resumen-header">
                    <h2>{info.titulo}</h2>
                    <p className="resumen-tagline">
                        Un sistema excitable de dos variables que captura la esencia del potencial de acción neuronal.
                    </p>
                </header>
            
            
            <section className="resumen-section">
                <h3>Ecuaciones del sistema</h3>
                <pre className = "ecuaciones">
                {
                    info.ecuaciones.map((eqTxt, i) => `(${i+1}) ${eqTxt}`).join("\n")
                }
                </pre>
                <p className= "resumen-small">
                    La variable <strong>v</strong> representa la activación rápida (potencial de membrana) y {" "} <strong>w</strong> una variable de recuperación lenta.
                </p>
            </section>

            <section className="resumen-section">
                <h3>Descripción</h3>
                <p>{info.descripcion}</p>
                <ul className="resumen-bullets">
                    <li><strong>v(t)</strong>: variable de activación (rápida).</li>
                    <li><strong>w(t)</strong>: variable de recuperación (lenta).</li>
                    <li><strong>a, b, g</strong>: parámetros que controlan la forma de la dinámica.</li>
                    <li><strong>I</strong>: estímulo externo aplicado al sistema.</li>
                </ul>
            </section>
            
            <section className="resumen-section">
                <h3>Puntos de equilibrio (explicación) </h3>
                <p>{info.extra.puntos_equilibrio}</p>
            </section>

            <section className = "resumen-section">
                <h3>Estabilidad local (explicación)</h3>
                <p>{info.extra.estabilidad}</p>
            </section>

            <section className = "resumen-section">
                <h3>Isoclinas</h3>
                <div className = "resumen-isoclinas">
                    <div>
                        <span className="iso-label">dv/dt = 0; </span>
                        <span className="iso-eq">{info.extra.isoclinas["dv/dt"]}</span>
                    </div>
                    <div>
                        <span className="iso-label">dw/dt = 0;</span>
                        <span className="iso-eq">{info.extra.isoclinas["dw/dt"]}</span>
                    </div>
                </div>
            </section>
            

            

            

            

            
            {eq && eq.length > 0 && (
                <section className = "resumen-section">
                    <h3>Puntos de equilibrio para los parámetros actuales</h3>
                    <p>
                        Calculados numéricamente con los valores actuales de <strong>a, b, g</strong> e <strong>I</strong>.
                    </p>
                    <ul className = "resumen-eq-list">
                        {eq.map((p, i) => (
                            <li key = {i}>
                                <span className="eq-name">{`eq${i+1}`}</span>
                                <span className="eq-coord">
                                    ({p.v.toFixed(4)}, {p.w.toFixed(4)})
                                </span>
                                <span className="eq-type">
                                    - {p.tipo}
                                </span>
                                <span className="eq-lambdas">
                                    {"  "}λ₁ = {p.lambda1}, λ₂ = {p.lambda2}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
                    
            )}

            {eq && eq.length === 0 && (
                <section className="resumen-section">
                    <h3>Puntos de equilibrio para los parámetros actuales</h3>
                    <p> 
                        No se han encontrado puntos de equilibrio con los parámetros actuales.
                    </p>
                </section>
            )}
            </div>
        </section>
    );
}