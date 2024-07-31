import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react'
import axiosInstance from '@/helpers/base/axios'
import { toast } from 'react-toastify'
import Spinner from './spinner';
import classNames from 'classnames';
import Resizer from '@/helpers/base/resizer';
import { TrashIcon } from '@heroicons/react/20/solid';

const MultipleImageSceneElement = function (props: { id: string, image: string, onChange: (image: string) => void }) {

    console.log(props.image);

    async function fileSelected (event: React.ChangeEvent<HTMLInputElement>) {
        // Resize before adding
        const file = event.target.files?.[0];
        if (file) {
            // Resize image using Promise
            const image = new Promise<string>((resolve, reject) => {
                Resizer.imageFileResizer(
                    file,
                    512,
                    512,
                    'JPEG',
                    80,
                    0,
                    (uri: any) => {
                        resolve(uri);
                    },
                    "base64",
                    200,
                    200
                );
            });
            image.then((file) => {
                props.onChange(file);
            });
        }
    }

    return (
        <div
            className='relative w-full h-full cursor-pointer'
            onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = false;
                input.onchange = fileSelected as any;
                input.click();
            }}
        >
            {/* Show empty image placeholder if no image */}
            {props.image ? (
                <img
                    src={props.image}
                    className='object-cover w-full h-full'
                />
            ) : (
                <div
                    className='flex flex-col items-center justify-center w-full h-full'
                >
                    <span
                        className='text-gray-400'
                    >
                        No Image
                    </span>
                </div>
            )}
        </div>
    );
}

interface MultipleImagesSceneProps {
    id: string,
    title: string,
    description: string,
    required: boolean,
}
interface MultipleImageProps extends React.HTMLAttributes<HTMLDivElement> {
    value: { id: string, image: string }[],
    scenes: MultipleImagesSceneProps[],
    onChange?: React.FormEventHandler<HTMLDivElement>,
}
const MultipleImage = forwardRef<HTMLDivElement, MultipleImageProps>((props, ref) => {

    const { value, scenes, onChange, ...restProps } = props;

    console.log(value);

    // Show squares with images. Click or drag and drop to change image. Flex row with wrap.
    // Show title and description. Show required label if required.
    // Show a button to remove image.
    return (
        <div
            className={classNames(
                'flex flex-row flex-wrap items-start justify-start w-full',
                restProps.className
            )}
        >
            {scenes.map((sceneItem) => (
                <div
                    key={sceneItem.id}
                    className='flex flex-col items-start justify-start w-1/2 p-4'
                >
                    <div
                        className='flex flex-row items-center justify-center w-full'
                    >
                        <span
                            className='font-semibold'
                        >
                            {sceneItem.title}
                        </span>
                        {sceneItem.required && (
                            <span
                                className='text-red-500 ml-1'
                            >
                                *
                            </span>
                        )}
                        <button
                            className='ml-auto'
                            onClick={() => {
                                const _value = value || [];
                                const index = _value.findIndex((item) => item.id === sceneItem.id);
                                if (index !== -1) {
                                    _value.splice(index, 1);
                                    onChange?.({
                                        value: _value,
                                    } as any);
                                }
                            }}
                        >
                            <TrashIcon className='h-4 w-4' />
                        </button>
                    </div>
                    {/* Image container */}
                    <div
                        className='border border-gray-300 w-full aspect-1 mt-2'
                    >
                        <MultipleImageSceneElement
                            id={sceneItem.id}
                            image={value?.find((item) => item.id === sceneItem.id)?.image || ''}
                            onChange={(image) => {
                                const _value = value || [];
                                if (_value.find((item) => item.id === sceneItem.id)) {
                                    _value.find((item) => item.id === sceneItem.id)!.image = image;
                                }
                                else {
                                    _value.push({
                                        id: sceneItem.id,
                                        image: image,
                                    });
                                }
                                onChange?.({
                                    value: _value,
                                } as any);
                            }}
                        />
                    </div>

                </div>
            ))}
        </div>
    );
});

// Set display name
MultipleImage.displayName = 'MultipleImage';

export default MultipleImage;
export type { MultipleImageProps, MultipleImagesSceneProps };