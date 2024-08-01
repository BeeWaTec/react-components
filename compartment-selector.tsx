import React, { forwardRef, useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { FaCompress, FaWeightHanging } from "react-icons/fa";
import { isDarkColor } from "@/helpers/base/helpers";
import TransparentPattern from "@/components/base/assets/transparent-pattern.jpg";
import { Color } from "fabric/fabric-impl";

interface CompartmentSelectorPropsOption {
    id: string;
    title: string;
    weightMin: number;
    weightMax: number;
    weightUnit?: string;
    thicknessMin: number;
    thicknessMax: number;
    otherFeatures: string[];
    colors: {
        name: string;
        rgba: string;
        textureFile?: string;
        textColor?: string;
    }[];
    componentProtection: number;
    endurance: number;
    clipResistance: number;
    sliding: number;
    surfaceStability: number;
    areasOfUse: {
        bag: boolean;
        box_lid: boolean;
        box_body: boolean;
        compartment_frame: boolean;
        compartment_partition: boolean;
        compartment_bottom: boolean;
    };
}
interface CompartmentSelectorProps {
    value?: string;
    options?: CompartmentSelectorPropsOption[];
    onChange?: (value: string) => void;
}
const CompartmentSelector = forwardRef<HTMLDivElement, CompartmentSelectorProps>(({ value, options = [], onChange }, ref) => {

    // States
    const [search, setSearch] = useState("");

    // Variables
    const handleSelect = (id: string) => onChange?.(id);

    return (
        <div
            ref={ref}
            className="flex flex-row flex-wrap gap-2 w-full p-4 justify-around items-start h-256 overflow-y-scroll gap-y-8"
        >
            <div className="w-full flex flex-row items-center justify-between">
                <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-md"
                    placeholder="Search for a compartment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {options.filter((item) => {
                let _search = search.trim();
                // Search for "bag: true" or "box_lid: true" or "box_body: true" or "compartment_frame: true" or "compartment_partition: true" or "compartment_bottom: true"
                while (true) {
                    const areaRegex = /(bag|box_lid|box_body|compartment_frame|compartment_partition|compartment_bottom):\s*(true|false)/i;
                    if (areaRegex.test(_search)) {
                        const [, area, value] = areaRegex.exec(_search) as RegExpExecArray;
                        console.log(`Regex: ${areaRegex} -> Area: ${area}, Value: ${value}`);
                        _search = _search.replace(areaRegex, "").trim();
                        if ((item.areasOfUse as any)[area] !== (value === "true")) return false;
                    }
                    else break;
                }
                // Search for "min-weight: number", "max-weight: number", "min-thickness: number", "max-thickness: number"
                while (true) {
                    const weightThicknessRegex = /(min|max)-(weight|thickness):\s*(\d+(?:\.\d+)?)(?:\s*(g\/m²|mm))?/i;
                    if (weightThicknessRegex.test(_search)) {
                        let [, minMax, weightThickness, value, unit] = weightThicknessRegex.exec(_search) as RegExpExecArray;
                        console.log(`Regex: ${weightThicknessRegex} -> Min/Max: ${minMax}, Weight/Thickness: ${weightThickness}, Value: ${value}, Unit: ${unit}`);
                        _search = _search.replace(weightThicknessRegex, "").trim();
                        if (unit !== "undefined" && item.weightUnit !== unit) return false;
                        if (unit === "undefined" && item.weightUnit !== "g/m²") return false;
                        console.log(`Item: ${item.weightMin} - ${item.weightMax} - ${item.thicknessMin} - ${item.thicknessMax}`);
                        if (minMax === "min" && weightThickness === "weight" && item.weightMin < parseFloat(value)) return false;
                        if (minMax === "max" && weightThickness === "weight" && item.weightMax > parseFloat(value)) return false;
                        if (minMax === "min" && weightThickness === "thickness" && item.thicknessMin < parseFloat(value)) return false;
                        if (minMax === "max" && weightThickness === "thickness" && item.thicknessMax > parseFloat(value)) return false;
                    }
                    else break;
                }

                // Search for "component-protection: number", "endurance: number", "clip-resistance: number", "sliding: number", "surface-stability: number"
                while (true) {
                    const attributeRegex = /(component-protection|endurance|clip-resistance|sliding|surface-stability):\s*(\d+)/i;
                    if (attributeRegex.test(_search)) {
                        let [, attribute, value] = attributeRegex.exec(_search) as RegExpExecArray;
                        console.log(`Regex: ${attributeRegex} -> Attribute: ${attribute}, Value: ${value}`);
                        _search = _search.replace(attributeRegex, "").trim();
                        if ((item as any)[attribute] < parseFloat(value)) return false;
                    }
                    else break;
                }
                // Trim the search string
                _search = _search.trim();
                // Search for the title, other features, and colors
                if (item.title.toLowerCase().includes(_search.toLowerCase())) return true;
                if (item.otherFeatures.join(" ").toLowerCase().includes(_search.toLowerCase())) return true;
                if (item.colors.some(({ name }) => name.toLowerCase().includes(_search.toLowerCase()))) return true;
                return false;
            }).sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
                <CompartmentCard
                    key={item.id}
                    item={item}
                    isSelected={item.id === value}
                    onSelect={handleSelect}
                />
            ))}
        </div>
    );
});

