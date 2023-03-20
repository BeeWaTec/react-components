interface PatternType {
}
function PatternType1({}: PatternType) {
    return (
        <div>
            <svg
                className="absolute right-full transform translate-y-1/3 translate-x-1/4 md:translate-y-1/2 sm:translate-x-1/2 lg:translate-x-full"
                width={404}
                height={784}
                fill="none"
                viewBox="0 0 404 784"
            >
                <defs>
                    <pattern
                        id="b0347ad0-dc76-521b-9c04-9ac8acdef0d9"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect
                            x={0}
                            y={0}
                            width={4}
                            height={4}
                            className={`text-gray-200`}
                            fill="currentColor"
                        />
                    </pattern>
                </defs>
                <rect
                    width={404}
                    height={784}
                    fill="url(#b0347ad0-dc76-521b-9c04-9ac8acdef0d9)"
                />
            </svg>
            <svg
                className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
                width={404}
                height={784}
                fill="none"
                viewBox="0 0 404 784"
            >
                <defs>
                    <pattern
                        id="fa37f931-e267-55e6-b10a-7bc59de8d7eb"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect
                            x={0}
                            y={0}
                            width={4}
                            height={4}
                            className={`text-gray-200`}
                            fill="currentColor"
                        />
                    </pattern>
                </defs>
                <rect
                    width={404}
                    height={784}
                    fill="url(#fa37f931-e267-55e6-b10a-7bc59de8d7eb)"
                />
            </svg>
        </div>
    );
}

function PatternType2({}: PatternType) {
    return (
        <div>
            <svg
                className="absolute top-full left-0 transform translate-x-80 -translate-y-24 lg:hidden"
                width={784}
                height={404}
                fill="none"
                viewBox="0 0 784 404"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id="e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect
                            x={0}
                            y={0}
                            width={4}
                            height={4}
                            className={`text-gray-200`}
                            fill="currentColor"
                        />
                    </pattern>
                </defs>
                <rect
                    width={784}
                    height={404}
                    fill="url(#e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32)"
                />
            </svg>

            <svg
                className="hidden lg:block absolute right-full top-1/2 transform translate-x-1/2 -translate-y-1/2"
                width={404}
                height={784}
                fill="none"
                viewBox="0 0 404 784"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id="56409614-3d62-4985-9a10-7ca758a8f4f0"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect
                            x={0}
                            y={0}
                            width={4}
                            height={4}
                            className={`text-gray-200`}
                            fill="currentColor"
                        />
                    </pattern>
                </defs>
                <rect
                    width={404}
                    height={784}
                    fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)"
                />
            </svg>
        </div>
    );
}

export { PatternType1, PatternType2 };
