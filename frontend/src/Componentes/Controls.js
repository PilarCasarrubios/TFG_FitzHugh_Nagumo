import React from "react";

function Row({label, value, min, max, step, onChange, suffix="", disabled = false}){
    return(
        <label className = "row">
            <span>{label}: <b>{value}{suffix}</b></span>
            <input type = "range" min = {min} max = {max} step = {step} value = {value} disabled = {disabled}
                onChange = {(e) => onChange(Number(e.target.value))}/>
        </label>
    );
}

export default function Controls({ params, setParams, ic, setIC, sim, setSim, readOnly = false}){
    return(
        <div className = "card">
            <h3>Parámetros</h3>
            <Row label = "a" value = {params.a} min = {0.01} max = {0.9999} step = {0.01} disabled = {readOnly}
                onChange={(v) =>setParams(p=>({...p,a:v}))}/>
            <Row label = "b" value = {params.b} min = {0.01} max = {8.0} step = {0.01} disabled = {readOnly}
                onChange={(v) =>setParams(p=>({...p,b:v}))}/>
            <Row label = "g" value = {params.g} min = {5} max = {5.6} step = {0.001} disabled = {readOnly}
                onChange={(v) =>setParams(p=>({...p,g:v}))}/>
            <Row label = "I" value = {params.I} min = {0} max = {5.0} step = {0.01} disabled = {readOnly}
                onChange={(v) =>setParams(p=>({...p,I:v}))}/>

            <h4>Condiciones iniciales</h4>
            <Row label = "v0" value = {ic.v0} min = {-3} max = {3} step = {0.05} disabled = {readOnly}
                onChange={(v) =>setIC(x=>({...x,v0:v}))}/>
            <Row label = "w0" value = {ic.w0} min = {-3} max = {3} step = {0.05} disabled = {readOnly}
                onChange={(v) =>setIC(x=>({...x,w0:v}))}/>

            <h4>Simulación</h4>
            <Row label = "t máx" value = {sim.tMax} min = {20} max = {400} step = {5} disabled = {readOnly}
                onChange={(v) =>setSim(s=>({...s,tMax:v}))} suffix = " s"/>
            <Row label = "dt" value = {sim.dt} min = {0.005} max = {0.1} step = {0.005} disabled = {readOnly}
                onChange={(v) =>setSim(s=>({...s,dt:v}))} suffix = " s"/>
        </div>
    );
}