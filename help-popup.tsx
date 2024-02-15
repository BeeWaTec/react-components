/*
    A component that displays a help popup - Also a modal with header and body (defined by Markdown)
*/

import { faTimes } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw';

interface Props {
    visible: boolean;
    onHide: () => void;
    header: string;
    body: string;
}
export const HelpPopup = (props: Props) => {

    // On multiline markdown, remove leading whitespace, because it breaks the layout
    // Also on every line
    const body = props.body
        .replace(/^[ \t]+/gm, '')
        .replace(/\n[ \t]+/gm, '\n');

    return (
        <div
            className={classNames(
                'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300',
                { 'opacity-100 pointer-events-auto': props.visible },
                { 'opacity-0 pointer-events-none': !props.visible },
            )}
            onClick={props.onHide}
        >
            <div
                className="bg-white rounded-md shadow-md overflow-hidden w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center bg-primary-1 text-primary-1-text p-4">
                    <span className="text-lg font-semibold">{props.header}</span>
                    <button onClick={props.onHide}>
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    </button>
                </div>
                <div className="m-4">
                    <Markdown
                        rehypePlugins={[rehypeRaw]}
                    >
                        {body}
                    </Markdown>
                </div>
            </div>
        </div>
    );
};

export default HelpPopup;