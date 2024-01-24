import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react'
import axiosInstance from '@/helpers/base/axios'
import { toast } from 'react-toastify'
import Spinner from './spinner';
import classNames from 'classnames';
import styles from './file-upload.module.css'
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
    id?: string,
    className?: string,
    files?: File[],
    disabled?: boolean,
    style?: React.CSSProperties,
    onAdded?: (file: File) => void,
    onDeleted?: (file: File) => void,
    onChanged?: (files: File[]) => void,
    onDrop?: (files: File[]) => void,
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void,

}
const FileUpload = forwardRef(({ className, files, disabled, onAdded, onDeleted, onChanged, onDrop, onDragOver, ...props }: FileUploadProps, ref: React.Ref<HTMLDivElement>) => {

    // Create states
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>(files || []);
    const [dragging, setDragging] = useState(false);

    // Update value when props change
    useEffect(() => {
        setUploadedFiles(files || []);
    }, [files]);

    // Trigger onChanged callback when uploadedFiles change
    useEffect(() => {
        if (onChanged) {
            onChanged(uploadedFiles);
        }
    }, [uploadedFiles]);

    return (
        <div
            onFocus={() => {
                // Do nothing
            }}
            className={classNames(
                ` transition-colors`,
                'relative h-full flex flex-col items-stretch w-full',
                className,
            )}
            style={{
                // Inner border when input is focused
                ...props.style
            }}
        >
            {/* Spinner */}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <Spinner />
                </div>
            )}

            {dragging && (
                <div className="absolute inset-3 border-2 border-dashed border-gray-400 rounded-md bg-transparent" />
            )}

            {/* Dropzone */}
            <div
                className={classNames(
                    'relative flex items-center justify-center w-full h-32 cursor-pointer',
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragging(true);
                    if (onDragOver) {
                        onDragOver(e);
                    }
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragging(false);
                    if (onDrop) {
                        // Convert FileList to File[]
                        const files: File[] = [];
                        for (let i = 0; i < e.dataTransfer.files.length; i++) {
                            files.push(e.dataTransfer.files[i]);
                        }
                        onDrop(files);
                    }
                    else {
                        // Add files to uploadedFiles
                        const newFiles: File[] = [];
                        console.info(`Dropped ${e.dataTransfer.files.length} files`);
                        for (let i = 0; i < e.dataTransfer.files.length; i++) {
                            console.info(`File ${i}: ${e.dataTransfer.files[i].name}`);
                            newFiles.push(e.dataTransfer.files[i]);
                        }
                        setUploadedFiles([...uploadedFiles, ...newFiles]);
                    }
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = () => {
                        if (input.files) {
                            // Add files to uploadedFiles
                            const newFiles: File[] = [];
                            console.info(`Selected ${input.files.length} files`);
                            for (let i = 0; i < input.files.length; i++) {
                                console.info(`File ${i}: ${input.files[i].name}`);
                                newFiles.push(input.files[i]);
                            }
                            setUploadedFiles([...uploadedFiles, ...newFiles]);
                        }
                    };
                    input.click();
                }}
            >
                <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Add files</span>
                </div>
            </div>

            {/* Files */}
            {uploadedFiles.length > 0 && (
                <div className="flex flex-row flex-wrap items-center justify-start gap-2 px-2 py-1">
                    {uploadedFiles.map((file, fileIdx) => (
                        <div
                            key={fileIdx}
                            className="flex items-center justify-center px-2 py-1 bg-gray-100 rounded-md"
                        >
                            <span className="text-sm font-medium text-gray-600">{file.name}</span>
                            <button
                                type="button"
                                className="flex items-center justify-center ml-2 text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setUploadedFiles(uploadedFiles.filter((f) => f !== file));
                                    if (onDeleted) {
                                        onDeleted(file);
                                    }
                                }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
});

// Set display name
FileUpload.displayName = 'FileUpload';

export default FileUpload;
export type { FileUploadProps };