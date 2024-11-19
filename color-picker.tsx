import classNames from "classnames";
import { forwardRef } from "react";

interface ColorPickerProps {
    value?: string;
    values?: {
        name: string;
        textWhite: boolean;
        ral?: string;
        value: string;
        color: string;
        textureFile?: string;
    }[]
    onChange?: (value: string) => void;
}
const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>((props, ref) => {
    const handleColorChange = (value: string) => {
        if (props.onChange) {
            props.onChange(value);
        }
    };
    return (
        <>
            <div
                ref={ref}
                className='grid grid-cols-4 h-full w-full overflow-y-scroll p-3'
            >
                {props.values?.map((item, index) => (
                    <button
                        key={index}
                        className={classNames(
                            `relative px-4 py-2 text-sm font-medium w-full ${item.textWhite ? 'text-white' : 'text-gray-800'}`,
                            `aspect-1`,
                            `border-2 border-gray-300 rounded-md`,
                            `flex flex-col items-center justify-center`,
                            `transition-transform duration-300`,
                            `scale-100`,
                            { 'scale-75 hover:scale-95': item.value !== props.value },
                        )}
                        style={{ backgroundColor: item.color }}
                        onClick={() => { handleColorChange(item.value) }}
                    >
                        {item.textureFile && (
                            <img
                                src={`/color-picker/${item.textureFile}`}
                                className='absolute inset-0 w-full h-full object-cover z-10'
                                alt={`${item.name} texture`}
                            />
                        )}
                        <div
                            className='flex flex-col items-center justify-center z-20'
                        >
                            <span
                                className='text-lg'
                            >
                                {item.name}
                            </span>
                            <span
                                className="absolute bottom-0 right-0 text-sm mb-1 mr-1"
                            >
                                {item.ral}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );
});
ColorPicker.displayName = "ColorPicker"; export default ColorPicker;