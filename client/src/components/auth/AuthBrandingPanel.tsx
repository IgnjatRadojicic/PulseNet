import { Link } from 'react-router-dom';

interface Props {
    heading: string;
    subtext: string;
}

export default function AuthBrandingPanel({ heading, subtext }: Props) {
    return (
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-border-subtle">
            <Link to="/" className="no-underline">
                <div className="font-syne text-white font-black text-2xl tracking-tight">
                    Pulse<span className="text-pulse">Net</span>
                </div>
            </Link>
            <div>
                <h1
                    className="font-syne text-white font-black mb-4 text-subhead"
                    style={{ lineHeight: '1', letterSpacing: '-0.03em' }}
                    dangerouslySetInnerHTML={{ __html: heading }}
                />
                <p className="text-sm font-light leading-loose text-muted-soft max-w-sm">
                    {subtext}
                </p>
            </div>
            <p className="text-xs font-light tracking-wider text-muted-whisper">
                Distributed social infrastructure
            </p>
        </div>
    );
}