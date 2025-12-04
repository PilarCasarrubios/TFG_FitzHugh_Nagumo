export function fhnDeriv(v,w,p){
        const { a, b, g, I } = p;
        const dv = I - v * (v -a) * (v -1) - w;
        const dw = b * (v - g * w);
        return [dv, dw];
}

// export function rk4Step (v, w, h, p){
//     const [k1v, k1w] = fhnDeriv(v, w, p);
//     const [k2v, k2w] = fhnDeriv(v + 0.5*h*k1v, w + 0.5*h*k1w, p);
//     const [k3v, k3w] = fhnDeriv(v + 0.5*h*k2v, w + 0.5*h*k2w, p);
//     const [k4v, k4w] = fhnDeriv(v + h*k3v, w + h*k3w, p);
//     return [
//         v + (h/6)*(k1v + 2*k2v + 2*k3v + k4v),
//         w + (h/6)*(k1w + 2*k2w + 2*k3w + k4w),
//     ];
// }

// export function simulateFHN(p, ic, tMax = 100, dt = 0.05){
//     let v = ic.v0, w = ic.w0;
//     const t = [0], V=[v], W=[w];
//     for(let time = dt; time<=tMax; time+=dt){
//         [v,w] = rk4Step(v,w,dt,p);
//         t.push(time); V.push(v); W.push(w);
//     }
//     return { t, V, W };
// }
export async function fetchSimulate (p, ic, tMax, dt, baseURL = "https://fitzhugh-nagumo-back.onrender.com"){
    const res = await fetch(`${baseURL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: p.a, b: p.b, g: p.g, I: p.I, v0: ic.v0, w0: ic.w0, t0: 0, tf: tMax, dt: dt})
    });
    if(!res.ok) throw new Error(await res.text());
    return res.json();
}



export async function fetchEquilibrio(p, baseURL = "https://fitzhugh-nagumo-back.onrender.com") {  //llamamos a back para los puntos de equilibrio
    const res = await fetch (`${baseURL}/equilibrio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: p.a, b: p.b, g: p.g, I: p.I})
    })
    if (!res.ok) {
        const msg = (await res.text()).catch(() => "");
        throw new Error(`Backend error (${msg})`);
    }
    return res.json();
}