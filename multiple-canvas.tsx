import React, { forwardRef, useEffect, useRef } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useState from 'react-usestateref'
import { useDraggable } from "react-use-draggable-scroll";
import { faPlus, faTrashAlt } from "@fortawesome/pro-solid-svg-icons";
import Canvas, { CanvasType } from '@/components/base/canvas';

import './multiple-canvas.module.css';

interface MultipleCanvasProps {
    value?: string[]
    onChange?: (value: string[]) => void;
}
const MultipleCanvas = forwardRef<HTMLDivElement, MultipleCanvasProps>((props, ref) => {

    // References
    const [canvasDataIndex, setCanvasDataIndex, canvasDataIndexRef] = useState(0);
    const canvasRef = useRef<CanvasType>(null);
    const [canvasData, setCanvasData, canvasDataRef] = useState<string[]>(props.value || []);

    // Set Canvas Data if index changes, etc
    useEffect(() => {
        // Set canvas data
        if (canvasRef != null && canvasRef.current != null) {
            canvasRef.current.setJson(canvasData[canvasDataIndex]);
        }
    }, [canvasData, canvasDataIndex, canvasRef]);

    // Load first index after load via timer
    useEffect(() => {
        setTimeout(() => {
            if (canvasRef != null && canvasRef.current != null) {
                canvasRef.current.setJson(canvasData[0]);
            }
        }, 100);
    }, []);

    // Timer to trigger onCanvasChange
    return <>
        <div
            className='multi-canvas flex flex-col items-start justify-start w-full'
        >
            <div className="flex flex-row items-stretch justify-between w-full">
                <span
                    className="border-r-[1px] border-gray-300 px-4 py-2"
                >
                    Sheets:
                </span>
                <div
                    className="flex flex-row items-center flex-grow justify-start overflow-x-scroll overflow-y-hidden whitespace-nowrap no-scrollbar"
                    ref={ref}
                >
                    {(canvasData.length > 0 ? canvasData : ['']).map((_, index) => (
                        <button
                            key={index}
                            className={classNames(
                                'aspect-w-1 aspect-h-1 px-4 py-2',
                                index !== 0 ? ' border-l-[1px] border-gray-300' : ' border-l-0',
                                index === canvasData.length - 1 ? ' border-r-[1px] border-gray-300' : ' border-r-0',
                                canvasDataIndex === index ? 'font-bold text-base text-primary-1' : 'font-medium text-sm text-gray-500',
                            )}
                            onClick={() => {
                                setCanvasDataIndex(index);
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <div className="flex flex-row items-center border-l-2 border-primary-1">
                    <button
                        className={classNames(
                            'px-4 py-2 text-sm font-medium bg-white !disabled:hover:bg-gray-100 grow disabled:opacity-50 text-green-600',
                        )}
                        disabled={canvasData.length >= 10}
                        onClick={() => {
                            let currentIndex = canvasData.length;
                            canvasData.push('');
                            setCanvasData(canvasData);
                            setCanvasDataIndex(currentIndex);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                    </button>
                    <button
                        className={classNames(
                            'px-4 py-2 text-sm font-medium bg-white !disabled:hover:bg-primary-1-hover grow disabled:opacity-50 text-red-600',
                        )}
                        disabled={canvasData.length <= 1}
                        onClick={() => {
                            // Remove canvas data
                            canvasData.splice(canvasDataIndex, 1);
                            // Set index
                            let currentIndex = canvasDataIndex - 1;
                            if (currentIndex < 0) {
                                currentIndex = 0;
                            }
                            setCanvasDataIndex(currentIndex);
                            // Load canvas data
                            if (canvasRef != null && canvasRef.current != null) {
                                canvasRef.current.setJson(canvasData[currentIndex]);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4 transform rotate-45" />
                    </button>
                </div>
            </div>
            <Canvas
                ref={canvasRef}
                initZoom={0.8}
                onCanvasChange={(canvas) => {
                    canvasData[canvasDataIndex] = canvas;
                    setCanvasData(canvasData);
                    if (props.onChange) {
                        props.onChange(canvasData);
                    }
                }}
            />
        </div>
    </>;
});


MultipleCanvas.displayName = "MultipleCanvas";

export default MultipleCanvas;