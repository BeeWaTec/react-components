import React, { ReactElement, RefAttributes, ForwardRefRenderFunction, forwardRef, useState, useEffect } from "react";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/pro-regular-svg-icons";
import { fabric } from 'fabric';
import { faDownload, faEmptySet, faPen, faTrash } from "@fortawesome/pro-solid-svg-icons";

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
}
const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas (props, ref) {

    const { className, ...restProps } = props;

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [drawingMode, setDrawingMode] = useState<boolean>(false);
    const [showDropEvent, setShowDropEvent] = useState<boolean>(false);

    useEffect(() => {

        let canvas = new fabric.Canvas('canvas', {
            backgroundColor: 'white',
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
        brush.width = 20;

        setCanvas(canvas);

        return () => {
            if (canvas) canvas.dispose();
            window.removeEventListener('resize', resizeCanvas, false);
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
                    let activeObject = canvas.getActiveObject();
                    if (activeObject) {
                        canvas.remove(activeObject);
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
                                left: 0,
                                top: 0,
                                originX: 'center',
                                originY: 'center',
                            });

                            objectToCanvasSize(img, 'contain');
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

    function objectToCanvasSize (object: fabric.Object, objectFit: 'contain' | 'cover' | 'fill') {
        let boundingRect = object.getBoundingRect();
        let canvasWidth = canvas!.getWidth();
        let canvasHeight = canvas!.getHeight();
        let scaleX = canvasWidth / boundingRect.width;
        let scaleY = canvasHeight / boundingRect.height;
        let scale = 1;
        if (objectFit === 'contain') {
            scale = Math.min(scaleX, scaleY);
        } else if (objectFit === 'cover') {
            scale = Math.max(scaleX, scaleY);
        } else if (objectFit === 'fill') {
            scale = Math.max(scaleX, scaleY);
        }
        object.scale(scale);
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
                className="flex flex-row justify-start items-center w-full h-12 border-b-2 border-gray-300"
            >
                <button
                    className={classNames(
                        "px-4 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100",
                        {
                            "bg-primary-1 text-primary-1-text hover:bg-primary-1-hover": drawingMode,
                        }
                    )}
                    onClick={() => { setDrawingMode(!drawingMode) }}
                >
                    <FontAwesomeIcon icon={faPen} />
                    <span className="ml-2">Draw</span>
                </button>
                <button
                    className={classNames(
                        "px-4 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500",
                    )}
                    disabled={drawingMode || !canvas}
                    onClick={() => { deleteSelected() }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="ml-2">Trash</span>
                </button>
                <div className="flex-grow min-w-[10px]"></div>
                <button
                    className={classNames(
                        "px-4 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100",
                    )}
                    onClick={() => { canvas!.clear() }}
                >
                    <FontAwesomeIcon icon={faEmptySet} />
                    <span className="ml-2">Clear</span>
                </button>
                <button
                    className={classNames(
                        "px-4 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100",
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
                className="relative overflow-scroll flex-grow flex flex-col justify-center items-center w-full h-64"
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
                className="flex flex-row h-12 border-t-2 border-gray-300"
            >
                <button
                    className="px-4 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100"
                    onClick={() => { addText() }}
                >
                    <FontAwesomeIcon icon={faSignature} />
                    <span className="ml-2">Text</span>
                </button>
            </div>
        </div>
    </>;
});


Canvas.displayName = "Canvas";

export default Canvas;