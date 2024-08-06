import React, { ReactElement, RefAttributes, ForwardRefRenderFunction, forwardRef, useState, useEffect, useImperativeHandle, Ref, useRef } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/pro-regular-svg-icons";
import * as fabric from 'fabric'
import { v4 as uuidv4 } from "uuid";
import { faDownload, faEmptySet, faPen, faTrash, faArrowsToDot, faCropSimple, faExpand, faImage, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faClipboard } from "@fortawesome/pro-solid-svg-icons";
import FlipIcon from '@mui/icons-material/Flip';
import Arrow from "./assets/canvas/Arrow.png";
import Check from "./assets/canvas/Check.png";
import Deny from "./assets/canvas/Deny.png";
import QuestionMark from "./assets/canvas/QuestionMark.png";
import ExclamationMark from "./assets/canvas/ExclamationMark.png";
import { StaticImageData } from "next/image";
import { Tooltip } from "react-tooltip";
import Resizer from "@/helpers/base/resizer";

interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    init_zoom?: number
    getCanvas?: () => fabric.Canvas | null
    getJson?: () => string
    setJson?: (json: string) => void
    onCanvasChange?: (json: string) => void
}
type CanvasType = {
    getCanvas: () => fabric.Canvas | null
    getJson: () => string
    setJson: (json: string) => void
}
const Canvas = forwardRef<CanvasType, CanvasProps>(function Canvas (props, ref) {

    // UUID
    const id = useRef<string | null>(null);
    const { className, ...restProps } = props;

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [drawingMode, setDrawingMode] = useState<boolean>(false);
    const [showDropEvent, setShowDropEvent] = useState<boolean>(false);
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(props.init_zoom || 1);

    // Timer to trigger onCanvasChange
    const [onCanvasChangeTimer, setOnCanvasChangeTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {

        // Generate UUID
        id.current = uuidv4();
        console.log(`[Canvas - ${id.current}] Mounted. Initializing...`)

        let canvas = new fabric.Canvas('canvas', {
            backgroundColor: 'white',
            selection: true,
        })

        window.addEventListener('resize', resizeCanvas, false);

        function resizeCanvas () {
            //canvas.setHeight(document.getElementById("canvas-container")!.clientHeight);
            //canvas.setWidth(document.getElementById("canvas-container")!.clientWidth);
            canvas.setHeight(400)
            canvas.setWidth(600)
        }
        resizeCanvas();

        canvas.isDrawingMode = true;

        var brush = canvas.freeDrawingBrush;
        if (brush) {
            brush.color = "#000000"
            brush.width = 5;
        }

        // Set value timer based to prevent ctx error
        let timer: NodeJS.Timeout;
        let value = props.value;
        if (value) {
            timer = setTimeout(() => {
                canvas.loadFromJSON(value === '' ? '{}' : value, () => {
                    canvas.renderAll();
                });
            }, 0);
        }

        setCanvas(canvas);

        return () => {

            console.log(`[Canvas - ${id.current}] Dismounted. Cleaning up...`)

            if (canvas) canvas.dispose();
            window.removeEventListener('resize', resizeCanvas, false);
            clearTimeout(timer);

            // Clear timer
            if (onCanvasChangeTimer) clearTimeout(onCanvasChangeTimer);
        };
    }, []);

    // Update when value changes
    useEffect(() => {
        if (canvas) {
            console.log(`Canvas value changed to ${props.value}`)
            // Use timer
            setTimeout(() => {
                canvas.loadFromJSON((props.value === '' ? '{}' : props.value) as any, () => {
                    canvas.renderAll();
                });
            }, 0);
        }
    }, [props.value]);

    useEffect(() => {
        if (canvas) {
            canvas.isDrawingMode = drawingMode;
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
                        // Resize before adding
                        const image = new Promise<File>((resolve, reject) => {
                            Resizer.imageFileResizer(
                                file,
                                512,
                                512,
                                'JPEG',
                                80,
                                0,
                                (uri: any) => {
                                    const file = new File([uri], "image.jpg", { type: "image/jpeg" });
                                    resolve(file);
                                },
                                "blob",
                                200,
                                200
                            );
                        });
                        image.then((file) => {
                            console.log(file);
                            const reader = new FileReader();
                            reader.onload = function () {
                                const img = new Image();
                                img.src = reader.result as string;
                                img.onload = function () {
                                    const imgInstance = new fabric.Image(img, {
                                        left: canvas!.getWidth() / 2,
                                        top: canvas!.getHeight() / 2,
                                        originX: 'center',
                                        originY: 'center',
                                    });
                                    objectToCanvasSize(imgInstance, 'contain');
                                    canvas!.add(imgInstance);
                                    canvas!.renderAll();
                                }
                            }
                            reader.readAsDataURL(file);
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
                // Clear timer
                if (onCanvasChangeTimer) clearTimeout(onCanvasChangeTimer);
                // Set timer
                setOnCanvasChangeTimer(setTimeout(() => {
                    console.log(`[Canvas - ${id.current}] Object modified`)
                    let json = JSON.stringify(canvas!.toJSON());
                    if (props.onCanvasChange) props.onCanvasChange(json);
                }, 0));
                // Render
                canvas!.renderAll();
            });
            canvas.on('object:added', (e) => {
                // Clear timer
                if (onCanvasChangeTimer) clearTimeout(onCanvasChangeTimer);
                // Set timer
                setOnCanvasChangeTimer(setTimeout(() => {
                    console.log(`[Canvas - ${id.current}] Object added`)
                    let json = JSON.stringify(canvas!.toJSON());
                    if (props.onCanvasChange) props.onCanvasChange(json);
                }, 0));
                // Render
                canvas!.renderAll();
            });
            canvas.on('object:removed', (e) => {
                // Clear timer
                if (onCanvasChangeTimer) clearTimeout(onCanvasChangeTimer);
                // Set timer
                setOnCanvasChangeTimer(setTimeout(() => {
                    console.log(`[Canvas - ${id.current}] Object removed`)
                    let json = JSON.stringify(canvas!.toJSON());
                    if (props.onCanvasChange) props.onCanvasChange(json);
                }, 0));
                // Render
                canvas!.renderAll();
            });
        }

        return () => {
            if (canvas) {
                canvas.off('object:modified');
                canvas.off('object:added');
                canvas.off('object:removed');
            }
        }
    }, [canvas, props.onCanvasChange]);

    // getCanvas, getJson, setJson, ...
    useImperativeHandle(ref, () => ({
        getCanvas: () => {
            return canvas;
        },
        getJson: () => {
            if (canvas) {
                return JSON.stringify(canvas.toJSON());
            }
            return '';
        },
        setJson: (json: string) => {
            if (canvas) {
                canvas.loadFromJSON(json === '' ? '{}' : json, () => {
                    canvas.renderAll();
                });
            }
        },
    }));

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
        // Render
        canvas!.renderAll();
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
        canvas!.setActiveObject(text);
        canvas!.renderAll();
    }

    function saveAsImage () {
        let dataURL = canvas!.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1,
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

    async function addAsset (asset: string) {
        console.log(`Canvas - ${id.current} - Adding asset: ${asset}`)
        //@ts-ignore
        /*fabric.FabricImage.fromURL(asset, (img) => {
            console.log(`Canvas - ${id.current} - Asset added: ${asset}`)
            img.set({
                // Center image
                left: canvas!.getWidth() / 2,
                top: canvas!.getHeight() / 2,
                originX: 'center',
                originY: 'center',
            });

            objectToCanvasSize(img, 'contain', 0.5);

            canvas!.add(img);
            canvas!.setActiveObject(img);
            canvas!.renderAll();
        })*/
       const img = await fabric.FabricImage.fromURL(asset);
       console.log(`Canvas - ${id.current} - Asset added: ${asset}`)
            img.set({
                // Center image
                left: canvas!.getWidth() / 2,
                top: canvas!.getHeight() / 2,
                originX: 'center',
                originY: 'center',
            });

            objectToCanvasSize(img, 'contain', 0.5);

            canvas!.add(img);
            canvas!.setActiveObject(img);
            canvas!.renderAll();
    }

    function centerSelected () {
        let activeObject = canvas!.getActiveObject();
        if (activeObject) {
            activeObject.setX(canvas!.getWidth() / 2);
            activeObject.setY(canvas!.getHeight() / 2);
            canvas!.renderAll();
        }
    }

    function objectToCanvasSize (object: fabric.Object, objectFit: 'contain' | 'cover' | 'fill', scale: number = 1) {
        let canvasWidth = canvas!.getWidth();
        let canvasHeight = canvas!.getHeight();
        let objectWidth = object.getScaledWidth();
        let objectHeight = object.getScaledHeight();

        let scaleWidth = canvasWidth / objectWidth;
        let scaleHeight = canvasHeight / objectHeight;

        let applyScale = 0;
        if (objectFit === 'contain') {
            applyScale = Math.min(scaleWidth, scaleHeight);
        } else if (objectFit === 'cover') {
            applyScale = Math.max(scaleWidth, scaleHeight);
        } else if (objectFit === 'fill') {
            applyScale = Math.min(scaleWidth, scaleHeight);
        }

        object.scaleToWidth(objectWidth * applyScale * scale);
        object.scaleToHeight(objectHeight * applyScale * scale);
        object.setX(canvas!.getWidth() / 2);
        object.setY(canvas!.getHeight() / 2);
        canvas!.renderAll();
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
        if(brush) brush.width = width;
    }

    function switchPencilColor (color: string) {
        let brush = canvas!.freeDrawingBrush;
        if(brush) brush.color = color;
    }

    function uploadImage () {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = function () {
            // Get image, resize using Resizer, then add to canvas
            const file = input.files![0];
            const reader = new FileReader();
            reader.onload = function () {
                // Resize before adding
                const image = new Promise<File>((resolve, reject) => {
                    Resizer.imageFileResizer(
                        file,
                        512,
                        512,
                        'JPEG',
                        80,
                        0,
                        (uri: any) => {
                            const file = new File([uri], "image.jpg", { type: "image/jpeg" });
                            resolve(file);
                        },
                        "blob",
                        200,
                        200
                    );
                });
                image.then((file) => {
                    console.log(file);
                    const reader = new FileReader();
                    reader.onload = function () {
                        const img = new Image();
                        img.src = reader.result as string;
                        img.onload = function () {
                            const imgInstance = new fabric.Image(img, {
                                left: canvas!.getWidth() / 2,
                                top: canvas!.getHeight() / 2,
                                originX: 'center',
                                originY: 'center',
                            });
                            objectToCanvasSize(imgInstance, 'contain');
                            canvas!.add(imgInstance);
                            canvas!.renderAll();
                        }
                    }
                    reader.readAsDataURL(file);
                })
            }
            reader.readAsDataURL(file);
        }
    }

    function insertFromClipboard () {
        navigator.clipboard.read().then((data) => {
            data.forEach(async (item) => {
                // Valid is png, jpeg, jpg
                if (item.types.includes('image/png') || item.types.includes('image/jpeg') || item.types.includes('image/jpg')) {
                    item.getType('image/png').then((blob) => {
                        if (!blob) return;
                        // Resize before adding
                        const image = new Promise<File>((resolve, reject) => {
                            Resizer.imageFileResizer(
                                blob,
                                512,
                                512,
                                'JPEG',
                                80,
                                0,
                                (uri: any) => {
                                    const file = new File([uri], "image.jpg", { type: "image/jpeg" });
                                    resolve(file);
                                },
                                "blob",
                                200,
                                200
                            );
                        });
                        image.then((file) => {
                            console.log(file);
                            const reader = new FileReader();
                            reader.onload = function () {
                                const img = new Image();
                                img.src = reader.result as string;
                                img.onload = function () {
                                    const imgInstance = new fabric.Image(img, {
                                        left: canvas!.getWidth() / 2,
                                        top: canvas!.getHeight() / 2,
                                        originX: 'center',
                                        originY: 'center',
                                    });
                                    objectToCanvasSize(imgInstance, 'contain');
                                    canvas!.add(imgInstance);
                                    canvas!.renderAll();
                                }
                            }
                            reader.readAsDataURL(file);
                        });
                    });
                }
            });
        });
    }

    return <>
        <div
            className={classNames(
                fullscreen ? "fixed top-0 left-0 w-screen h-screen z-50" : "",
                !fullscreen ? "relative w-full h-full" : "",
            )}
            {...restProps}
        >
            <div
                className={classNames(
                    fullscreen ? "bg-white absolute top-0 left-0 w-full h-full -z-10 opacity-90" : "",
                )}
            />
            <div
                className={classNames(
                    "flex flex-col justify-center items-center w-full h-full",
                    fullscreen ? "p-14" : "",
                    className
                )}
                {...restProps}
            >
                <div
                    className={classNames(
                        "flex flex-col justify-center items-center w-full h-full border-2 border-gray-300 rounded-md bg-white",
                    )}
                >
                    {/* Toolbar */}
                    <div
                        className="flex flex-row justify-start items-center w-full h-8 border-b-2 border-gray-300"
                    >
                        <Tooltip
                            id={`canvas-tooltip-drawing-mode-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Drawing mode"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-drawing-mode-${id.current}`}
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
                                <Tooltip
                                    id={`canvas-tooltip-delete-selected-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Delete selected"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-delete-selected-${id.current}`}
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={drawingMode || !canvas}
                                    onClick={() => { deleteSelected() }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>

                                {/* Flip vertical */}
                                <Tooltip
                                    id={`canvas-tooltip-flip-vertical-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Flip Vertical"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-flip-vertical-${id.current}`}
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={drawingMode || !canvas}
                                    onClick={() => { flipVertical() }}
                                >
                                    <FlipIcon style={{ transform: "rotate(90deg)" }} className="p-1" />
                                </button>

                                {/* Flip horizontal */}
                                <Tooltip
                                    id={`canvas-tooltip-flip-horizontal-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Flip Horizontal"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-flip-horizontal-${id.current}`}
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={drawingMode || !canvas}
                                    onClick={() => { flipHorizontal() }}
                                >
                                    <FlipIcon className="p-1" />
                                </button>

                                {/* Center */}
                                <Tooltip
                                    id={`canvas-tooltip-center-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Center"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-center-${id.current}`}
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={drawingMode || !canvas}
                                    onClick={() => { centerSelected() }}
                                >
                                    <FontAwesomeIcon icon={faArrowsToDot} />
                                </button>

                                {/* To canvas size */}
                                <Tooltip
                                    id={`canvas-tooltip-contain-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Contain"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-contain-${id.current}`}
                                    className={classNames(
                                        "px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 text-sm",
                                    )}
                                    disabled={drawingMode || !canvas}
                                    onClick={() => { selectedToCanvasSize('contain') }}
                                >
                                    <FontAwesomeIcon icon={faCropSimple} />
                                </button>
                            </>
                        }

                        <div className="flex-grow min-w-[10px]"></div>

                        <Tooltip
                            id={`canvas-tooltip-zoom-out-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Zoom Out"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-zoom-out-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm disabled:bg-gray-100 disabled:text-gray-500",
                            )}
                            disabled={zoom <= 0.2}
                            onClick={() => { setZoom(zoom - 0.1) }}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                        </button>

                        <Tooltip
                            id={`canvas-tooltip-zoom-in-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Zoom In"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-zoom-in-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm disabled:bg-gray-100 disabled:text-gray-500",
                            )}
                            disabled={zoom >= 2}
                            onClick={() => { setZoom(zoom + 0.1) }}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                        </button>

                        <Tooltip
                            id={`canvas-tooltip-upload-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Import an image"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-upload-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                            )}
                            onClick={() => { uploadImage() }}
                        >
                            <FontAwesomeIcon icon={faImage} />
                        </button>

                        <Tooltip
                            id={`canvas-tooltip-from-clipboard-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Insert from clipboard"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-from-clipboard-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                            )}
                            onClick={() => { insertFromClipboard() }}
                        >
                            <FontAwesomeIcon icon={faClipboard} />
                        </button>

                        <Tooltip
                            id={`canvas-tooltip-clear-json-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Clear Canvas"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-clear-json-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                            )}
                            onClick={() => {
                                // Clear
                                canvas!.clear()
                                // Reset background color
                                canvas!.backgroundColor = 'white'
                            }}
                        >
                            <FontAwesomeIcon icon={faEmptySet} />
                        </button>

                        <Tooltip
                            id={`canvas-tooltip-save-json-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Save as JSON"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-save-json-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                            )}
                            onClick={() => { saveAsImage() }}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                        </button>

                        {/* Fullscreen */}
                        <Tooltip
                            id={`canvas-tooltip-fullscreen-${id.current}`}
                            place="top"
                            border={'1px solid #2d3748'}
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                borderRadius: '0.25rem',
                            }}
                            content="Fullscreen"
                        />
                        <button
                            data-tooltip-id={`canvas-tooltip-fullscreen-${id.current}`}
                            className={classNames(
                                "px-2 py-1 h-full border-l-2 border-gray-300 hover:bg-gray-100 text-sm",
                            )}
                            onClick={() => { setFullscreen(!fullscreen) }}
                        >
                            <FontAwesomeIcon icon={faExpand} />
                        </button>
                    </div>

                    <div
                        className="flex flex-row justify-start items-center w-full h-8 border-b-2 border-gray-300"
                    >
                        {!drawingMode &&
                            <div
                                className="flex flex-row items-center"
                            >
                                <Tooltip
                                    id={`canvas-tooltip-text-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Text"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-text-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addText() }}
                                >
                                    <FontAwesomeIcon icon={faSignature} />
                                </button>

                                <Tooltip
                                    id={`canvas-tooltip-arrow-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Arrow"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-arrow-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addAsset(Arrow) }}
                                >
                                    <img src={Arrow} className="h-4 w-4 object-contain" alt="" />
                                </button>

                                <Tooltip
                                    id={`canvas-tooltip-check-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Check"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-check-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addAsset(Check) }}
                                >
                                    <img src={Check} className="h-4 w-4 object-contain" alt="" />
                                </button>

                                <Tooltip
                                    id={`canvas-tooltip-deny-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Deny"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-deny-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addAsset(Deny) }}
                                >
                                    <img src={Deny} className="h-4 w-4 object-contain" alt="" />
                                </button>

                                <Tooltip
                                    id={`canvas-tooltip-question-mark-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Question Mark"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-question-mark-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addAsset(QuestionMark) }}
                                >
                                    <img src={QuestionMark} className="h-4 w-4 object-contain" alt="" />
                                </button>

                                <Tooltip
                                    id={`canvas-tooltip-exclamation-mark-${id.current}`}
                                    place="top"
                                    border={'1px solid #2d3748'}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '0.25rem',
                                    }}
                                    content="Exclamation Mark"
                                />
                                <button
                                    data-tooltip-id={`canvas-tooltip-exclamation-mark-${id.current}`}
                                    className="px-2 py-1 h-full border-r-2 border-gray-300 hover:bg-gray-100 flex flex-row items-center"
                                    onClick={() => { addAsset(ExclamationMark) }}
                                >
                                    <img src={ExclamationMark} className="h-4 w-4 object-contain" alt="" />
                                </button>
                            </div>
                        }
                        {drawingMode &&
                            <>
                                <div
                                    className="flex flex-row items-center"
                                >
                                    <Tooltip
                                        id={`canvas-tooltip-pencil-1-${id.current}`}
                                        place="top"
                                        border={'1px solid #2d3748'}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            borderRadius: '0.25rem',
                                        }}
                                        content="Pencil width 1"
                                    />
                                    <button
                                        data-tooltip-id={`canvas-tooltip-pencil-1-${id.current}`}
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

                                    <Tooltip
                                        id={`canvas-tooltip-pencil-10-${id.current}`}
                                        place="top"
                                        border={'1px solid #2d3748'}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            borderRadius: '0.25rem',
                                        }}
                                        content="Pencil width 10"
                                    />
                                    <button
                                        data-tooltip-id={`canvas-tooltip-pencil-10-${id.current}`}
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

                                    <Tooltip
                                        id={`canvas-tooltip-pencil-15-${id.current}`}
                                        place="top"
                                        border={'1px solid #2d3748'}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            borderRadius: '0.25rem',
                                        }}
                                        content="Pencil width 15"
                                    />
                                    <button
                                        data-tooltip-id={`canvas-tooltip-pencil-15-${id.current}`}
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

                                <div className="flex-grow min-w-[10px]"></div>

                                <div
                                    className="flex flex-row items-center"
                                >
                                    <Tooltip
                                        id={`canvas-tooltip-black-${id.current}`}
                                        place="top"
                                        border={'1px solid #2d3748'}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            borderRadius: '0.25rem',
                                        }}
                                        content="Black"
                                    />
                                    <button
                                        data-tooltip-id={`canvas-tooltip-black-${id.current}`}
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

                                    <Tooltip
                                        id={`canvas-tooltip-white-${id.current}`}
                                        place="top"
                                        border={'1px solid #2d3748'}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            borderRadius: '0.25rem',
                                        }}
                                        content="White"
                                    />
                                    <button
                                        data-tooltip-id={`canvas-tooltip-white-${id.current}`}
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

                                        <Tooltip
                                            id={`canvas-tooltip-warning-${id.current}`}
                                            place="top"
                                            border={'1px solid #2d3748'}
                                            style={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                borderRadius: '0.25rem',
                                            }}
                                            content="Warning"
                                        />
                                        <button
                                            data-tooltip-id={`canvas-tooltip-warning-${id.current}`}
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

                                        <Tooltip
                                            id={`canvas-tooltip-danger-${id.current}`}
                                            place="top"
                                            border={'1px solid #2d3748'}
                                            style={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                borderRadius: '0.25rem',
                                            }}
                                            content="Danger"
                                        />
                                        <button
                                            data-tooltip-id={`canvas-tooltip-danger-${id.current}`}
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

                                        <Tooltip
                                            id={`canvas-tooltip-success-${id.current}`}
                                            place="top"
                                            border={'1px solid #2d3748'}
                                            style={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                borderRadius: '0.25rem',
                                            }}
                                            content="Success"
                                        />
                                        <button
                                            data-tooltip-id={`canvas-tooltip-success-${id.current}`}
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

                                        <Tooltip
                                            id={`canvas-tooltip-primary-${id.current}`}
                                            place="top"
                                            border={'1px solid #2d3748'}
                                            style={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                borderRadius: '0.25rem',
                                            }}
                                            content="Primary"
                                        />
                                        <button
                                            data-tooltip-id={`canvas-tooltip-primary-${id.current}`}
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
                    </div>

                    {/* Canvas */}
                    <div
                        id="canvas-container"
                        className={classNames(
                            "relative overflow-scroll flex-grow flex flex-col justify-center items-center w-full bg-gray-200",
                            fullscreen ? "flex-grow" : "h-80",
                        )}
                    >
                        <div
                            style={{
                                width: '600px',
                                height: '400px',
                                backgroundColor: 'white',
                                transform: `scale(${zoom})`,
                            }}
                        >
                            <canvas
                                id="canvas"
                            />
                        </div>
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
                </div>
            </div>
        </div>
    </>;
});


Canvas.displayName = "Canvas";

export default Canvas;
export type { CanvasType };