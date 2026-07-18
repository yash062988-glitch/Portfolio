"use client";

import React from "react";
import MeshText from "./MeshText";

export default function SmokyMeshText({
    text = "MESH",
    color = "#ffffff",
    className = "",
    colorSplit = true,
    customColors = ["#e9b15d", "#ffffff"],
    force = 18,
    as = "h2",
    ...rest
}) {
    return (
        <MeshText
            text={text}
            color={color}
            className={className}
            colorSplit={colorSplit}
            customColors={customColors}
            force={force}
            as={as}
        />
    );
}
