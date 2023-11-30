import React, { ReactElement, RefAttributes, ForwardRefRenderFunction, forwardRef, useState, useEffect } from "react";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/pro-regular-svg-icons";
import { fabric } from 'fabric';
import { faDownload, faEmptySet, faPen, faTrash, faArrowsToDot, faUpload } from "@fortawesome/pro-solid-svg-icons";
import FlipIcon from '@mui/icons-material/Flip';
import Arrow from "./assets/canvas/Arrow.png";
import Check from "./assets/canvas/Check.png";
import Deny from "./assets/canvas/Deny.png";
import QuestionMark from "./assets/canvas/QuestionMark.png";
import ExclamationMark from "./assets/canvas/ExclamationMark.png";

/*
    Canvas to "draw" on
    You can drag and drop images from the sidebar to the canvas or via the file explorer
    You can add shapes to the canvas via the sidebar
    You can add text to the canvas via the sidebar
    You can select objects on the canvas and move them around
    You can resize objects on the canvas
    You can rotate objects on the canvas
    You can delete objects on the canvas
    You can undo/redo actions (Optional)
    You can save the canvas as an image
    You can save the canvas as a JSON file
    You can load a JSON file to the canvas
    You can clear the canvas
    You can resize an element to fit the canvas

    Top will have the toolbar and left side will have the quick access sidebar
*/
interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
    canvasRef?: React.Ref<HTMLDivElement>
    value?: string
    onCanvasChange?: (json: string) => void
}
const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas (props, ref) {

    const { className, ...restProps } = props;

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [drawingMode, setDrawingMode] = useState<boolean>(false);
    const [showDropEvent, setShowDropEvent] = useState<boolean>(false);

    useEffect(() => {

        let canvas = new fabric.Canvas('canvas', {
            backgroundColor: 'white',
            selection: true,
        })

        window.addEventListener('resize', resizeCanvas, false);

        function resizeCanvas () {
            canvas.setHeight(document.getElementById("canvas-container")!.clientHeight);
            canvas.setWidth(document.getElementById("canvas-container")!.clientWidth);
        }
        resizeCanvas();

        canvas.isDrawingMode = true;

        var brush = canvas.freeDrawingBrush;
        brush.color = "#000000"
        brush.width = 5;

        // Set value timer based to prevent ctx error
        let timer: NodeJS.Timeout;
        let value = props.value;
        if (value) {
            timer = setTimeout(() => {
                canvas.loadFromJSON(value, () => {
                    canvas.renderAll();
                });
            }, 0);
        }

        setCanvas(canvas);

        return () => {
            if (canvas) canvas.dispose();
            window.removeEventListener('resize', resizeCanvas, false);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.isDrawingMode = drawingMode;
            console.log(canvas.isDrawingMode);
        }
    }, [canvas, drawingMode]);

    /* Remove selected element on "del" key press */
    useEffect(() => {
        if (canvas) {
            // Keypress event listener
            window.addEventListener('keydown', (e) => {
                if (e.key === "Delete") {
                    let activeObject = canvas.getActiveObjects();
                    if (activeObject) {
                        activeObject.forEach((obj) => {
                            canvas!.remove(obj);
                        });
                        // Deselct all objects
                        canvas!.discardActiveObject();
                    }
                }
            });

            // Drag and drop event listener
            //let canvasContainer = document.getElementById("canvas-drop")!;
            let canvasContainer = document.getElementById("canvas-container")!;
            canvasContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            canvasContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                setShowDropEvent(false);
                let files = e.dataTransfer!.files;
                if (files.length > 0) {
                    let file = files[0];
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        let dataURL = e.target!.result;
                        console.log(dataURL);
                        fabric.Image.fromURL(dataURL as string, (img) => {
                            img.set({
                                // Center image
                                left: canvas!.getWidth() / 2,
                                top: canvas!.getHeight() / 2,
                                originX: 'center',
                                originY: 'center',
                            });

                            objectToCanvasSize(img, 'contain');

                            canvas!.add(img);
                        });
                    }
                    reader.readAsDataURL(file);
                }
            });
            canvasContainer.addEventListener('dragenter', (e) => {
                e.preventDefault();
                setShowDropEvent(true);
            })
            canvasContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                setShowDropEvent(false);
            })
        }
    }, [canvas]);

    /* Remove elements outside of canvas */
    useEffect(() => {
        if (canvas) {
            canvas.on('object:modified', (e) => {
                let obj = e.target;
                if (obj) {
                    let boundingRect = obj.getBoundingRect();
                    if (boundingRect.left + boundingRect.width - 10 < 0 || boundingRect.left + 10 > canvas!.getWidth() || boundingRect.top + boundingRect.height - 10 < 0 || boundingRect.top + 10 > canvas!.getHeight()) {
                        console.log("Object outside of canvas");
                        canvas.remove(obj);
                    }
                }
            });
        }
    }, [canvas]);

    /* Update JSON */
    useEffect(() => {
        if (canvas) {
            canvas.on('object:modified', (e) => {
                let json = JSON.stringify(canvas!.toJSON());
                if (props.onCanvasChange) props.onCanvasChange(json);
            });
            canvas.on('object:added', (e) => {
                let json = JSON.stringify(canvas!.toJSON());
                if (props.onCanvasChange) props.onCanvasChange(json);
            });
            canvas.on('object:removed', (e) => {
                let json = JSON.stringify(canvas!.toJSON());
                if (props.onCanvasChange) props.onCanvasChange(json);
            });
        }
    }, [canvas, props.onCanvasChange]);

    function deleteSelected () {
        // Get active group
        let activeGroup = canvas!.getActiveObjects();
        // If group is not empty, remove all objects
        if (activeGroup) {
            activeGroup.forEach((obj) => {
                canvas!.remove(obj);
            });
        }
        // Deselct all objects
        canvas!.discardActiveObject();
    }

    function addText () {
        let centerX = canvas!.getWidth() / 2;
        let centerY = canvas!.getHeight() / 2;
        let text = new fabric.IText('New Text', {
            left: centerX,
            top: centerY,
            fontFamily: 'arial',
            fill: '#000000',
            fontSize: 20,
            fontWeight: 'normal',
            originX: 'center',
            originY: 'center',
        });
        canvas!.add(text);
    }

    function saveAsImage () {
        let dataURL = canvas!.toDataURL({
            format: 'png',
            quality: 1,
        });
        let link = document.createElement('a');
        link.download = 'image.png';
        link.href = dataURL;
        link.click();
    }

    function saveAsJSON () {
        let json = JSON.stringify(canvas!.toJSON());
        let blob = new Blob([json], { type: 'application/json' });
        let link = document.createElement('a');
        link.download = 'canvas.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    function selectedToCanvasSize (objectFit: 'contain' | 'cover' | 'fill') {
        let activeObject = canvas!.getActiveObject();
        if (activeObject) {
            objectToCanvasSize(activeObject, objectFit);
        }
    }

    function addAsset (asset: string) {
        fabric.Image.fromURL(asset, (img) => {
            img.set({
                // Center image
                left: canvas!.getWidth() / 2,
                top: canvas!.getHeight() / 2,
                originX: 'center',
                originY: 'center',
            });

            objectToCanvasSize(img, 'contain', 0.5);

            canvas!.add(img);
        });
    }

    function centerSelected () {
        let activeObject = canvas!.getActiveObject();
        if (activeObject) {
            activeObject.center();
            canvas!.renderAll();
        }
    }

    function objectToCanvasSize (object: fabric.Object, objectFit: 'contain' | 'cover' | 'fill', scale: number = 1) {
        let boundingRect = object.getBoundingRect();
        let canvasWidth = canvas!.getWidth();
        let canvasHeight = canvas!.getHeight();
        let scaleX = canvasWidth / boundingRect.width;
        let scaleY = canvasHeight / boundingRect.height;
        let canvasScale = 1;
        if (objectFit === 'contain') {
            canvasScale = Math.min(scaleX, scaleY);
        } else if (objectFit === 'cover') {
            canvasScale = Math.max(scaleX, scaleY);
        } else if (objectFit === 'fill') {
            canvasScale = Math.max(scaleX, scaleY);
        }
        // Apply scale
        scale = canvasScale * scale;
        object.scale(scale);
    }

    function flipVertical () {
        let activeObject = canvas!.getActiveObject();
        if (activeObject) {
            activeObject.set({
                flipY: !activeObject.flipY,
            });
            canvas!.renderAll();
        }
    }

    function flipHorizontal () {
        let activeObject = canvas!.getActiveObject();
        if (activeObject) {
            activeObject.set({
                flipX: !activeObject.flipX,
            });
            canvas!.renderAll();
        }
    }

    function switchPencilWidth (width: number) {
        let brush = canvas!.freeDrawingBrush;
        brush.width = width;
    }

    function switchPencilColor (color: string) {
        let brush = canvas!.freeDrawingBrush;
        brush.color = color;
    }

    function uploadImage(){
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = function() {
            const file = input.files![0];
            const reader = new FileReader();
            reader.onload = function() {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = function() {
                    const imgInstance = new fabric.Image(img, {
                        left: canvas!.getWidth() / 2,
                        top: canvas!.getHeight() / 2,
                        originX: 'center',
                        originY: 'center',
                    });
                    canvas!.add(imgInstance);
                }
            }
            reader.readAsDataURL(file);
        }
    }

    return <>
        <div
            className={classNames(
                "flex-col justify-center items-center w-full h-full border-2 border-gray-300 rounded-md",
                className
            )}
            {...restProps}
        >
            {/* Toolbar */}
            <div
                className="flex flex-row justify-start items-center w-full h-8 border-b-2 border-gray-300"
            >
                <button
                    className={classNames(
                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 text-sm",
                        {
                            "bg-primary-1 text-primary-1-text hover:bg-primary-1-hover": drawingMode,
                        }
                    )}
                    onClick={() => { setDrawingMode(!drawingMode) }}
                >
                    <FontAwesomeIcon icon={faPen} />
                </button>
                {!drawingMode &&
                    <>
                        <button
                            className={classNames(
                                "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                            )}
                            disabled={drawingMode || !canvas}
                            onClick={() => { deleteSelected() }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        {/* Flip vertical */}
                        <button
                            className={classNames(
                                "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                            )}
                            disabled={drawingMode || !canvas}
                            onClick={() => { flipVertical() }}
                        >
                            <FlipIcon style={{ transform: "rotate(90deg)" }} className="p-1" />
                        </button>
                        {/* Flip horizontal */}
                        <button
                            className={classNames(
                                "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                            )}
                            disabled={drawingMode || !canvas}
                            onClick={() => { flipHorizontal() }}
                        >
                            <FlipIcon className="p-1" />
                        </button>
                        {/* Center */}
                        <button
                            className={classNames(
                                "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                            )}
                            disabled={drawingMode || !canvas}
                            onClick={() => { centerSelected() }}
                        >
                            <FontAwesomeIcon icon={faArrowsToDot} />
                        </button>
                    </>
                }
                {drawingMode &&
                    <>
                        <div
                            className="flex flex-row items-center"
                        >
                            <button
                                className={classNames(
                                    "px-2 py-1 border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                )}
                                disabled={!drawingMode || !canvas}
                                onClick={() => { switchPencilWidth(5) }}
                            >
                                <div
                                    className={classNames(
                                        "w-2 h-2 rounded-full bg-black",
                                    )}
                                />
                            </button>
                            <button
                                className={classNames(
                                    "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                )}
                                disabled={!drawingMode || !canvas}
                                onClick={() => { switchPencilWidth(10) }}
                            >
                                <div
                                    className={classNames(
                                        "w-4 h-4 rounded-full bg-black",
                                    )}
                                />
                            </button>
                            <button
                                className={classNames(
                                    "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                )}
                                disabled={!drawingMode || !canvas}
                                onClick={() => { switchPencilWidth(15) }}
                            >
                                <div
                                    className={classNames(
                                        "w-6 h-6 rounded-full bg-black",
                                    )}
                                />
                            </button>
                        </div>
                        <div
                            className="flex flex-row items-center"
                        >
                            <button
                                className={classNames(
                                    "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                )}
                                disabled={!drawingMode || !canvas}
                                onClick={() => { switchPencilColor("#000000") }}
                            >
                                <div
                                    className={classNames(
                                        "w-4 h-4 rounded-full bg-black",
                                    )}
                                />
                            </button>
                            <button
                                className={classNames(
                                    "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                )}
                                disabled={!drawingMode || !canvas}
                                onClick={() => { switchPencilColor("#ffffff") }}
                            >
                                <div
                                    className={classNames(
                                        "w-4 h-4 rounded-full bg-white border-2 border-gray-300",
                                    )}
                                />
                            </button>
                            {/* Default colors - Warn, Success, Primary, Danger */}
                            <div
                                className="flex flex-row items-center"
                            >
                                <button
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={!drawingMode || !canvas}
                                    onClick={() => { switchPencilColor("#f59e0b") }}
                                >
                                    <div
                                        className={classNames(
                                            "w-4 h-4 rounded-full bg-[#f59e0b]",
                                        )}
                                    />
                                </button>
                                <button
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={!drawingMode || !canvas}
                                    onClick={() => { switchPencilColor("#d9463e") }}
                                >
                                    <div
                                        className={classNames(
                                            "w-4 h-4 rounded-full bg-[#d9463e]",
                                        )}
                                    />
                                </button>
                                <button
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={!drawingMode || !canvas}
                                    onClick={() => { switchPencilColor("#2da44e") }}
                                >
                                    <div
                                        className={classNames(
                                            "w-4 h-4 rounded-full bg-[#2da44e]",
                                        )}
                                    />
                                </button>
                                <button
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={!drawingMode || !canvas}
                                    onClick={() => { switchPencilColor("#3b82f6") }}
                                >
                                    <div
                                        className={classNames(
                                            "w-4 h-4 rounded-full bg-[#3b82f6]",
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                }
                <div className="flex-grow min-w-[10px]"></div>
                <button
                    className={classNames(
                        "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                    )}
                    onClick={() => { uploadImage() }}
                >
                    <FontAwesomeIcon icon={faUpload} />
                    <span className="ml-2">Upload</span>
                </button>
                <button
                    className={classNames(
                        "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                    )}
                    onClick={() => { canvas!.clear() }}
                >
                    <FontAwesomeIcon icon={faEmptySet} />
                    <span className="ml-2">Clear</span>
                </button>
                <button
                    className={classNames(
                        "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                    )}
                    onClick={() => { saveAsImage() }}
                >
                    <FontAwesomeIcon icon={faDownload} />
                    <span className="ml-2">Save</span>
                </button>
            </div>

            {/* Canvas */}
            <div
                id="canvas-container"
                className="relative overflow-scroll flex-grow flex flex-col justify-center items-center w-full h-80"
            >
                <canvas id="canvas"
                    className={classNames(
                        "canvas grow",
                    )}
                />
                {/*<div
                    className={classNames(
                        "absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center border-2 border-gray-300",
                        {
                            "hidden": !showDropEvent,
                        }
                    )}
                />
                <div
                    id="canvas-drop"
                    className={classNames(
                        "absolute top-0 left-0 w-full h-full bg-transparent",
                    )}
                />*/}
            </div>
            {/* Sidebar */}
            <div
                className="flex flex-row h-8 border-t-2 border-gray-300"
            >
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addText() }}
                >
                    <FontAwesomeIcon icon={faSignature} />
                </button>
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addAsset(Arrow) }}
                >
                    <img src={Arrow} className="h-4 w-4 object-contain" />
                </button>
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addAsset(Check) }}
                >
                    <img src={Check} className="h-4 w-4 object-contain" />
                </button>
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addAsset(Deny) }}
                >
                    <img src={Deny} className="h-4 w-4 object-contain" />
                </button>
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addAsset(QuestionMark) }}
                >
                    <img src={QuestionMark} className="h-4 w-4 object-contain" />
                </button>
                <button
                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                    onClick={() => { addAsset(ExclamationMark) }}
                >
                    <img src={ExclamationMark} className="h-4 w-4 object-contain" />
                </button>
            </div>
        </div>
    </>;
});


Canvas.displayName = "Canvas";

export default Canvas;