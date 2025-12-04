import React, {useMemo} from "react";
import Plot from "react-plotly.js";
import {fhnDeriv} from "../lib/fhn";

export default function Estabilidad ({params, eq, view, isoclinas}){
    const campo = useMemo(() => {
        const densidad = 18;
        const escala = 0.25;

        const vs = Array.from(
            {length: densidad},
            (_, i) => view.vmin + (i*(view.vmax -view.vmin)) / (densidad -1)
        );
        const ws = Array.from(
            {length: densidad},
            (_, j) => view.wmin + (j*(view.wmax -view.wmin)) / (densidad -1)
        );

        const cx = [];
        const cy = [];
        const u = [];
        const v = [];


        vs.forEach((V) => {
            ws.forEach((W) => {
                const [dv, dw] = fhnDeriv(V, W, params);
                const norm = Math.hypot(dv, dw) || 1e-9;
                cx.push(V);
                cy.push(W);
                u.push((dv / norm)*escala);
                v.push((dw / norm)*escala);
            });
        });


        const lineTrace = {
            type: "scattergl",
            mode: "lines",
            x: cx.flatMap((xi, i) => [xi, xi + u[i], null]),
            y: cy.flatMap((yi, i) => [yi, yi + v[i], null]),
            line: {width: 1},
            name: "campo",
            hoverinfo: "skip",
        };

        const arrowAnnotations = cx.map((xi, i) => ({
            x: xi + u[i],
            y: cy[i] + v[i],
            ax: xi,
            ay: cy[i],
            xref: "x", 
            yref: "y",
            axref: "x",
            ayref: "y",
            showarrow: true,
            arrowhead: 2,
            arrowsize: 0.8,
            arrowwidth: 1,
            arrowcolor: "blue",
        }));

        return {
            traces: [lineTrace],
            annotations: arrowAnnotations,
        };
    }, [params, view.vmin, view.vmax, view.wmin, view.wmax]);


    //     const arrowX = [];
    //     const arrowY = [];
    //     const arrowSymbols = [];


    //     cx.forEach((xi, i) => {
    //         const yi = cy[i];
    //         const ux = u[i];
    //         const vy = v[i];


    //         const xEnd = xi + ux /2;
    //         const yEnd = yi + vy /2;
    //         arrowX.push(xEnd);
    //         arrowY.push(yEnd);


    //         let sym;
    //         if(Math.abs(ux) >= Math.abs(vy)) {
    //             sym = ux >= 0 ? "arrow-right":"arrow-left";
    //         }else{
    //             sym = vy >= 0 ? "arrow-up":"arrow-down";
    //         }

    //         arrowSymbols.push(sym);
    //     });

    //     const arrowTrace = {
    //         type: "scattergl",
    //         mode: "markers",
    //         x: arrowX,
    //         y: arrowY,
    //         marker: {
    //             size: 8,
    //             symbol: arrowSymbols,
    //             color: "blue",
    //         },
    //         name: "dirección",
    //         hoverinfo: "skip",
    //     };

    //     return [lineTrace, arrowTrace];
    // }, [params, view.vmin, view.vmax, view.wmin, view.wmax]);


    const curvas = useMemo(() => {
        if(!isoclinas) return [];
        const traces = [];
        if(isoclinas.v0){
            traces.push({
                x: isoclinas.v0.x,
                y: isoclinas.v0.y,
                type: "scatter",
                mode: "lines",
                name: "isoclina v' = 0",
                line: {width: 2, color: "#5c4bc4"},
            });
        }
        if(isoclinas.w0){
            traces.push({
                x: isoclinas.w0.x,
                y: isoclinas.w0.y,
                type: "scatter",
                mode: "lines",
                name: "isoclina w' = 0",
                line: {width: 2, dash: "dot", color: "#8a82d0"},
            });
        }

        return traces;
    }, [isoclinas]);


    return (
        <section className = "panel">
            {eq.length > 0 && (
                <div className="info-estabilidad">
                    <h3> Estabilidad local de los puntos de equilibrio</h3>
                    <p>
                        Analizamos el Jacobiano en cada punto de equilibrio. Los autovalores determinan el tipo de punto de equilibrio.
                    </p>
                    <ul>
                        {eq.map((p,i) => (
                            <li key = {i}>
                                <strong>{`eq${i+1}`}</strong> = (
                                    {p.v.toFixed(4)}, {p.w.toFixed(4)}
                                )-{" "}
                                <em>{p.tipo}</em>, lambda1 = {p.lambda1}, lambda2 = {p.lambda2}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Plot
                data={[
                    ...campo.traces,
                    ...curvas,
                    ...(eq.length
                        ? [
                            {
                                x: eq.map((p) => p.v),
                                y: eq.map((p) => p.w),
                                mode: "markers",
                                name: "equilibrios",
                                marker: {color: "purple", size: 10, symbol: "x"},
                            },
                        ]
                    : []),
                ]}

                layout={{
                    title: "Campo de direcciones e isoclinas",
                    xaxis: {title: "v", range: [view.vmin, view.vmax]},
                    yaxis: {title: "w", range: [view.wmin, view.wmax]},
                    margin: {l: 50, r: 10, t: 40, b: 40},
                    showlegend: true,
                    annotations: campo.annotations,
                }}

                style = {{width: "100%", height: "100%"}}
                useResizeHandler
                config={{displaylogo: false}}

            />
        </section>
    )
}