const CompartmentCard: React.FC<{
    item: CompartmentSelectorPropsOption;
    isSelected: boolean;
    onSelect: (id: string) => void;
}> = ({ item, isSelected, onSelect }) => {
    return (
        <button
            className={classNames(
                "relative text-md overflow-hidden max-w-80 w-full h-[33rem]",
                "rounded-xl shadow-md",
                "border border-gray-200 border-solid",
                "flex flex-col items-start justify-between",
                "transition-all duration-300 ease-in-out",
                "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                { "ring-2 ring-blue-500": isSelected }
            )}
            onClick={() => onSelect(item.id)}
        >
            <div className="w-full flex flex-col">
                <div
                    className="relative text-xl font-bold w-full shadow-md h-12 flex flex-row flex-nowrap items-center justify-center"
                >
                    {item.colors.length > 0 && (

                        <span
                            className="relative z-20 flex-grow flex items-center justify-center h-full p-3 "
                            style={{
                                color: item.colors[0].textColor || (isDarkColor(item.colors[0].rgba) ? "white" : "black")
                            }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 z-0"
                            >
                                <img
                                    src={TransparentPattern}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                    alt={``}
                                />
                            </div>
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 z-10"
                                style={{
                                    backgroundColor: item.colors[0].rgba,
                                }}
                            />
                            {item.colors[0].textureFile && (
                                <img
                                    src={`/compartment/${item.colors[0].textureFile}`}
                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                    alt={`${item.title} texture`}
                                />
                            )}
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 z-20 flex items-center justify-center"
                            >
                                {item.title}
                            </div>
                        </span>
                    )}
                </div>
                <div
                    className="relative text-xl font-bold w-full shadow-md h-4 flex flex-row flex-nowrap items-center justify-center"
                >
                    {item.colors.map(({ name, rgba: color, textureFile, textColor }) => (

                        <span
                            className="relative z-20 flex-grow flex items-center justify-center h-full"
                            style={{
                                color: textColor || (isDarkColor(color) ? "white" : "black")
                            }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 z-0"
                            >
                                <img
                                    src={TransparentPattern}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                    alt={``}
                                />
                            </div>
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 z-10"
                                style={{
                                    backgroundColor: color,
                                }}
                            />
                            {textureFile && (
                                <img
                                    src={`/compartment/${textureFile}`}
                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                    alt={``}
                                />
                            )}
                        </span>
                    ))}
                </div>
                <div className="flex flex-col p-4">
                    <div className="flex flex-row items-center">
                        <FaWeightHanging />
                        <span className="ml-2">Weight</span>
                        <div className="flex-grow" />
                        {item.weightMin !== item.weightMax ? (
                            <span>{item.weightMin} - {item.weightMax} {item.weightUnit || "g/m²"}</span>
                        ) : (
                            <span>{item.weightMin} {item.weightUnit || "g/m²"}</span>
                        )}
                    </div>
                    <div className="flex flex-row items-center">
                        <FaCompress />
                        <span className="ml-2">Thickness</span>
                        <div className="flex-grow" />
                        {item.thicknessMin !== item.thicknessMax ? (
                            <span>{item.thicknessMin} - {item.thicknessMax} mm</span>
                        ) : (
                            <span>{item.thicknessMin} mm</span>
                        )}
                    </div>
                </div>
                <div
                    className="italic h-14 p-2 overflow-hidden overflow-ellipsis w-full"
                >
                    {item.otherFeatures.length > 0 && (
                        <>
                            {item.otherFeatures.join(", ")}
                        </>
                    )}
                </div>
                <div
                    className="flex flex-row gap-2 p-2 w-full h-18 text-sm flex-wrap overflow-hidden"
                >
                    {/* As bag */}
                    {item.areasOfUse.bag && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Bag
                        </div>
                    )}
                    {/* As box lid */}
                    {item.areasOfUse.box_lid && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Box Lid
                        </div>
                    )}
                    {/* As box body */}
                    {item.areasOfUse.box_body && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Box Body
                        </div>
                    )}
                    {/* As compartment frame */}
                    {item.areasOfUse.compartment_frame && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Compartment Frame
                        </div>
                    )}
                    {/* As compartment partition */}
                    {item.areasOfUse.compartment_partition && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Compartment Partition
                        </div>
                    )}
                    {/* As compartment bottom */}
                    {item.areasOfUse.compartment_bottom && (
                        <div className="p-1 bg-gray-100 text-gray-500 text-center no-wrap whitespace-nowrap">
                            Compartment Bottom
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full space-y-2 p-4">
                <AttributeBar label="Component Protection" value={item.componentProtection} />
                <AttributeBar label="Endurance" value={item.endurance} />
                <AttributeBar label="Clips Resistance" value={item.clipResistance} />
                <AttributeBar label="Sliding" value={item.sliding} />
                <AttributeBar label="Surface Stability" value={item.surfaceStability} />
            </div>
        </button>
    );
};

const AttributeBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setWidth(value), 50);
        return () => clearTimeout(timer);
    }, [value]);

    const barColor = useMemo(() => {
        if (value < 30) return "bg-red-500";
        if (value < 70) return "bg-yellow-500";
        return "bg-green-500";
    }, [value]);

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="font-medium">{label}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
};

CompartmentSelector.displayName = "CompartmentSelector";
export default CompartmentSelector;