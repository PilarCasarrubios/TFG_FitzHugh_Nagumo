import './App.css';
import React, { useEffect, useMemo, useState } from "react";
import Tabs from "./Componentes/Tabs";
import Controls from "./Componentes/Controls";
import Plot from "react-plotly.js";
import Estabilidad from "./Componentes/Estabilidad"
import { fhnDeriv, fetchSimulate, fetchEquilibrio } from "./lib/fhn";
import Resumen from "./Componentes/Resumen"


// ccURL del backend con fallbacks para Vite y CRA
const API_BASE = (() => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }
  return "http://localhost:8000";
})();

export default function App(){
  const[params, setParams] = useState({ a: 0.15, b:0.5, g:1.0, I: 0.4});
  const [ic, setIC] = useState({ v0: 0.0, w0: 0.0});
  const [sim, setSim] = useState({ tMax: 200, dt: 0.05});

  const[tab, setTab ] = useState("home");

  const[eq, setEq] = useState([])
  const[stabNC, setStabNC] = useState(null);

  const[traj, setTraj] = useState({t: [], V: [], W: []});
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState (null);


  useEffect(() => {
    let cancel = false;
    fetchEquilibrio(params, API_BASE)
    .then((res) => {
      if(!cancel) {
        setEq(res.points || []);
        setStabNC(res.isoclinas || null);
      }
    })
    .catch((err) => {
      console.error("Equilibrio error: ", err);
      if(!cancel) {setEq([]); setStabNC(null);}
    });
    return () => {cancel = true;}
  }, [params]); //se recalcula cuando cambien a,b,g,I


  useEffect(() => {
    let cancel = false;
    fetchSimulate(params, ic, sim.tMax, sim.dt, API_BASE)
    .then(({t, v, w}) => {
      if(!cancel) setTraj({t, V: v, W: w});
    })
    .catch((err) => {
      console.error("Error de simulación: ", err);
    });
    return () => {cancel = true;};
  }, [params, ic, sim]);

  //Campo vectorial para el plano de fases
  const view = { vmin: -3, vmax: 3, wmin: -3, wmax: 3 };
  const quiver = useMemo (() => {
    const density = 22, scale = 0.25;
    const vs = Array.from({ length: density }, (_, i) => view.vmin + (i * (view.vmax -view.vmin)) / (density -1));
    const ws = Array.from({ length: density }, (_, j) => view.wmin + (j * (view.wmax -view.wmin)) / (density -1));

    const x = [], y = [], u = [], v = [];
    vs.forEach(V => {
      ws.forEach(W => {
        const [dv, dw] = fhnDeriv(V, W, params);
        x.push(V); y.push(W);
        const norm = Math.hypot(dv, dw) || 1e-9;
        u.push((dv/norm) * scale);
        v.push((dw / norm) * scale);
      });
    });

    return{
      type: "scattergl",
      mode: "lines",
      x: x.flatMap((xi, i) => [xi -u[i] / 2, xi + u[i] / 2, null]),
      y: y.flatMap((yi, i) => [yi -v[i] / 2, yi + v[i] / 2, null]),
      line: { width: 1 },
      name: "campo",
      hoverinfo: "skip",
    };
  }, [params, view.vmin, view.vmax, view.wmin, view.wmax]);

  return (
    <>
    <header className="header-fixed">
      <h1>Simulaciones FitzHugh-Nagumo</h1>
    </header>
    <div className="container">
      
      <Tabs
        tabs = {[
          { key: "home", label: "Resumen"},
          { key: "sim", label: "Simulación temporal"},
          { key: "phase", label: "Plano de fases"},
          { key: "stab", label: "Estabilidad local"},
        ]}
        current = {tab}
        onChange={setTab}
      />
      <div className="layout">
        <aside>
          <Controls
            params = {params} setParams = {setParams}
            ic = {ic} setIC = {setIC}
            sim = {sim} setSim = {setSim}
            readOnly = {tab === "home"}
          />
        </aside>
        <main>
          {tab === "home" && <Resumen api = {API_BASE} eq={eq} />}
          {tab === "sim" && (
            <section className = "panel">
              <Plot
                data = {[
                  { x: traj.t, y: traj.V, type: "scatter", mode: "lines", name: "v(t)", line: {color: "#5c4bc4", width: 2.8}},
                  { x: traj.t, y: traj.W, type: "scatter", mode: "lines", name: "w(t)", line: {color: "#b6b0f2", width: 2.8}},
                ]}
                layout={{
                  title: "Evolución temporal",
                  xaxis: { title: "t" },
                  yaxis: { title: "valor" },
                  margin: { l: 50, r: 10, t: 40, b: 40},
                }}
                style={{ width: "100%", height: "100%"}}
                useResizeHandler
                config={{ displaylogo: false}}
              />
            </section>
          )}

          {tab === "phase" && (
            <section className = "panel">

              {eq.length > 0 && (
                <div className="equilibria-info">
                  <h3> Puntos de equilibrio </h3>
                  <p>
                    Son estados del sistema en los que {" "}
                    <code>dv/dt = 0</code> y <code>dw/dt = 0</code>.
                    Si el sistema empieza exactamente ahí, se queda quieto.
                  </p>
                  <ul>
                    {eq.map((p, i) => (
                      <li key = {i}>
                        {`eq${i+1} = (${p.v.toFixed(4)}, ${p.w.toFixed(4)})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Plot
                data = {[
                  quiver,
                  { x: traj.V, y: traj.W, type: "scatter", mode: "lines", name: "trayectoria", line: {color: "#4f3dbc", width: 3}},
                  {x: [traj.V[0]], y: [traj.W[0]], mode: "markers", name: "inicio", marker: {color: "#5c4bc4", size: 10 }},
                  { x: [traj.V.at(-1)], y: [traj.W.at(-1)], mode: "markers", name: "fin", marker: { color: "#b6b0f2", size: 10}
                },
                //puntos de equilibrio
                ...(eq.length
                  ? [
                    {
                      x: eq.map((p) => p.v), y: eq.map((p) => p.w),
                      mode: "markers+text", name: "equilibrios", 
                      text: eq.map(
                        (_, i) => `eq${i + 1}`
                      ), 
                      textposition: "top center",
                      marker: { color: "purple", size: 10, symbol: "x"},
                    },
                  ]
                  : []),
                ]}
                layout={{
                  title: "Plano de fases (campo vectorial)",
                  xaxis: { title: "v", range: [view.vmin,view.vmax]},
                  yaxis: { title: "w", range: [view.wmin, view.vmax]},
                  margin: {l: 50, r: 10, t: 40, b: 40 },
                  showlegend: true,
                }}
                style={{ width: "100%", height: "100%"}}
                useResizeHandler
                config={{ displaylogo: false}}
              />

              
            </section>
          )}
          {tab === "stab" && (
            <Estabilidad params = {params} eq = {eq} view = {view} isoclinas={stabNC}/>
          )}

        </main>
     </div>
    </div>
    </>
  );
}
