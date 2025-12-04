import React from "react";

export default function Tabs({ tabs, current, onChange}){  //controla que vista se muestra (simulacion o plano de fases, se colorea el activo con la clase "active")
    return(
        <div className = "tabs">
            {tabs.map((t) => (
                <button
                    key = {t.key}
                    className = {`tab ${current ===t.key ? "active":""}`}
                    onClick={() => onChange(t.key)}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}